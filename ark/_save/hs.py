from flask import Flask, jsonify, request
app = Flask(__name__)

incoming_connections = {}
serviced_connections = {}
num_waiting = 0


########## SWITCHBOARD FUNCTIONS ##########
# The current number of waiting connections
@app.route("/so/conlen")
def num_connections():
    global incoming_connections
    
    return jsonify(len(incoming_connections))


# The dictionary of connections
@app.route("/so/con")
def get_connections():
    global incoming_connections
    
    return jsonify(incoming_connections)


@app.route("/so/con", methods=["PUT"])
def update_connection():
    global incoming_connections
    global serviced_connections
    global num_waiting

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
    num_waiting -= 1                                 # One less waiting
    
    return jsonify('success')
    
########## CLIENT FUNCTIONS ##########
# Add to dictionary of connections
@app.route("/cli/con", methods=["POST"])
def add_connection():
    # NOTE:
    #   Flask is SYNCHRONOUS
    #   When running with multiple Gunicorn workers, will need to ensure
    #   mutual exclusion?
    global incoming_connections
    global num_waiting

    # Get user ID (Mobile Phone #) from JSON
    user_id = request.json['u_id']
    
    num_waiting += 1                                   # We are last in the queue/this is our ticket #
    #incoming_connections[str(num_waiting)] = None     # Add to dictionary with no value
    incoming_connections[str(user_id)] = None          # Add to dictionary with no value

    # Note that we will update this value with the Zoom room to be assigned
    return jsonify(0)                                  # NOT the key--the mobile # is the key)


@app.route("/cli/con/<int:user_id>", methods=["GET"])
def check_connection(user_id):
    global incoming_connections
    global serviced_connections
    global num_waiting

    if str(user_id) in serviced_connections:
        zoom_id = serviced_connections[str(user_id)]
        del serviced_connections[str(user_id)]
        return jsonify(zoom_id)
    elif str(user_id) in incoming_connections:
        print("Connection not yet serviced!")
        return jsonify({"meetingNumber": "0", "meetingPassword": "0"})
    else:
        # Debug Text
        print("Invalid user ID of: " + str(user_id))
        print("Valid Listings:")
        for item in serviced_connections:
            print(item)

        # Actual Response
        return jsonify({"meetingNumber": "0", "meetingPassword": "0"})
    
    # Unpack json
    # user_id = request.json['u_id']

    # Check status of "ticket"
    # NOTE:
    #  can be done like this:
    #  curl -X GET -H "Content-type: application/json" -d '{"u_id":5178993528}' https://illuminated.cs.mtu.edu:5000/cli/con
    # content body not allowed in get anymore apparently
