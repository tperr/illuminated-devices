# tutor.py
from flask import Blueprint, request, jsonify, abort, make_response

# Ark libraries
import sys
sys.path.append("..")
from lib import *

tutor = Blueprint('tutor', __name__,)

# Require authorization to proceed
@tutor.before_request
def validate_tutor_authentication():
    """ Validates that each request has a valid access token. """
    token = ArkParameters(request).validate_jwt(scope=2)
    
    #print(token)
    if "error" in token:
        token = ArkParameters(request).validate_jwt(scope=3)
        if "error" in token:
            if "error" in token:
                token = ArkParameters(request).validate_jwt(scope=0)

        
@tutor.errorhandler(401)
def tutor_bad_access(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description['error_description'] != 'DONOTRETURN':
        resp = make_response(jsonify(error.description), 401)
    else:
        resp = make_response("", 401)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp     


@tutor.route("/tut/profile", methods=["GET"])
def tut_profile():
    """ Returns the details associated with the tutor's id such as
    fname, lname, phone, and email.
    """
    print("in tut profile")
    sub = ArkParameters(request).get_uuid_from_jwt()
    
    db = Ark()
    profile = db.get_tutor_profile(sub)
    return jsonify(profile)
    
@tutor.route("/tut/login", methods=["POST"])
def tut_login():
    """ Adds the given tutor_id to the available_tutors table.
    """
    db = Ark()

    # Unpack JSON
    t_id = request.json['tutor_id']

    lookup = db.tutor_login(t_id)

    return jsonify({"EXIT_STATUS":lookup})

@tutor.route("/tut/readyup", methods=["POST"])
def tut_ready_up():
    """ Sets the available attribute for the given tutor_id to 1 in the 
    tutor_roster.
    """
    db = Ark()

    # Unpack JSON
    t_id = request.json['tutor_id']
    
    lookup = db.tutor_ready_up(t_id)

    return jsonify({"EXIT_STATUS":lookup})


# Tutor zoom functionality
@tutor.route("/tut/get_patron_queue", methods={"POST"})
def tut_get_patron_queue():
    tutor_id = request.json['id']

    #raise Exception(lookup)
    return jsonify({"PATRONS": func_get_patron_queue(tutor_id)})

@tutor.route("/tut/patron_join_meeting", methods={"POST"})
def tut_remove_patron_from_queue():
    db = Ark()
    meeting_id = request.json['id']
    
    lookup = db.tutor_patron_join_meeting(meeting_id)
    return jsonify({"STATUS":lookup})

@tutor.route("/tut/end_meeting", methods={"POST"})
def tut_end_meeting():
    db = Ark()
    meeting_id = request.json['id']
    
    lookup = db.tutor_end_meeting(meeting_id)
    return jsonify({"STATUS":lookup})

@tutor.route("/tut/patron_dropped", methods={"POST"})
def patron_dropped():
    db = Ark()
    meeting_id = request.json['id']
    
    lookup = db.patron_dropped(meeting_id)
    return jsonify({"STATUS":lookup})

@tutor.route("/tut/clear_queue", methods={"POST"})
def clear_queue():
    db = Ark()
    
    lookup = db.clear_queue()
    return jsonify({"STATUS":lookup})

@tutor.route("/tut/get_chats", methods=["POST"])
def get_chats():    
    tutor_id = request.json['id']

    
    return jsonify(func_get_chats(tutor_id))

@tutor.route("/tut/send_chat", methods={"POST"})
def send_message():
    db = Ark()

    t_from = request.json['from']
    t_to = request.json['to']
    msg = request.json['msg']
    
    lookup = db.tutor_send_chat(t_from, t_to, msg)
    return jsonify({"STATUS":lookup})

@tutor.route("/tut/assign_patron_to_tutor/<m_id>/<t_id>", methods={"GET"})
def assign_patron_to_tutor(m_id, t_id):
    db = Ark()
    
    lookup = db.tutor_assign_patron_to_tutor(m_id, t_id)
    return jsonify({"STATUS":lookup})

@tutor.route("/tut/logon/<t_id>", methods={"GET"})
def logon(t_id):
    db = Ark()
    
    db.tutor_log(t_id, True)
    tutorstemp = db.tutor_get_tutors()
    messages = db.tutor_get_chats(t_id)
    if messages == "NO SUCCESS":
        return {"ERROR":"couldnt get messages"}

    tutors = dict()
    for t in tutorstemp:
        if t[0] != t_id:
            tutors[t[0]] = [t, []] # [other tutor info, messages]
    for m in messages:
        # to_them? message time 
        tutors[m[0] if m[0] != t_id else m[1]][1].append((1 if m[0] == t_id else 0, m[2], m[3]))

    queue = db.tutor_get_patron_queue(t_id)

    devices = db.get_checkedout_devices()

    return jsonify({"tutors":tutors,"queue":queue, "devices":devices})

@tutor.route("/tut/logoff/<t_id>", methods={"GET"})
def logoff(t_id):
    db = Ark()
    
    result = db.tutor_log(t_id, False)

    return jsonify({"STATUS":result})

@tutor.route("/devices/checkedout_devices/", methods={"GET"})
def get_checkedout_devices():
    db = Ark()
    
    result = db.get_checkedout_devices()

    return jsonify({"devices":result})

@tutor.route("/tut/api_calls", methods=["POST"])
def api_calls():    
    tutor_id = request.json['id']
    #return jsonify({"NO":"NO"})
    payload = {
        "queue": func_get_patron_queue(tutor_id),
        "chat": func_get_chats(tutor_id),
        "tutors" : func_get_tutors()
    }
    
    return jsonify(payload)

@tutor.route("/tut/general_get_meeting_info/<m_id>/", methods={"GET"})
def general_get_meeting_info(m_id):
    db = Ark()
    
    lookup = db.general_get_meeting_info(m_id)
    return jsonify({"INFO":lookup})

@tutor.route("/tut/get_patron_notes/<p_id>/", methods={"GET"})
def get_patron_notes(p_id):
    db = Ark()
    
    lookup = db.tutor_get_patron_notes(p_id)
    print(lookup)
    return jsonify({"NOTES":lookup})


@tutor.route("/tut/update_patron_note", methods=["POST"])
def update_patron_note():    
    db = Ark()

    patron_notes = request.json['notes']
    print(patron_notes)
    payload = db.tutor_update_patron_note(patron_notes)
    
    return jsonify({"STATUS": payload})


@tutor.route("/tut/update_device_note", methods=["POST"])
def update_device_note():    
    db = Ark()

    d_id = request.json['id']
    device_note = request.json['notes']
    status = db.update_device_note(d_id, device_note)
    
    return jsonify({"STATUS": status})

def func_get_patron_queue(id):
    db = Ark()
    return db.tutor_get_patron_queue(id)

def func_get_chats(id):
    db = Ark()
    # from to msg time accid fname lname email online lonline available
    table = db.tutor_get_chats(id)
    if table == "NO SUCCESS":
        return {"ERROR":"ERROR"}
    #raise Exception(table)
    messages = dict()
    for row in table:
        person = (row[4], row[5], row[6], row[7], row[8], row[9], row[10])
        if person[0] != id:
            if person[0] not in messages.keys():
                messages[person[0]] = ((person), [])
            # to_them? message time 
            messages[person[0]][1].append((1 if row[0] == id else 0, row[2], row[3]))
    #raise Exception(messages)
    return messages

def func_get_tutors():
    db = Ark()
    return db.tutor_get_tutors()