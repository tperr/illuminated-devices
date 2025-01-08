from flask import Blueprint, request, jsonify, redirect, abort, make_response
import json

# Ark libraries
import sys
sys.path.append("..")
from lib import *

zoom = Blueprint('zoom', __name__,)

# Zoom OAUTH Callback
@zoom.route("/zoom/oauth", methods=["GET"])
def zoom_oauth():
    """ PEP 8 """
    state = request.args.get('state')
    code = request.args.get('code')
    rr_uri = "illuminateddevices0://?state=" + state + "&code=" + code
    return redirect(rr_uri)
