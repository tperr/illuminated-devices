# general.py
from flask import Blueprint, request, jsonify, abort, make_response, send_from_directory
from werkzeug.utils import secure_filename
import json
import os

# Ark libraries
import sys
sys.path.append("..")
from lib import *

general = Blueprint('general', __name__,)
STATIC_FOLDER = "/var/www/ark/static/"
UPLOAD_FOLDER = "/var/www/ark/static/user/pfp"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# No "before_request" authorization here
# Some routes don't require it, others require it at different levels of strictness
# (i.e., verifying the token scope vs. verifying the token user)
# So it's done in individual requests instead

@general.route("/u/<user_id>/pfp", methods=["GET"])
def get_account_pfp(user_id):
    """ PEP 8 """
    directory = UPLOAD_FOLDER
    directory = directory + "/" + user_id
    fileType = None

    if (os.path.isfile(directory + ".png")):
        fileType = ".png"
    elif (os.path.isfile(directory + ".jpg")):
        fileType = ".jpg"
    elif (os.path.isfile(directory + ".jpeg")):
        fileType = ".jpeg"
    else:
        fileType = None

    if fileType != None:
        img = user_id + fileType
        return send_from_directory(STATIC_FOLDER, 'user/pfp/' + img)
    else:
        return send_from_directory(STATIC_FOLDER, 'user/pfp/default.jpg')

@general.route("/u/<user_id>/details", methods=["GET"])
def get_account_details(user_id):
    """ PEP 8 """
    token = ArkParameters(request).validate_jwt()
    if "error" in token:
        abort(401, token)
    if token["sub"] != user_id:
        abort(401, ArkError("invalid_request", "_access_denied").get_json())

    db = Ark()
    account_details = db.get_account_details(user_id)
    #raise Exception(account_details)
    return {"data": account_details}

@general.route("/u/<user_id>/pfp/upload", methods=["POST"])
def upload_file(user_id):
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def get_format(filename):
        return filename.rsplit('.', 1)[1].lower()

    def get_other_extensions(extension):
        return [value for value in ALLOWED_EXTENSIONS if value != extension] 

    token = ArkParameters(request).validate_jwt()
    if "error" in token:
        abort(401, token)
    if token["sub"] != user_id:
        abort(401, ArkError("invalid_request", "_access_denied").get_json())

    # Check that POST request has a file
    if 'file' not in request.files:
        abort(400, ArkError("invalid_request", "_missing_file").get_json())
    file = request.files['file']
    if file.filename == '':
        abort(400, ArkError("invalid_request", "_missing_file").get_json())
    if file and allowed_file(file.filename):
        # Get file extension
        extension = file.filename.split('.')[1]
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        
        # Try to delete any other images, if they exist
        # Crop right now ONLY uploads as .jpeg so this doesn't matter 
        # but maybe..? 
        other_extensions = get_other_extensions(extension)
        for extension in other_extensions:
            try:
                file_to_rem = user_id + "." + extension
                os.remove(os.path.join(UPLOAD_FOLDER, file_to_rem))
            except Exception as e:
                pass
        return jsonify("ok") # working on dis
    """ PEP 8 """
    return jsonify("end of upload_file"); #working on dis


@general.route("/zoom/get_api", methods=["GET"])
def get_api_credentials():
    credentials = json.load(open("./lib/json/zoom_api.json"))
    api_key = credentials["sdk"]
    return jsonify(api_key)
        