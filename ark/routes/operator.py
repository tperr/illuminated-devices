# operator.py 
from flask import Blueprint, request, jsonify, abort, make_response

# Ark libraries
import sys
sys.path.append("..")
from lib import *

switchboard_operator = Blueprint('switchboard_operator', __name__,)

# Require authorization to proceed                                                                                                                   
@switchboard_operator.before_request
def validate_switchboard_operator_authentication():
    """ Validates that each request has a valid access token. """
    token = ArkParameters(request).validate_jwt(scope=3)
    if "error" in token:
        abort(401, token)


@switchboard_operator.errorhandler(401)
def switchboard_operator_bad_access(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description['error_description'] != 'DONOTRETURN':
        resp = make_response(jsonify(error.description), 401)
    else:
        resp = make_response("", 401)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp


@switchboard_operator.route("/so/tutors", methods=["GET"])
def so_get_available_tutors():
    """ Returns the dictionary of available Tutors.
    If no Tutors are available, returns an empty JSON.
    """
    db = Ark()
    lookup = db.get_available_tutors()

    return jsonify(lookup)

@switchboard_operator.route("/so/con", methods=["GET"])
def so_get_waiting_connections():
    """ Returns the dictionary of Patrons currently waiting.
    If no Patrons are currently waiting, returns an empty JSON.
    """
    db = Ark()
    lookup = db.get_waiting_connections()

    return jsonify(lookup)


@switchboard_operator.route("/so/con", methods=["POST"])
def so_update_connection():
    """ Assigns a tutor_id to a request_id, creating a new entry in the
    serviced_requests table and changing the serviced attribute to 1 for
    the request_id in the incoming_requests table.
    """
    db = Ark()
    
    # Unpack JSON
    r_id = request.json['request_id']
    t_id = request.json['tutor_id']

    lookup = db.service_request(r_id, t_id)
    
    return jsonify({"EXIT_STATUS":lookup})
