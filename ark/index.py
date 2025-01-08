from flask import Flask, jsonify, request, abort, flash, make_response
from werkzeug.utils import secure_filename
import flask_resize

import sys
import logging

app = Flask(__name__)

class NoPingPongFilter(logging.Filter):
  def filter(self, record):
    return not ('Received packet PONG' in record.getMessage() or
                'Sending packet PING' in record.getMessage())

logging.basicConfig(filename='/var/www/ark/ark.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s %(name)s %(message)s')
logger=logging.getLogger(__name__)
#logger.addFilter(NoPingPongFilter)

sys.stderr.write = logger.error
sys.stdout.write = logger.debug

from routes.operator import switchboard_operator
from routes.patron import patron
from routes.tutor import tutor
from routes.zoom import zoom
from routes.general import general
from routes.provider import provider
from routes.zoom_test import zoom_test

import json
import mariadb
import os
from lib.ark_parameters import *
from lib.ark import *



# Routes
app.register_blueprint(switchboard_operator, url_prefix='/ark/')
app.register_blueprint(patron, url_prefix='/ark/')
app.register_blueprint(tutor, url_prefix='/ark/')
app.register_blueprint(zoom, url_prefix='/ark/')
app.register_blueprint(general, url_prefix='/ark/')
app.register_blueprint(provider, url_prefix='/ark/')
app.register_blueprint(zoom_test, url_prefix='/ark/')

# Config
app.config["USE_X_SENDFILE"]
app.config["UPLOAD_FOLDER"] = "/var/www/ark/static/user/pfp"
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 # 2 MB images

# Test requests
@app.route("/ark/tt", methods=["POST"])
def tt():
    """ PEP 8 """
    print(ArkParameters(request).validate_auth())
    return jsonify("ok")
    

# If you have to authenticate a file:
# ---> Do it through API like this
# Otherwise, do it through NGINX (ugh) because it can serve static files without the API
# It's faster to just have NGINX do it, but it can't authenticate anything
# TODO: move this to NGINX :D
@app.errorhandler(401)
def bad_access1(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description != 'DONOTRETURN':
        resp = make_response(error.description, 401)
    else:
        resp = make_response("", 401)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp

@app.errorhandler(400)
def bad_access2(error):
    """ Generates an appropriate error response when 401 Unauthorized is raised """
    if error.description != 'DONOTRETURN':
        resp = make_response(error.description, 401)
    else:
        resp = make_response("", 400)
    resp.headers['WWW-Authenticate'] = 'Bearer realm="IlluminatedDevices"'
    return resp


    
##### NOTES #####
    # Check status of "ticket"
    # NOTE:
    #  can be done like this:
    #  curl -X GET -H "Content-type: application/json" -d '{"u_id":5178993528}' https://illuminated.cs.mtu.edu:5000/cli/con
    # content body not allowed in get anymore apparently
