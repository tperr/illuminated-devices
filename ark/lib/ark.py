# ark.py
# Class implementation for Ark database calls
import mariadb
import json
import sys

class Ark:
    """ Provides an easy interface for Ark to perform operations on the
    database. 
    """

    databases = json.load(open("lib/json/db_logins.json"))
    ark = databases['ark']
    
    def __init__(self, host=None, port=None, user=None, pw=None, db=None):
        """ Initialize the attributes used to connect to the database.
        Note that the database information is default, so this constructor
        need not be called with any parameters.
        """
        self.host = host if host is not None else self.ark['host']
        self.port = port if port is not None else self.ark['port']
        self.user = user if user is not None else self.ark['user']
        self.pw = pw if pw is not None else self.ark['pw']
        self.db = db if db is not None else self.ark['db']

    # MARK: Generic Account Functions
    def get_account_details(self, user_id):
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
            cur.execute("CALL get_account_details(?)",
                        (user_id,))
            
            json_data = []
            try:
                # If fetchall() fails, then there is no one waiting
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
            
            #json_data = []
            #try:
            #    account_details = cur.fetchone()[0]
            #except:
            #    account_details = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
    
    # MARK: Switchboard Operator Functions
    def get_waiting_connections(self):
        """ Returns a dictionary of the currently unserviced requests.
        The dictionary has the request_id, patron_id, fname, lname, and
        request_time of the request.
        Returns an empty dictionary if there are no unserviced requests.
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
            cur.execute("CALL get_waiting_requests()")
            json_data = []
            try:
                # If fetchall() fails, then there is no one waiting
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def get_available_tutors(self):
        """ Returns a dictionary of the currently available tutors.
        The dictionary has the tutor_id, fname, and lname of the tutors.
        Returns an empty dictionary if there are no tutors currently available.
        """
        try:
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL get_available_tutors()")
            json_data = []
            try:
                # If fetchall() fails, then there are no tutors available
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()

                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

            
    def service_request(self, request_id, tutor_id):
        """ Takes a request_id and a tutor_id and assigns the tutor_id to the
        request_id in the serviced_requests tables.
        Also, sets serviced=1 for the request_id in the incoming_requests table.
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

            cur.execute("CALL service_request(?, ?)",
                        (request_id, tutor_id))

            try:
                exit_status = cur.fetchone()[0]
            except:
                exit_status = "ERR_RETURNED_EMPTY_TABLE"

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return exit_status
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    # MARK: Provider [Vendor] (iPad/Client) Functions
    def get_devices(self, user_id):
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
            cur.execute("CALL get_devices(?)",
                        (user_id,))
            
            json_data = []
            try:
                # If fetchall() fails, then there are no devices
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def get_patrons(self, user_id):
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
            cur.execute("CALL get_patrons(?)",
                        (user_id,))
            
            json_data = []
            try:
                # If fetchall() fails, then there are no devices
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def get_organization_locations(self, user_id):
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
            cur.execute("CALL get_organization_locations(?)",
                        (user_id,))
            
            json_data = []
            try:
                # If fetchall() fails, then there are no devices
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def get_device_log(self, user_id, device_id):
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
            cur.execute("CALL get_device_log(?, ?)",
                        (user_id, device_id))
            
            json_data = []
            try:
                # If fetchall() fails, then there are logs for the device
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def get_device_info(self, device_id):
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
            cur.callproc("get_device_info", (device_id,))
            
            data = cur.fetchall()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"


    def get_patron_log(self, user_id, patron_id):
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
            cur.execute("CALL get_patron_log(?, ?)",
                        (user_id, patron_id))
            
            json_data = []
            try:
                # If fetchall() fails, then there are logs for the device
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def add_new_device(self, user_id, name, notes, ipad):
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
            cur.callproc("add_new_device", (user_id, name, notes, ipad,))
            
            status = cur.fetchone()
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return status
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def checkout_device_to_patron(self, provider, device, patron, last_checkout, return_date):
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
            cur.execute("CALL checkout_device_to_patron(?, ?, ?, ?, ?)",
                        (provider, device, patron, last_checkout, return_date))
            
            json_data = []
            try:
                # Really need to update this at some point because this is for multiple rows but you know
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def checkin_device_from_patron(self, provider, device, patron):
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
            cur.execute("CALL checkin_device_from_patron(?, ?, ?)",
                        (provider, device, patron))
            
            json_data = []
            try:
                # Really need to update this at some point because this is for multiple rows but you know
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def update_device_information(self, provider, device, name, bsid, home_location_id, current_location_id, notes, command_number):
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
            cur.execute("CALL update_device_information(?, ?, ?, ?, ?, ?, ?, ?)",
                        (provider, device, name, bsid, home_location_id, current_location_id, notes, command_number))
            
            json_data = []
            try:
                # Really need to update this at some point because this is for multiple rows but you know
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def update_patron_information(self, provider, patron_id, fname, lname, bsid, birthday, email, phone, street_address, city, state, new_zip, notes, command_number):
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
            cur.execute("CALL update_patron_information(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (provider, patron_id, fname, lname, bsid, int(birthday), email, phone, street_address, city, state, new_zip, notes, command_number))
            
            json_data = []
            try:
                # Really need to update this at some point because this is for multiple rows but you know
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

        
    def add_new_patron(self, provider, fname, lname, bsid, birthday, email, phone, street_address, city, state, new_zip, notes):
        """ Adds a new patron to the patron_roster with the provided values.
        Returns a code in a dictionary with the key "patron_added"
        Possible codes are:
            -2: BSID already in use
            -4: Email already in use
            -5: Phone already in use
             2: Success
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
            cur.execute("CALL add_new_patron(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (provider, fname, lname, bsid, int(birthday), email, phone, street_address, city, state, new_zip, notes))
            
            json_data = []
            try:
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()
                
                for result in lookup:
                    json_data.append(dict(zip(row_headers, result)))
            except:
                json_data = []
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()
            
            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def assign_device_to_patron_with_vendor(self, device_id, patron_id, vendor_id):
        """ PEP 8 """
        try:
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL assign_device_to_patron_with_vendor(?, ?, ?)",
                        (device_id, patron_id, vendor_id))
            
            try:
                lookup = cur.fetchone()[0]
                lookup = {"data":{"result":lookup}}
            except:
                lookup = ArkError("server_error").get_respondable_json()

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            print(lookup)
            return lookup
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
        

    # TODO:
    # Possibly deletable--check that you aren't using this in a route first though
    # the reason I am not deleting it right now is because it's 1 am and I have something due tomorrow so just do it later <3 
    def get_all_patrons(self):
        """ PEP8
        """
        try:
            conn = mariadb.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.pw,
                database=self.db
            )
            cur = conn.cursor()

            # Lookup
            cur.execute("CALL get_all_patrons()")
            json_data = []
            try:
                # If fetchall() fails, then there are no patrons in the patron
                # roster
                row_headers = [x[0] for x in cur.description]
                lookup = cur.fetchall()

                for result in lookup:
                    cast = (str(i) for i in result)
                    json_data.append(dict(zip(row_headers, cast)))
            except:
                json_data = []

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return json_data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def add_incoming_request(self, user_id):
        """ Takes a user_id (currently: phone number) and adds it to the table
        of incoming_requests, if there is not already an outstanding request 
        by this patron waiting to be serviced.

        Return the request_id of the new request, if the request is added.
        Otherwise, if there is already an outstanding request, return the 
        request_id of the most recent outstanding request. 
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

            print(f"user_id is: {user_id}")
            # Using a stored function on Ark
            cur.execute("CALL add_request(?)",
                        (user_id,))
            try:
                request_id = cur.fetchone()[0]
            except:
                request_id = -1
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return request_id
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    def retrieve_zoom_meeting(self, request_id):
        """ Takes a request_id for a serviced request and retrieves the
        Zoom meeting number and password for the Zoom room corresponding to
        the tutor assigned to the request. 

        If the room has not been serviced, fetchone() will raise an exception.
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
            cur.execute("CALL check_request(?)",
                        (request_id,))
            try:
                row_headers = [x[0] for x in cur.description]
                rv = cur.fetchone()
                zoom_room = dict(zip(row_headers, rv))
            except:
                zoom_room = {"meetingNumber":"0", "meetingPassword":"0"}
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return zoom_room
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()


    # MARK: Tutor Functions
    def get_tutor_profile(self, tutor_id):
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
            cur.execute("CALL get_tutor_profile(?)",
                        (tutor_id,))
            
            try:
                row_headers = [x[0] for x in cur.description]
                rv = cur.fetchone()
                profile = dict(zip(row_headers, rv))
                profile["registration_date"] = str(profile["registration_date"])
            except:
                profile = ArkError("server_error").get_json()
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return {"data": profile}
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

            
    def tutor_login(self, tutor_id):
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
            cur.execute("CALL tutor", (PARAM,))
            
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SOMETHING"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    
    def tutor_ready_up(self, tutor_id):
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
            cur.execute("CALL tutor_ready_up",
                        (tutor_id,))

            try:
                exit_status = cur.fetchone()[0]
            except:
                exit_status = "ERR_RETURNED_EMPTY_TABLE"
                
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return exit_status
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def tutor_get_chats(self, tutor_id):
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
            cur.callproc("tutor_get_chats", (tutor_id,))
            data = cur.fetchall()

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_send_chat(self, t_from, t_to, msg):
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
            cur.callproc("tutor_send_chat", (t_from, t_to, msg,))

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_log(self, t_id, on):
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
            if on:
                cur.callproc("tutor_log_on", (t_id,))
            else:
                cur.callproc("tutor_log_off", (t_id,))

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_get_tutors(self):
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
            cur.callproc("get_tutors", ())
            data = cur.fetchall()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_update_patron_note(self, notes):
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

            for n in notes:
                # Lookup
                print("DOING THE LOOKUP")
                print(n)
                cur.callproc("tutor_updat_patron_notes", (n[0], n[1], n[2],))
                result = cur.fetchone()
                if result[0] != "SUCCESS":
                    print(result)
                    raise Exception("PATRON NOTE ISSUE: %s %s %s %s" % n)

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_assign_patron_to_tutor(self, m_id, p_id):
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
            cur.callproc("st_assign_patron_to_tutor", (m_id, p_id,))

            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_get_patron_notes(self, p_id):
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
            cur.callproc("get_patron_notes", (p_id,))
            data = cur.fetchall()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            raise Exception(err)
            conn.rollback()
            return "ERROR"

    # Tutor Zoom functions
    def tutor_get_patron_queue(self, id):
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
            cur.callproc("get_meeting_queue", (id,))
            data = cur.fetchall()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def tutor_patron_join_meeting(self, id):
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
            cur.callproc("tutor_patron_join_queue", (id,))
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def tutor_end_meeting(self, id):
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
            cur.callproc("tutor_end_meeting", (id,))
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def patron_dropped(self, id):
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
            cur.callproc("patron_dropped_meeting", (id,))
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def clear_queue(self):
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
            cur.callproc("clear_queue", ())
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    # patron zoom functions
    def patron_join_waiting_queue(self, id, topic, pwd):
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
            cur.callproc("patron_join_queue", (id, topic, pwd,))
            data = cur.fetchone()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err

    def patron_get_meeting_info(self, id):
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
            cur.callproc("patron_get_meeting", (id,))
            data = cur.fetchone()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err

    def tutor_dropped(self, id):
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
            cur.callproc("tutor_dropped_meeting", (id,))
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"

    def patron_check_if_reasigned(self, id):
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
            cur.callproc("patron_check_if_assigned", (id,))
            data = cur.fetchone()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err
            
    def general_get_meeting_info(self, id):
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
            cur.callproc("get_meeting_info", (id,))
            data = cur.fetchone()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err
    
    def device_log_onoff(self, id, onoff):
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
            cur.callproc("device_log_onoff", (id, onoff,))
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err
        
    def update_device_note(self, id, note):
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
            cur.callproc("update_device_note", (id, note,))
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err
    
    def get_checkedout_devices(self):
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
            cur.callproc("get_checked_out_devices", ())
            data = cur.fetchall()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err

    def get_all_organizations(self):
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
            cur.callproc("get_all_organizations", ())
            data = cur.fetchall()
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return err

    # Zoom test functions, no longer applicable
    def test_login(self, name, role):
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
            cur.callproc("test_login", (name, role))
            
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
            return "NO SUCCESS"
        
    def test_get_lists(self):
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

            data = {}

            # Lookup test_patrons
            cur.execute("SELECT name FROM test_patrons ORDER BY priority")
            result = cur.fetchall()
            data["patrons"] = [row[0] for row in result]

            # Lookup test_tutors
            cur.execute("SELECT name FROM test_tutors")
            result = cur.fetchall()
            data["tutors"] = [row[0] for row in result]

            # Close connection
            cur.close()
            conn.commit()
            conn.close()


            return data
        except Exception as err:
            print(err, file=sys.stderr)
        conn.rollback()

    def test_clear_tables(self):
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


            cur.execute("delete from test_tutors")

            cur.execute("delete from test_patrons")

            cur.execute("delete from test_meetings")


            # Close connection
            cur.close()
            conn.commit()
            conn.close()


            return "Success?"
        except Exception as err:
            print(err, file=sys.stderr)
        conn.rollback()
        
    def test_check_zoom(self, name, role):
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
            if role == 1:
                cur.execute("select meetingid from test_tutors where name = ?", (name,))
            elif role == 0:
                cur.execute("select meetingid from test_patrons where name = ?", (name,))
            else:
                raise ValueError("Incorrect role type")
            
            result = cur.fetchone()

            
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return result[0]
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def test_assign_patrons_to_room(self, tutor, names):
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

            cur.execute("insert into test_meetings (topic) values (?)", (str(names),))

            cur.execute("select meetingid from test_meetings where topic = ?", (str(names),))

            id = cur.fetchone()[0]

            #raise Exception()

            cur.execute("update test_tutors set meetingid = ? where name = ?", (id, tutor,))

            for name in names:
                cur.execute("update test_patrons set meetingid = ? where name = ?", (id, name,))

            
            
            
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SUCCESS"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()

    def get_test_meeting_info(self, id):
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

            cur.execute("select topic from test_meetings where meetingid = ?", (id,))
            
            result = cur.fetchall()[0]

            #raise KeyError(result[0])
            data=dict()
            data["topic"] = result[0]
            
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return data
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
    # ARK TEMPLATE
    def temp(self):
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
            cur.execute("Q(?)", (PARAM,))
            
            # Close connection
            cur.close()
            conn.commit()
            conn.close()

            return "SOMETHING"
        except Exception as err:
            print(err, file=sys.stderr)
            conn.rollback()
