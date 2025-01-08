# ark_error.py
# Error handling for Ark
import json

class ArkError:
    """ An interface for generating and returning errors. """

    error_codes = json.load(open("lib/json/error_codes.json"))
    err = error_codes["authorization_error_responses"]
    aug = error_codes["error_augments"]

    def __init__(self, base, augment=None):
        """ Initialize err_id to the first parameter provided.

        If the error has multiple versions (e.g., invalid_request,
        invalid_request_code_challenge, etc.) then the version is
        specified via the augment (e.g., augment="_transformation").
        The appropriate error message is retrieved from error_codes.json.
        """
        self.err_id = base
        if augment is not None:
            self.err_desc = self.aug[base][augment]
        else:
            self.err_desc = self.err[base]


    def get_json(self):
        """ Returns the error and description in JSON format. """
        return {'error':self.err_id, 'error_description':self.err_desc}


    def get_respondable_json(self):
        """ Returns the error and description in the following format:
        {"data": {"error": error, "error_description": error_description}}
        That is, a single-key JSON where the key "data" is a dictionary that
        contains the JSON of the error.
        """
        return {"data": self.get_json()}
