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

class Blacklight:
    """ Provides an easy interface for Blacklight to perform operations on
    the database.
    """

    databases = json.load(open("./blacklight/lib/json/db_logins.json"))
    blacklight = databases['blacklight']
    private_key = open('./blacklight/lib/keys/private.pem').read()

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

        
    def service_introspection_request(self, authorization, token, scope):
        """ Thes a string representing the base64URL encoded authorization code
        passed via the "Authorization header," a string representing an access
        token, and an integer representing an account scope.

        If the authorization code is valid (i.e., comes from a valid Ark),
        look up the access token and scope provided and return the information
        about the token.

        Otherwise, return an appropriate error message.
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

            # Retrieve ark_id and ark_secret
            ark_credentials = self.__class__.decode_authorization(authorization, \
                                                                  split=True)
            # Decode token
            token = self.__class__.decode_authorization(token, split=False)
            
            # Lookup
            cur.execute("CALL service_introspection_request(?, ?, ?, ?)",
                        (ark_credentials[0], ark_credentials[1], token, scope))

            try:
                row_headers = [x[0] for x in cur.description]
                rv = cur.fetchone()
                token_info = dict(zip(row_headers, rv))

                # Convert VARBINARY(16) bytes to useful hex (the actual UUID)
                token_info['id'] = str(uuid.UUID(bytes=token_info.pop('id')))
                token_info['token'] = str(uuid.UUID(bytes=token_info.pop('token')))
            except Exception as e:
                print(e)
                token_info = BlacklightError('server_error').get_json()

            if "token" not in token_info:
                if "invalid_request_ark_credentials" in token_info:
                    token_info = BlacklightError("invalid_request", \
                                                        "_ark_credentials").get_json()
                elif "invalid_token" in token_info:
                    token_info = BlacklightError("invalid_token").get_json()
                else:
                    token_info = BlacklightError("server_error").get_json()

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return token_info
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

            
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
                print("AUTH")
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


    def authenticate_user(self, c_id, r_uri, u, p, s, cc, cm):
        """ Generates and returns an authentication grant for the provided
        client_id, redirect_uri, username, password, and account_scope.
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

            # Pre-validate scope
            try:
                scope_value = int(s)
                if scope_value < 0 or scope_value > 4:
                    return "invalid_scope"
            except ValueError as e:
                return "invalid_scope"

            print(f"Scope: {scope_value}")
            # Pre-validate challenge method
            if cm != 'S256' and cm != 'plain':
                return "invalid_scope" # TODO: Relevant error code
            
            # Hash password
            hashed_p = hashlib.sha256(p.encode())
            hashed_p = hashed_p.hexdigest()

            # Lookup
            cur.execute("CALL get_authorization_code(?, ?, ?, ?, ?, ?, ?)",
                        (c_id, r_uri, u, hashed_p, s, cc, cm))

            try:
                auth_code = cur.fetchone()[0]
                if auth_code == "access_denied" or auth_code == "invalid_scope" \
                   or auth_code == "server_error":
                    return auth_code
                else:
                    auth_code = r_uri + "?code=" + auth_code
            except:
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


    def get_new_tokens_from_test(self, c_id, r_uri, auth, code_chal):
        """ TEST """
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
                    json_data = BlacklightError(lookup).get_json()
            except:
                json_data = BlacklightError('server_error').get_json()

            # Assuming we retrieved a valid refresh token from execute ->
            # create JWT
            expiry = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).timestamp()
            expiry += 86400 # One day

            payload = {"iss":"illuminated.cs.mtu.edu",
                       "sub":"USER_ID_UUID",
                       "purpose":"access_token",
                       "aud":"MTU Ark Prototype",
                       "exp":expiry,
                       "scope":4}
            encoded = jwt.encode(payload, self.private_key, algorithm="ES256")

            print("Encoded:")
            print(encoded)
            
            cur.close()
            conn.commit()
            conn.close()

            return [encoded, "SOME_OPAQUE_REFRESH_TOKEN"]
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
        return 1

    
    def get_new_tokens_from_login(self, c_id, r_uri, auth, code_chal):
        """ Takes a client_id, redirect_uri, auth_code and a code_challenge.
        The code_challenge should be one generated by Blacklight using a 
        code_verifier that was provided with the auth_code.
        
        Using Blacklight's generated code_challenge is the evaluation of the
        Proof Key for Code Exchange (PKCE)
        
        If the parameters are valid and the auth_code has not already been used,
        generate and return an access token. Otherwise, return an error. 
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
            cur.execute("CALL get_new_tokens_from_login(?, ?, ?, ?)",
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

                    # Formatting
                    json_data = json_data[0]
                    json_data['expires_at'] = (time.mktime(json_data['expires_at'].timetuple()))
                else:
                    lookup = cur.fetchone()[0]
                    json_data = BlacklightError(lookup).get_json()
            except:
                json_data = BlacklightError('server_error').get_json()
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
