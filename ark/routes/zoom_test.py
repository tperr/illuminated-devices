# general.py
from flask import Blueprint, request, jsonify, abort, make_response
import json
import os

# Ark libraries
import sys
sys.path.append("..")
from lib import *

zoom_test = Blueprint('zoom_test', __name__,)

# Require authorization to proceed
@zoom_test.before_request
def validate_patron_authentication():
    """ Validates that each request has a valid access token """
    token = ArkParameters(request).validate_jwt(scope=0) 
    if "error" in token:
        token = ArkParameters(request).validate_jwt(scope=3) 
        if "error" in token:
            token = ArkParameters(request).validate_jwt(scope=6) 
            if "error" in token:
                abort(401, token)

@zoom_test.errorhandler(401)
def tutor_bad_access(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description['error_description'] != 'DONOTRETURN':
        resp = make_response(jsonify(error.description), 401)
    else:
        resp = make_response("", 401)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp   

@zoom_test.route("/meeting_test/get_api", methods=["GET"])
def get_api_credentials():
    credentials = json.load(open("./lib/json/zoom_api.json"))
    api_key = credentials["sdk"]
    return jsonify(api_key)
        
@zoom_test.route("meeting_test/login", methods=["post"])
def login():
    db = Ark()

    # Unpack JSON
    info = request.json["data"]

    success = db.test_login(info["name"], info["role"])

    return jsonify({"SUCCESS":success})

@zoom_test.route("/meeting_test/get_lists", methods=["GET"])
def get_lists():
    db = Ark()

    data = db.test_get_lists()
    return jsonify(data)

@zoom_test.route("/meeting_test/delete_tables", methods=["POST"])
def delete_tables():
    db = Ark()

    db.test_clear_tables()
    return jsonify({"data": "done"})

@zoom_test.route("/meeting_test/check_zoom", methods=["POST"])
def patron_check_zoom():
    db = Ark()
    info = request.json["data"]
    num = db.test_check_zoom(info["name"], info["role"])
    return jsonify({"meeting_id": num})

@zoom_test.route("/meeting_test/assign_patrons_to_room", methods=["POST"])
def assign_patrons_to_room():
    db = Ark()
    info = request.json["data"]
    result = db.test_assign_patrons_to_room(info["tutor"], info["names"])
    return jsonify({"SUCCESS": result})

@zoom_test.route("/meeting_test/get_meeting_info", methods=["POST"])
def get_meeting_info():
    db = Ark()
    info = request.json["data"]
    data = db.get_meeting_info(info["id"])
    return jsonify(data)