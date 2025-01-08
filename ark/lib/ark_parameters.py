# ark_parameters.py
# Class for handling parameters of requests
from flask import request
from .ark_error import *
import requests # HTTPS requests
import json # open JSON
import base64
import jwt # JWT

class ArkParameters:
    """ Interface for validating and manipulating parameters passed to
    Ark via HTTPS requests.
    """
    blacklight_server = 'https://illuminated.cs.mtu.edu:8080' # Likely unused
    introspection_endpoint = '/ark/introspection' # Likely unused
    client_identifiers = json.load(open("lib/json/client_identifiers.json"))
    ark_authorization = client_identifiers['ark']['authorization']
    public_key = open('lib/keys/public.pem').read()
    
    def __init__(self, request):
        """ PEP 8 """
        self.request = request


    def validate_args(self, arguments):
        """ Takes a list of arguments (e.g., ["response_type", "client_id", ...]
        and checks the request stored in self.request for these arguments.

        A list of missing arguments is returned.
        If no arguments are missing, an empty list is returned instead.
        """
        missing_arguments = []
        for param in arguments:
            if self.request.args.get(param) is None:
                missing_arguments.append(param)
        return missing_arguments


    def validate_jwt(self, scope=-1):
        """ PEP 8 """
        # Verify Authorization is present
        header = self.request.headers.get('Authorization')
        if header is None:
            return ArkError('invalid_request', '_no_token').get_json()
        if not header.startswith('Bearer '):
            return ArkError('invalid_request', '_malformed_token').get_json()
        
        # Split token from header
        token = [x.strip() for x in header.split("Bearer")][1]
        try:
            decoded = jwt.decode(token, \
                                 self.public_key, \
                                 audience=self.client_identifiers['ark']['aud'], \
                                 issuer=self.client_identifiers['ark']['iss'], \
                                 algorithms=["ES256"], \
                                 options={"verify_signature":True, \
                                          "verify_audience":True, \
                                          "verify_exp": True, \
                                          "verify_iss":True}
            )
            # If the scope of the JWT is important (e.g., patron functions vs. tutor functions)
            if (scope != -1) and (decoded['scope'] != scope):
                return ArkError('invalid_scope').get_json()
            return decoded
        except jwt.exceptions.InvalidSignatureError as err:
            return ArkError('invalid_signature').get_json()
        except jwt.exceptions.ExpiredSignatureError as err:
            return ArkError('expired_signature').get_json()
        except jwt.exceptions.InvalidAudienceError as err:
            return ArkError('invalid_audience').get_json()
        except jwt.exceptions.InvalidIssuerError as err:
            return ArkError('invalid_issuer').get_json()
        except Exception as e:
            return ArkError('invalid_request', '_malformed_token').get_json()


    def get_uuid_from_jwt(self):
        """ PEP 8 """
        header = self.request.headers.get('Authorization')
        if header is None:
            return ArkError('invalid_request', '_no_token').get_json()
        if not header.startswith('Bearer '):
            return ArkError('invalid_request', '_malformed_token').get_json()
        
        # Split token from header
        token = [x.strip() for x in header.split("Bearer")][1]
        try:
            decoded = jwt.decode(token, \
                                     self.public_key, \
                                 audience=self.client_identifiers['ark']['aud'], \
                                 issuer=self.client_identifiers['ark']['iss'], \
                                 algorithms=["ES256"], \
                                 options={"verify_signature":True, \
                                          "verify_audience":True, \
                                          "verify_exp": True, \
                                          "verify_iss":True}
            )
            # sub is the uuid
            return decoded["sub"] 
        except jwt.exceptions.InvalidSignatureError as err:
            return ArkError('invalid_signature').get_json()
        except jwt.exceptions.ExpiredSignatureError as err:
            return ArkError('expired_signature').get_json()
        except jwt.exceptions.InvalidAudienceError as err:
            return ArkError('invalid_audience').get_json()
        except jwt.exceptions.InvalidIssuerError as err:
            return ArkError('invalid_issuer').get_json()
        except Exception as e:
            return ArkError('invalid_request', '_malformed_token').get_json()
        
