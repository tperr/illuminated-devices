# general.py
from flask import Blueprint, request, jsonify, abort, make_response
import json
import os

# Ark libraries
import sys
sys.path.append("..")
from lib import *
from socketer import handle_check_inout

provider = Blueprint('provider', __name__,)

# Require authorization to proceed
@provider.before_request
def validate_patron_authentication():
    """ Validates that each request has a valid access token """
    token = ArkParameters(request).validate_jwt(scope=6)
    if "error" in token: # for devices, requires some functionality from here
        token = ArkParameters(request).validate_jwt(scope=5) # Location
        if "error" in token:
            token = ArkParameters(request).validate_jwt(scope=4) # Organization
            if "error" in token:
                token = ArkParameters(request).validate_jwt(scope=0) # Developer
                
                if "error" in token:
                    abort(401, token)

        
@provider.errorhandler(401)
def provider_bad_access(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description['error_description'] != 'DONOTRETURN':
        resp = make_response(jsonify(error.description), 401)
    else:
        resp = make_response("", 401)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp

@provider.route("/u/<user_id>/devices", methods=["GET"])
def get_devices(user_id):
    """ PEP 8 """
    db = Ark() 
    
    returnable = db.get_devices(user_id)

    returnable_sorted = sorted(returnable, key=lambda k: (k['status'], k['name']))

    return {"data": returnable_sorted}

@provider.route("/u/<user_id>/patrons", methods=["GET"])
def get_patrons(user_id):
    """ PEP 8 """
    db = Ark() 
    
    returnable = db.get_patrons(user_id)

    returnable_sorted = sorted(returnable, key=lambda k: (k['fname'], k['lname']))

    return {"data": returnable_sorted}


@provider.route("/u/<user_id>/organizations", methods=["GET"])
def get_organization_locations(user_id):
    """ PEP 8 """
    db = Ark() 
    
    returnable = db.get_organization_locations(user_id)

    returnable_sorted = sorted(returnable, key=lambda k: (k['name'], k['registration_date']))

    return {"data": returnable_sorted}


@provider.route("/checkout", methods=["POST"])
def checkout_device_to_patron():
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json['data']

    try:
        provider = data["provider"]
        device = data["device"]
        patron = data["patron"]
        last_checkout = data["last_checkout"]
        return_date = data["return_date"]

        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()

        returnable = db.checkout_device_to_patron(provider, device, patron, int(last_checkout), int(return_date))
        # handle_check_inout(device, True)
        return {"data": returnable}
        
    except Exception as e:
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()


@provider.route("/checkin", methods=["POST"])
def checkin_device_from_patron():
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json['data']

    try:
        provider = data["provider"]
        device = data["device"]
        patron = data["patron"]

        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()

        returnable = db.checkin_device_from_patron(provider, device, patron)
        return {"data": returnable}
        
    except Exception as e:
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()


@provider.route("/device/update", methods=["POST"])
def update_device_information():
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json['data']

    try:
        provider = data["provider"]
        device = data["device"]
        name = data["name"]
        bsid = data["bsid"]
        home_location_id = data["home_location_id"]
        current_location_id = data["current_location_id"]
        notes = data["notes"]
        command_number = data["command_number"]

        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()

        returnable = db.update_device_information(provider, device, name, bsid, home_location_id, current_location_id, notes, int(command_number))
        return {"data": returnable}
        
    except Exception as e:
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()


@provider.route("/device/log", methods=["POST"])
def get_device_log():
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json['data']

    try:
        provider = data["provider"]
        device = data["device"]

        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()

        returnable = db.get_device_log(provider, device)
        return {"data": returnable}
        
    except Exception as e:
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()


@provider.route("/patron/log", methods=["POST"])
def get_patron_log():
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json["data"]

    try:
        provider = data["provider"]
        patron = data["patron"]

        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()

        returnable = db.get_patron_log(provider, patron)
        return {"data": returnable}
        
    except Exception as e:
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()


@provider.route("/patron/update", methods=["POST"])
def update_patron_information():
    """ PEP 8 """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json['data']
    try:
        provider = data["provider"]
        patron_id = data["patron_id"]
        fname = data["fname"]
        lname = data["lname"]
        bsid = data["bsid"]
        birthday = data["birthday"]
        email = data["email"]
        phone = data["phone"]
        street_address = data["street_address"]
        city = data["city"]
        state = data["state"]
        new_zip = data["zip"]
        notes = data["notes"]
        command_number = data["command_number"]
        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()
        returnable = db.update_patron_information(provider, patron_id, fname, lname, bsid, birthday, email, phone, street_address, city, state, new_zip, notes, int(command_number))
        return {"data": returnable}
        
    except Exception as e:
        return {"data": str(e)}
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()


@provider.route("/patron/add", methods=["POST"])
def add_new_patron():
    """ Adds a new patron to the patron_roster for the provided organization. 
    Returns the a status code depending on if the new patron could be 
    inserted or not. If the POST body or any column is missing from
    the request, an invalid_request is returned. In the case of duplicate
    unique fields, the returned status code will indicate which error was
    encountered.
    """
    sub = ArkParameters(request).get_uuid_from_jwt()

    # Get data from JSON (POST)
    data = request.json['data']

    try:
        provider = data["provider"]
        fname = data["fname"]
        lname = data["lname"]
        bsid = data["bsid"]
        birthday = data["birthday"]
        email = data["email"]
        phone = data["phone"]
        street_address = data["street_address"]
        city = data["city"]
        state = data["state"]
        new_zip = data["zip"]
        notes = data["notes"]

        # Validate that the provider making the request is the provider provided in the POST
        if provider != sub:
            return ArkError("invalid_request", "_malformed_token").get_respondable_json()

        db = Ark()

        returnable = db.add_new_patron(provider, fname, lname, bsid, birthday, email, phone, street_address, city, state, new_zip, notes)
        return {"data": returnable}
        
    except Exception as e:
        return ArkError("invalid_request").get_respondable_json()

    return ArkError("invalid_request").get_respondable_json()

