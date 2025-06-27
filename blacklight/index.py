from flask import Flask, jsonify, request, session
import secrets
import json

app = Flask(__name__, root_path='/var/www/blacklight')


# Key
#SECRET_KEY = json.load(open('./lib/json/client_identifiers.json'))['app']['key']
#app.secret_key = SECRET_KEY

from routes.auth import auth
import json
import sys
import mariadb
from lib import *

import logging

logging.basicConfig(filename='/var/www/blacklight/blight.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s %(name)s %(message)s')
logger=logging.getLogger(__name__)
#logger.addFilter(NoPingPongFilter)

sys.stderr.write = logger.error
sys.stdout.write = logger.debug

app.register_blueprint(auth, url_prefix='/blacklight/')

print("Starting Blacklight...")

# Test route 1
@app.route("/t", methods=["GET"])
def t2():
    Blacklight().split_authorization("OTk3Njk3OTI1MTIxMzEwNzU6M0FDOUJGOTNDQzFBNjEwQ0QxNzYwQTU0RjgzRTI5Mzg0M0Y2QkNCMDZFOTZDMjlERTAzMTI1Nzk2QzM0OTQzQQ==")
    return jsonify("ok")

# Test route 2
@app.route("/blacklight/tt", methods=["GET"])
def t3():
    return jsonify({"ttResponseType": "ok"})

# Test route 3
@app.route("/blacklight/tt/onepath", methods=["GET"])
def t4():
    return jsonify("onepath ok")

# Test route 4
@app.route("/blacklight/tt/onepath/twopath", methods=["GET"])
def t5():
    return jsonify("onepath twopath ok")

@app.route("/blacklight/u/<user_id>/name", methods=["GET"])
def get_username_from_id(user_id):
    """ PEP 8 """
    db = Blacklight()
    account_details = db.get_username_from_id(user_id)

    return {"data": account_details}
