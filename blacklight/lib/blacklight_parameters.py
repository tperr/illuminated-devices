# blacklight_parameters.py
# Class for handling parameters of requests
from flask import request
import json

class BlacklightParameters:
    """ Interface for validating and manipulating parameters passed to 
    Blacklight via HTTPS requests.
    """

    # Assess JSON instead of Database?
    # In a model with only one Ark, this is a plausible replacement to the
    # blacklight.ark_listings table
    #ark_auth = json.load(open("./blacklight/lib/json/client_identifiers.json"))['ark']

    def __init__(self, request):
        """ Initialize the class by passing the entire request. """
        self.request = request

        
    def validate_args(self, arguments, req_type=0):
        """ Takes a list of arguments (e.g., ["response_type", "client_id", ...]
        and checks the request stored in self.request for these arguments.

        The "req_type" parameter determines if the method validates parameters with
        args.get ("GET" requests) or 
        
        A list of missing arguments is returned.
        If no arguments are missing, an empty list is returned instead.
        """
        missing_arguments = []
        if req_type == 0:
            for param in arguments:
                if self.request.args.get(param) is None:
                    missing_arguments.append(param)
        else:
            data = self.request.get_json(silent=True)
            if data is None:
                missing_arguments = arguments
            else:
                for param in arguments:
                    if data.get(param) is None:
                        missing_arguments.append(param)
        return missing_arguments

                

        
