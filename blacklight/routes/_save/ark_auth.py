# ark_auth.py
from flask import Blueprint, request, jsonify, render_template, \
    flash, redirect, url_for, session          # Flask necessities
# Blacklight libraries
from ..lib import *
# External Libraries
import json
import os
import base64

ark_auth = Blueprint('ark_auth', __name__,)

# Routes
@ark_auth.route("/ark/introspection", methods=["POST"])
def ark_authorize():
    """ Introspection endpoint for Ark.
    Allows an Ark to retrieve information about an access token from Blacklight.
 
    Ark must pass its own authorization as base64url_encoded in the
    "Authorization" header. For example, if the base64url encoding for Ark's 
    client ID and secret is 123456 then it would pass these credentials as so:
    "Authorization":"Basic 123456"

    Ark passes the access token to validate as the "token" parameter, for example:
    "token":"78910"
    """
    # RFC 7662 Section 2.1 parameters
    params = ['token', 'scope']
    missing_args = BlacklightParameters(request).validate_args(params, req_type=1)
    if len(missing_args) > 0:
        if scope in missing_args:
            return BlacklightError("invalid_request", "_no_scope").get_json()
        elif token in missing_args:
            return BlacklightError("invalid_request", "_no_access_token").get_json()
        else:
            return BlacklightError("server_error").get_json()
    
    header = request.headers.get('Authorization')
    if header is None:
        return BlacklightError("invalid_request", "_no_ark_auth").get_json()
    else:
        # Split header
        authorization = header.split('Basic ', 1)[1]
        db = Blacklight()
        token = db.service_introspection_request(authorization, \
                                                 request.json['token'], \
                                                 request.json['scope'])
        print(token)
        return jsonify(token)
