# blacklight.py
# Class implementation for Blacklight database calls
import mariadb                # To connect to database
import json                   # ?
import sys                    # ?
from .blacklight_error import *
# JWT
import jwt
# Converting localized timestamp to Unix timestamp
import datetime
import time
# Converting bytes to UUID
import uuid
# Below are all for handling PKCE
import hashlib
import base64
from builtins import bytes
# GUnicorn?
# sys.path.append(".")

class Blacklight:
    """ Provides an easy interface for Blacklight to perform operations on
    the database.
    """

    databases = json.load(open("lib/json/db_logins.json"))
    blacklight = databases['blacklight']
    private_key = open('lib/keys/private.pem').read()
    public_key = open('lib/keys/public.pem').read()
    client_identifiers = json.load(open("lib/json/client_identifiers.json"))

    def __init__(self, host=None, port=None, user=None, pw=None, db=None):
        """ Initialize the attributes used to connect to the database.
        Note that the database information is default, so this constructor
        need not be called with any parameters.
        """
        self.host = host if host is not None else self.blacklight['host']
        self.port = port if port is not None else self.blacklight['port']
        self.user = user if user is not None else self.blacklight['user']
        self.pw = pw if pw is not None else self.blacklight['pw']
        self.db = db if db is not None else self.blacklight['db']

    # MARK: Generic Account Functions
    def get_username_from_id(self, id):
        """ PEP 8 """
        try:
            # Database connection
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL get_username_from_id(?)",
                        (id,))

            try:
                username = cur.fetchone()[0]
            except:
                username = "INVALID_ID"

            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return {"username": username}
            
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    # MARK: Authentication Functions
    @staticmethod
    def decode_authorization(authorization, split):
        """ Takes a string representing the base64URL encoded authorization 
        code passed via the "Authorization" header and a boolean indicating
        whether or not the authorization code is in two pieces (i.e., is a
        clientID/clientSecret separated by :).

        If split is false, return the decoded authorization code as is.
        If split is true, return a list where element [0] is the piece of the
        code to the left of the : (i.e., the clientID) and element [1] is the
        piece of the code to the right of the : (i.e., the clientSecret)

        The base64URL encoded authorization code must already be split from the
        "Basic " component when this function is called. 
        """
        decode64 = base64.urlsafe_b64decode(authorization)

        # Strip to expected form:
        # i.e. b'ZP8hmxMusm3GFcGUTi5wtRJEvhQIDZro_G44XtIAnPI='
        # becomes ZP8hmxMusm3GFcGUTi5wtRJEvhQIDZro_G44XtIAnPI
        decode64 = str(decode64).replace("=", "").lstrip("b").strip("'")
        if split:
            decode64 = decode64.split(':', 1)
        return decode64

                    
    def authenticate_client(self, c_id, r_uri):
        """ Calls the authenticate_client stored procedure on Blacklight.
        Attempts to fetch the resulting table, returning "authorized_client"
        or "unauthorized_client" depending on if the client_id and redirect_uri
        are valid or not.
        """
        try:
            # Database connection
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL authenticate_client(?, ?)",
                        (c_id, r_uri))

            try:
                client = cur.fetchone()[0]
            except:
                client = "unauthorized_client"

            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return str(client)
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def authenticate_user(self, c_id, r_uri, u, p, cc, cm):
        """ Generates and returns an authentication grant for the provided
        client_id, redirect_uri, username, and password.
        If an authentication cannot be granted, returns an error code instead.
        """
        try:
            # Database connection
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Pre-validate challenge method
            if cm != 'S256' and cm != 'plain':
                return "invalid_scope" # TODO: Relevant error code
            
            # Hash password
            #hashed_p = hashlib.sha256(p.encode())
            #hashed_p = hashed_p.hexdigest()

            # Lookup
            cur.execute("CALL get_authorization_code(?, ?, ?, ?, ?, ?)",
                        (c_id, r_uri, u, p, cc, cm))

            try:
                auth_code = cur.fetchone()[0]
                if auth_code == "access_denied" or auth_code == "invalid_scope" \
                   or auth_code == "server_error":
                    print(f"auth code is {auth_code}")
                    return auth_code
                else:
                    auth_code = r_uri + "?code=" + auth_code
            except:
                print(f"Exception in get_authorization_code try block")
                auth_code = "server_error"

            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return auth_code
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    @staticmethod
    def complete_code_challenge(code_verifier):
        """ Takes a code_verifier generated by a client and attempts to generate
        the corresponding code_challenge that results from SHA256 hashing and
        base64 url encoding the code_verifier.

        The code_challenge that Blacklight generates is returned as a string.
        """
        hashed = hashlib.sha256(code_verifier.encode('ascii')).hexdigest()
        encode64 = base64.urlsafe_b64encode(bytes.fromhex(hashed))
    
        # Strip to expected form:
        # i.e. b'ZP8hmxMusm3GFcGUTi5wtRJEvhQIDZro_G44XtIAnPI='
        # becomes ZP8hmxMusm3GFcGUTi5wtRJEvhQIDZro_G44XtIAnPI
        code_challenge = str(encode64).replace("=", "").lstrip("b").strip("'")

        return code_challenge


    def get_new_tokens_from_login(self, c_id, r_uri, auth, code_chal):
        """ PEP 8 """
        # CALL get_new_tokens_from_login(c_id, r_uri, auth, code_chal)
        # Stays the same but no longer generates the "access token" part
        # We still want to check auth freshness and c_id/r_uri combination
        # Opaquely we will only store refresh_tokens
        try:
            # Database connection
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL get_new_refresh_from_login(?, ?, ?, ?)",
                        (c_id, r_uri, auth, code_chal))
            json_data = []
            
            try:
                # If fetchall() fails then nothing was returned from the
                # procedure, so something must have gone wrong.
                row_headers = [x[0] for x in cur.description]

                if len(row_headers) > 1:
                    lookup = cur.fetchall()

                    # TODO: Adjust this for one row because we will never
                    # be returning multiple sets of tokens
                    # (i.e., we only return one row so there's no need to
                    # iterate over this like there could be multiple)
                    for result in lookup:
                        json_data.append(dict(zip(row_headers, result)))

                    json_data = json_data[0]
                    
                    # Convert VARBINARY(16) bytes to useful hex (the actual UUID)
                    json_data['refresh_token'] = str(uuid.UUID(bytes=json_data.pop('refresh_token')))
                    json_data['id'] = str(uuid.UUID(bytes=json_data.pop('id')))
                else:
                    lookup = cur.fetchone()[0]
                    print("Error returned in fetch")
                    return BlacklightError(lookup).get_json()
            except:
                print("Error returned via exception")
                return BlacklightError('server_error').get_json()

            # Assuming we retrieved a valid refresh token from execute ->
            # create JWT
            expiry = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).timestamp()
            expiry += 86400 # One day

            payload = {"iss":"illuminated.cs.mtu.edu",
                       "sub":json_data['id'],
                       "purpose":"access_token",
                       "aud":"MTU Ark Prototype",
                       "exp":expiry,
                       "scope":json_data['account_scope']}
            access_encoded = jwt.encode(payload, self.private_key, algorithm="ES256")

            payload = {
                "iss":self.client_identifiers["iss"],
                "aud":self.client_identifiers["aud"],
                "refresh_token":json_data['refresh_token'],
            }
            refresh_encoded = jwt.encode(payload, self.private_key, algorithm="ES256")
            
            cur.close()
            conn.commit()
            conn.close()

            return { 
                "jwt": access_encoded, 
                "refresh_token": refresh_encoded,
                "refresh_token_expires": json_data['expiration'],
                "session": json_data['refresh_token']
                }
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def get_new_tokens_from_refresh(self, signed_refresh_token):
        """ PEP 8 """
        try:
            try:
                decoded = jwt.decode(signed_refresh_token, \
                                     self.public_key, \
                                     audience=self.client_identifiers['aud'], \
                                     issuer=self.client_identifiers['iss'], \
                                     algorithms=["ES256"], \
                                     options={"verify_signature":True, \
                                              "verify_audience":True, \
                                              "verify_exp": True, \
                                              "verify_iss": True}
                                    )
                refresh_token = decoded["refresh_token"]
                # return refresh_token
            except Exception as err:
                return BlacklightError("invalid_request", "_no_refresh_token").get_json()

            # Database connection
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL get_new_refresh_from_refresh(?)",
                        (refresh_token,))
            json_data = []
            
            try:
                # If fetchall() fails then nothing was returned from the
                # procedure, so something must have gone wrong.
                row_headers = [x[0] for x in cur.description]

                if len(row_headers) > 1:
                    lookup = cur.fetchall()

                    # TODO: Adjust this for one row because we will never
                    # be returning multiple sets of tokens
                    # (i.e., we only return one row so there's no need to
                    # iterate over this like there could be multiple)
                    for result in lookup:
                        json_data.append(dict(zip(row_headers, result)))

                    json_data = json_data[0]
                    
                    # Convert VARBINARY(16) bytes to useful hex (the actual UUID)
                    json_data['refresh_token'] = str(uuid.UUID(bytes=json_data.pop('refresh_token')))
                    json_data['id'] = str(uuid.UUID(bytes=json_data.pop('id')))
                    json_data['expiration'] = json_data.pop('expiration')
                else:
                    lookup = cur.fetchone()[0]
                    return BlacklightError(lookup).get_json()
            except Exception as e:
                return BlacklightError('server_error').get_json()

            # Assuming we retrieved a valid refresh token from execute ->
            # create JWT
            expiry = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).timestamp()
            expiry += 86400 # One day

            payload = {"iss":"illuminated.cs.mtu.edu",
                       "sub":json_data['id'],
                       "purpose":"access_token",
                       "aud":"MTU Ark Prototype",
                       "exp":expiry,
                       "scope":json_data['account_scope']}
            access_encoded = jwt.encode(payload, self.private_key, algorithm="ES256")

            payload = {
                "iss":self.client_identifiers["iss"],
                "aud":self.client_identifiers["aud"],
                "refresh_token":json_data['refresh_token'],
            }
            refresh_encoded = jwt.encode(payload, self.private_key, algorithm="ES256")
            
            cur.close()
            conn.commit()
            conn.close()

            return { 
                "jwt": access_encoded, 
                "refresh_token": refresh_encoded,
                "refresh_token_expires": json_data['expiration'],
                "session": json_data['refresh_token']
                }
        except Exception as err:
            return BlacklightError('server_error').get_json()

    def logout_and_delete_refresh_token(self, signed_refresh_token):
        """ PEP 8 """
        try:
            try:
                decoded = jwt.decode(signed_refresh_token, \
                                        self.public_key, \
                                        audience=self.client_identifiers['aud'], \
                                        issuer=self.client_identifiers['iss'], \
                                        algorithms=["ES256"], \
                                        options={"verify_signature":True, \
                                                "verify_audience":True, \
                                                "verify_exp": True, \
                                                "verify_iss": True}
                                    )
                refresh_token = decoded["refresh_token"]
            except Exception as err:
                return BlacklightError("invalid_request", "_no_refresh_token").get_json()

            # Database connection
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL delete_refresh_token(?)",
                        (refresh_token,))
            
            return "done"
        except Exception as e:
            return BlacklightError('server_error').get_json()