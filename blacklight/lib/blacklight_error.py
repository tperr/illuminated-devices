# blacklight_error.py
# Error handling for Blacklight
from flask import render_template, flash
import json
import os
import sys
# sys.path.append(".")

class BlacklightError:
    """ An interface for generating and returning errors. """
    
    error_codes = json.load(open("lib/json/error_codes.json"))
    err = error_codes["authorization_error_responses"]
    aug = error_codes["error_augments"]
    
    def __init__(self, base, augment=None, redirect_url=None):
        """ Initialize err_id to the first parameter provided.

        If the error has multiple versions (e.g., invalid_request, 
        invalid_request_code_challenge, etc.), then the version is specified
        via the augment (e.g., augment="_transformation").
        The appropriate error message is retrieved from error_codes.json.

        If a redirect_url is provided, it will be used if page
        (flask.render_template()) is returned. Otherwise, the default page
        "not_found.html" is used. 
        """
        self.err_id = base
        if augment is not None:
            self.err_desc = self.aug[base][augment]
        else:
            self.err_desc = self.err[base]
        self.redirect_url = redirect_url if redirect_url is not None \
            else "not_found.html"

    @staticmethod
    def custom_json(error, description=None):
        """ Returns a customized error and description in JSON format. """
        if description is None:
            description = "NA"
        return {'error':error, 'error_description':description}

    def get_json(self):
        """ Returns the error and description in JSON format. """
        return {'error':self.err_id, 'error_description':self.err_desc}


    def get_respondable_json(self):
        """ Returns the error and description in the following format:
        {"data": {"error": error, "error_description": error_description}}
        That is, a single-key JSON where the key "data" is a dictionary that
        contains the JSON of the error.
        """
        return {'data': self.get_json()}
    
    def flash_message(self):
        """ Flashes the error and description. """
        return flash(self.get_json())

    
    def render_page(self, msg=True):
        """ Renders the page defined by the redirect_url.
        
        The error message can be flashed by omitting any parameter, or by 
        passing True to the function (e.g., render_page(True) or 
        render_page(msg=True)).

        To render the page without flashing, explicitly pass False to the
        function call (e.g., render_page(False) or render_page(msg=False))
        """
        if msg:
            flash(self.get_json())
        return render_template(self.redirect_url)
