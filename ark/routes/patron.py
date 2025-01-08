# patron.py
from flask import Blueprint, request, jsonify, abort, make_response
import json

# Ark libraries
import sys
sys.path.append("..")
from lib import *

patron = Blueprint('patron', __name__,)

# Require authorization to proceed
@patron.before_request
def validate_patron_authentication():
    """ Validates that each request has a valid access token """
    token = ArkParameters(request).validate_jwt(scope=6)
    if "error" in token:
        token = ArkParameters(request).validate_jwt(scope=0)
        if "error" in token:
            abort(401, token)
        
@patron.errorhandler(401)
def patron_bad_access(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description['error_description'] != 'DONOTRETURN':
        resp = make_response(jsonify(error.description), 401)
    else:
        resp = make_response("", 401)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp
        

# Test
@patron.route("/devices/test", methods=["GET"])
def devicestest():
    print("hello")
    return jsonify("hello")


# Resource routes
@patron.route("/vendor/assign_patron/<vendor_id>", methods=["GET"])
def assign_device_to_patron_with_vendor(vendor_id):
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()
    if vendor_id != sub:
        return ArkError("invalid_request", "_malformed_token").get_respondable_json()

    # TODO: Validate parameters (check blacklight/routes/auth.py)
    # Get patron_id, device_id (identifierForVendor) from data
    try:
        patron_id = request.args.get('patron_id')
        device_id = request.args.get('device_id')
    except:
        print("missing patron_id or device_id")
       
    # Assign patron to this device
    db = Ark()
    assignment_status = db.assign_device_to_patron_with_vendor(device_id, patron_id, vendor_id)
    
    return jsonify(assignment_status)

    
@patron.route("/vendor/<uuid>/patron_roster", methods=["GET"])
def ven_get_patron_roster(uuid):
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()
    if uuid != sub:
        return ArkError("invalid_request", "_malformed_token").get_respondable_json()
    db = Ark()

    # TODO: Patrons from different vendors? Or the same patron shared?
    roster = db.get_all_patrons()
    data = {"data": roster}
    return jsonify(data)


@patron.route("/devices/add_connection", methods=["POST"])
def cli_add_connection():
    """ Retrieves the patron ID from the POST request and checks it against
    the database. If it is a registered patron, add their request to the
    table of incoming requests. Otherwise, ignore it.
    """
    # Get data from JSON (POST)
    data = request.json['data']

    # Get uuid from data
    uuid = data['uuid']
    
    db = Ark()
    request_id = db.add_incoming_request(uuid)

    data = {}
    
    if request_id != -1:
        data["data"] = {"request_id": str(request_id)}
    else:
        data["data"] = ArkError("server_error").get_json()
        print(data["data"])

    print(data)
    return jsonify(data)
    
    
@patron.route("/devices/<identifierForVendor>/<request_id>", methods=["GET"])
def cli_check_connection(identifierForVendor, request_id):
    """ Checks the request status of the supplied request id.

    If the request has not been serviced, return that it has not been serviced.
    If the request has been serviced, return the Zoom meeting number and
    password of the tutor assigned to the request.
    """
    data = {}
    db = Ark()
    zoom_room = db.retrieve_zoom_meeting(request_id)
    data = {"data": zoom_room}
    print(data)
    return jsonify(data)


@patron.route("/devices/add", methods=["POST"])
def add_new_device():
    """ PEP 8 """
    provider_id = request.json["id"]
    name = request.json["name"]
    notes = request.json["notes"]
    ipad = request.json["ipad"]
    db = Ark()
    print("\n\nhere", "pid " + provider_id, "name " + name, "notes " + notes)
    returnable = db.add_new_device(provider_id, name, notes, ipad)
    return {"data": returnable}

@patron.route("/devices/<dev_id>/info", methods=["GET"])
def device_get_info(dev_id):
    db = Ark()
    lookup = db.get_device_info(dev_id)
    return jsonify(lookup)

@patron.route("/devices/get_all_organizations", methods=["GET"])
def get_all_organizations():
    db = Ark()
    lookup = db.get_all_organizations()
    return jsonify({"data":lookup})

@patron.route("/patron/join_waiting_queue", methods=["POST"])
def patron_join_waiting_queue():
    db = Ark()
    lookup = db.patron_join_waiting_queue(request.json['id'], request.json['topic'], request.json['pwd'])
    return jsonify({"data": lookup})

@patron.route("/patron/get_meeting_info", methods=["POST"])
def patron_get_meeting_info():
    db = Ark()
    lookup = db.patron_get_meeting_info(request.json['id'])
    return {"data": lookup}


@patron.route("/patron/tutor_dropped", methods={"POST"})
def tutor_dropped():
    db = Ark()
    meeting_id = request.json['id']
    
    lookup = db.tutor_dropped(meeting_id)
    return jsonify({"STATUS":lookup})

@patron.route("/patron/check_reassigned/<m_id>", methods=["GET"])
def check_reassigned(m_id):
    db = Ark()
    lookup = db.patron_check_if_reasigned(m_id)
    #raise Exception(lookup)
    return jsonify(lookup)

@patron.route("/device/logonoff/<d_id>/<onoff>", methods=["GET"])
def device_logonoff(d_id, onoff):
    db = Ark()
    lookup = db.device_log_onoff(d_id, 1 if onoff == "on" else 0)
    #raise Exception(lookup)
    return jsonify(lookup)