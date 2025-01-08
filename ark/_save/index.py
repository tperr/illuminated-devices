from flask import Flask, jsonify, request

app = Flask(__name__)

from .routes.operator import switchboard_operator
from .routes.patron import patron
app.register_blueprint(switchboard_operator)
app.register_blueprint(patron)

# Patrons
#incoming_connections = {}
#serviced_connections = {}

# Tutors
#standby_tutors = {}
#active_tutors = {}

########## SWITCHBOARD FUNCTIONS ##########


########## TUTOR CLIENT FUNCTIONS ##########
# Inform
#@app.route("/tut/con", methods=["POST"])
#def tut_add_connection():

########## PATRON CLIENT FUNCTIONS ##########
# Add to dictionary of connections



##### NOTES #####
    # Check status of "ticket"
    # NOTE:
    #  can be done like this:
    #  curl -X GET -H "Content-type: application/json" -d '{"u_id":5178993528}' https://illuminated.cs.mtu.edu:5000/cli/con
    # content body not allowed in get anymore apparently
