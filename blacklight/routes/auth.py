# auth.py
from flask import Blueprint, request, jsonify, render_template, \
    flash, redirect, url_for, session, make_response          # Flask necessities
# External Libraries
import json
import os
import sys
import base64
# FOR TEMP ROUTE
import jwt
import datetime
import time
import urllib
# Blacklight libraries
sys.path.append("..")
from lib import *
auth = Blueprint('auth', __name__,)
private_key = open('lib/keys/private.pem').read()

# TEMPORARY ROUTE
@auth.route("/api/authenticate_switchboard", methods=["GET"])
def authorize_switchboard():
    """ TEMPORARY ROUTE
    Generates a signed JWT for the switchboard operator.
    This is only used for testing the Python client, as it cannot
    pass the authorization checks (i.e., it doesn't have a client ID,
    secret, at this time).
    """
    # create JWT
    global private_key

    expiry = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).timestamp()
    expiry += 86400 # One day                                                                        

    payload = {"iss":"illuminated.cs.mtu.edu",
               "sub":"000000",
               "purpose":"access_token",
               "aud":"MTU Ark Prototype",
               "exp":expiry,
               "scope":3}
    encoded = jwt.encode(payload, private_key, algorithm="ES256")
    json = {"jwt":encoded}
    resp = make_response(json)
    resp.set_cookie("Test", "True", httponly=True) # httponly
    resp.set_cookie("Name", "Kirk", expires=0) # to delete a cookie just set expires=0
    return resp

# Routes
@auth.route("/api/authenticate_client/", methods=["GET"])
def authenticate():
    """ Validates a client for logging in to Blacklight..
    The client MUST provide a response_type, client_id, redirect_uri,
    code_challenge_method, and code_challenge. 

    If the client_id and redirect_uri match a valid (and active) client in
    blacklight.client_listings and the response_type and code_challenge_method
    are valid, then the client is redirected to the login page, passing these
    as parameters.
    """
    global private_key
    
    params = ["response_type", "client_id", "redirect_uri", \
              "code_challenge_method", "code_challenge"]
    invalid_arguments = BlacklightParameters(request).validate_args(params)
    if len(invalid_arguments) > 0:
        if "code_challenge" in invalid_arguments:
            return BlacklightError("invalid_request", "_code_challenge").get_respondable_json()
        elif "code_challenge_method" in invalid_arguments:
            return BlacklightError("invalid_request", "_transformation").get_respondable_json()
        else:
            return BlacklightError("invalid_request").get_respondable_json()

    # If all parameters are present
    response_type = request.args.get('response_type')
    client_id = request.args.get('client_id')
    redirect_uri = request.args.get('redirect_uri')
    code_challenge_method = request.args.get('code_challenge_method')
    code_challenge = request.args.get('code_challenge')

    try:
        # Verify response_type is code and code_challenge_method is S256
        if response_type != 'code':
            return BlacklightError("invalid_request").get_respondable_json()

        if code_challenge_method != 'S256':
            return BlacklightError("invalid_request", "_transformation").get_respondable_json()
            
        # Verify client_id is numeric
        try:
            client_id = int(client_id)

        except ValueError as e:
            return BlacklightError("unauthorized_client").get_respondable_json()
        # Authenticate client
        db = Blacklight()
        code = db.authenticate_client(client_id, redirect_uri)
        # return {"id":client_id, "r": redirect_uri}
        if code != 'authorized_client':
            return BlacklightError("unauthorized_client").get_respondable_json()
        else:
            # Sign authenticated client
            expiry = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).timestamp()
            expiry += 86400
            payload = {"iss":"illuminated.cs.mtu.edu",
                       "aud":"MTU Blacklight",
                       "purpose":"client_authentication",
                       "client_id": client_id,
                       "redirect_uri": redirect_uri,
                       "code_challenge_method": code_challenge_method,
                       "code_challenge": code_challenge
            }

            encoded = jwt.encode(payload, private_key, algorithm="ES256")
            grant = {"grant":encoded}
            
            # Return a signed JWT proving the client has authenticated
            return {"data": grant}
    except Exception as e:
        # Could log exception error here print(e)
        return BlacklightError("server_error").get_respondable_json()


@auth.route("/api/client_login", methods=["POST"])
def api_login():
    """ Validates a user's credentials and generates and returns an access
    code if they are valid.

    This page should is only accessible by a client that passes the
    authorization step. Unauthorized sessions will return a generic not
    found page.
    """
    global private_key
    
    # Check for header
    header = request.headers.get("Authorization")
    if header is None:
        return BlacklightError("invalid_request", "_no_token").get_respondable_json()
    if not header.startswith('Basic '):
        return BlacklightError("invalid_request", "_malformed_token").get_respondable_json()

    # Split token from header
    token = [x.strip() for x in header.split("Basic")][1]
    # Check client's grant
    grant = request.json["grant"]

    try:
        decoded = jwt.decode(grant, \
                             private_key, \
                             audience="MTU Blacklight", \
                             issuer="illuminated.cs.mtu.edu", \
                             algorithms=["ES256"], \
                             options={"verify_signature":True, \
                                      "verify_audience":True, \
                                      "verify_exp": True, \
                                      "verify_iss": True}
                             )
        db = Blacklight()

        try:
            credentials = db.decode_authorization(token, split=True)
        except Exception as e:
            return BlacklightError.custom_json(str(e), "The authorization code could not be decoded by Blacklight (it may be malformed in some way, or some other error has occured).")

        client_id = decoded["client_id"]
        redirect_uri = decoded["redirect_uri"]
        code_challenge = decoded["code_challenge"]
        code_challenge_method = decoded["code_challenge_method"]
        rr_uri = db.authenticate_user(client_id, \
                                      redirect_uri, \
                                      credentials[0], \
                                      credentials[1], \
                                      code_challenge, \
                                      code_challenge_method)
        
        if rr_uri == "access_denied":
            return BlacklightError("access_denied").get_respondable_json()
        elif rr_uri == "invalid_scope":
            return BlacklightError("invalid_scope").get_respondable_json()
        elif rr_uri == "server_error":
            return BlacklightError("server_error").get_respondable_json()
        
        # return redirect URI
        return redirect(rr_uri, code=302)
    except Exception as e:
        return BlacklightError.custom_json(str(e))
        return BlacklightError("invalid_token").get_respondable_json()

    
@auth.route('/blacklight/test/token', methods=["GET"])
def test_token():
    """TEST"""
    db = Blacklight()
    generated = db.get_new_tokens_from_test(True, True, True, True)
    print(generated)
    return jsonify('ok')


@auth.route('/api/token', methods=["GET"])
def token():
    """ Submits a request for an access token.
    Requires the parameters grant_type, code, redirect_uri, client_id, and
    code_verifier.
    
    If all parameters are present and valid, an access code is returned appended
    to the redirect_uri with the parameter code (e.g., if the given uri is
    illuminateddevices0:// then the returned appended uri would be
    illuminateddevices0://code?=123456789
    """
    params = ["grant_type", "code", "redirect_uri", "client_id", "code_verifier"]
    invalid_arguments = BlacklightParameters(request).validate_args(params)
    
    if len(invalid_arguments) > 0:
        return jsonify(BlacklightError("invalid_request").get_respondable_json())
    else:
        grant_type = request.args.get('grant_type')
        code = request.args.get('code')
        redirect_uri = request.args.get('redirect_uri')
        client_id = request.args.get('client_id')
        code_verifier = request.args.get('code_verifier')
    try:
        # Verify grant_type is authorization_code
        if grant_type != 'authorization_code':
            return jsonify(BlacklightError("invalid_request").get_respondable_json())
                        
        # Verify client_id is numeric
        try:
            client_id = int(client_id)
        except ValueError as e:
            return jsonify(BlacklightError("unauthorized_client").get_respondable_json())
            
        # Authenticate client
        db = Blacklight()
        authentication = db.authenticate_client(client_id, redirect_uri)
        if authentication != 'authorized_client':
            return jsonify(BlacklightError("unauthorized_client").get_respondable_json())
        else:
            # Complete code challenge
            challenge = db.complete_code_challenge(code_verifier)

            # Authenticate authorization_code and generate access token
            generated_tokens = db.get_new_tokens_from_login(c_id=client_id, \
                                                            r_uri=redirect_uri, \
                                                            auth=code, \
                                                            code_chal=challenge)

            # DEBUG
            # print(f"Generated Dict: {generated_tokens}")
            
            # TODO: Remove refresh_token from generated_tokens json
            # TODO: Set expiry for refresh_token, can be done with the set_cookie (just like deleting)
            # --> It's still in here right now because the iPad App expects it and it will break the app if you remove it
            # --> However the website should completely ignore this element of the json because it WILL be removed in the future when the App is updated
            # It can be expected that, in the future, a response will have:
            # 1. set_cookie for refresh_token (httponly, samesite strict)
            # 2. response body for access_token (key: jwt)
            # Recall that for app purposes the response has to be in the form "data": { "jwt": { key } }
            # The wrapping "data" can't be removed because of a Swift limitation 
            json = {
                    "data": {
                        "jwt": generated_tokens['jwt'],
                        "refresh_token": generated_tokens['refresh_token'],  #TODO: Remove when App is updated?
                        "session": generated_tokens['session']
                        }
                }
            resp = make_response(json)
            current_time = time.time()
            try:
                cookie_time = datetime.datetime.strptime(str(generated_tokens['refresh_token_expires']), '%Y-%m-%d %H:%M:%S')
                cookie_time = cookie_time.timestamp() - float(current_time)
            except Exception as e:
                print(e)
                cookie_time = (60 * 60 * 24 * 30) # Fallback 

            resp.set_cookie("refresh_token", json["data"]["refresh_token"], httponly=True, samesite="Strict", secure=True, max_age=cookie_time)
            return resp

            #return jsonify({'data': generated_tokens})
    except Exception as e:
        print("Exception in /token")
        print(e)
        return jsonify(BlacklightError("server_error").get_respondable_json())


@auth.route('/api/token/refresh', methods=["GET"])
def refresh_token():
    """ Generates new access and refresh tokens from an existing refresh
    token. Requires the existing refresh token to have been sent as a 
    cookie with the request.

    Note that the refresh token cookie should be httpOnly and strictly same-site. 
    """
    try:
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token is not None:
            # print(refresh_token); 
            db = Blacklight()
            generated_tokens = db.get_new_tokens_from_refresh(signed_refresh_token=refresh_token)
            # return {"g":generated_tokens, "r": refresh_token}
            if "error" in generated_tokens:
                return generated_tokens

            json = {
                    "data": {
                        "jwt": generated_tokens['jwt'],
                        "refresh_token": generated_tokens['refresh_token'],  #TODO: Remove when App is updated
                        "session": generated_tokens['session']
                        }
                }
            
            resp = make_response(json)
            current_time = time.time()
            try:
                cookie_time = datetime.datetime.strptime(str(generated_tokens['refresh_token_expires']), '%Y-%m-%d %H:%M:%S')
                cookie_time = cookie_time.timestamp() - float(current_time)
            except Exception as e:
                print(e)
                cookie_time = (60 * 60 * 24 * 30) # Fallback 
        
            resp.set_cookie("refresh_token", json["data"]["refresh_token"], httponly=True, samesite="Strict", secure=True, max_age=cookie_time)
            return resp    
        else:
            json = BlacklightError("invalid_token", "_no_refresh_token").get_respondable_json()
            resp = make_response(json)
            return resp
    except Exception as err:
        return BlacklightError.custom_json(str(err), "What is it?")
        #return BlacklightError.custom_json("refresh_token_err", "custom json")
        #return BlacklightError("server_error").get_respondable_json()


@auth.route('/api/token/logout', methods=["GET"])
def logout():
    """ PEP8
    """
    try:
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token is not None:
            db = Blacklight()
            db.logout_and_delete_refresh_token(signed_refresh_token=refresh_token)
            json = BlacklightError("logout_request").get_respondable_json() 
        else:
            json = BlacklightError("logout_request").get_respondable_json()
        resp = make_response(json)
        resp.set_cookie("refresh_token", "null", httponly=True, samesite="Strict", secure=True, max_age=0)
        return resp
    except Exception as err:
        return BlacklightError.custom_json(str(err), "What is it?")
        #return BlacklightError.custom_json("refresh_token_err", "custom json")
        #return BlacklightError("server_error").get_respondable_json()


# Unimplemented
@auth.route("/register", methods=["GET", "POST"])
def register():
    """ PEP8 """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = Blacklight()
        # Do stuff here?
    return render_template('register.html')
