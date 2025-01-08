from flask import Flask, jsonify, request
app = Flask(__name__)

# Patrons
incoming_connections = {}
serviced_connections = {}

# Tutors
standby_tutors = {}
active_tutors = {}

########## SWITCHBOARD FUNCTIONS ##########
# The current number of waiting connections
@app.route("/so/conlen")
def so_num_connections():
    global incoming_connections
    return jsonify(len(incoming_connections))


# The dictionary of connections
@app.route("/so/con")
def so_get_connections():
    global incoming_connections
    return jsonify(incoming_connections)


@app.route("/so/con", methods=["PUT"])
def so_update_connection():
    global incoming_connections
    global serviced_connections

    # Unpack json
    user_id = request.json['u_id']
    zoom_id = request.json['zoom']
    password = request.json['pass']
    
    # Create entry
    # Update dictionary
    serviced_connections[str(user_id)] = {"meetingNumber": zoom_id, "meetingPassword": password}
    # serviced_connections[str(user_id)] = int(zoom_id)
    # serviced_connections.update(r)                 # Add to serviced connections
    del incoming_connections[str(user_id)]           # Remove from incoming connections
    
    return jsonify('success')


########## TUTOR CLIENT FUNCTIONS ##########
# Inform
#@app.route("/tut/con", methods=["POST"])
#def tut_add_connection():

########## PATRON CLIENT FUNCTIONS ##########
# Add to dictionary of connections
@app.route("/cli/con", methods=["POST"])
def cli_add_connection():
    # NOTE:
    #   Flask is SYNCHRONOUS
    #   When running with multiple Gunicorn workers, will need to ensure
    #   mutual exclusion?
    global incoming_connections
    global num_waiting

    # Get user ID (Mobile Phone #) from JSON
    user_id = request.json['u_id']
    
    incoming_connections[str(user_id)] = None          # Add to dictionary with no value

    # Note that we will update this value with the Zoom room to be assigned
    return jsonify(0)                                  # NOT the key--the mobile # is the key)


@app.route("/cli/con/<int:user_id>", methods=["GET"])
def cli_check_connection(user_id):
    global incoming_connections
    global serviced_connections
    global num_waiting

    # If the connection has been serviced, return the Zoom meeting number and password
    # to the iPad. 
    if str(user_id) in serviced_connections:
        zoom_id = serviced_connections[str(user_id)]
        del serviced_connections[str(user_id)]
        return jsonify(zoom_id)
    # In all other cases, return our default values of 0 and 0.
    elif str(user_id) in incoming_connections:
        return jsonify({"meetingNumber": "0", "meetingPassword": "0"})
    # Anything else
    else:
        # Debug Text
        print("Invalid user ID of: " + str(user_id))
        print("Valid Listings:")
        for item in serviced_connections:
            print(item)

        # Actual Response
        return jsonify({"meetingNumber": "0", "meetingPassword": "0"})
    



##### NOTES #####
    # Check status of "ticket"
    # NOTE:
    #  can be done like this:
    #  curl -X GET -H "Content-type: application/json" -d '{"u_id":5178993528}' https://illuminated.cs.mtu.edu:5000/cli/con
    # content body not allowed in get anymore apparently
