from index import logger, app
from flask import jsonify, request
from flask_socketio import join_room, emit, send, SocketIO

from lib.ark import *

class TwoWayDict(dict):
    def __setitem__(self, key, value):
        if key in self:
            del self[key]
        if value in self:
            del self[value]

        dict.__setitem__(self, key, value)
        dict.__setitem__(self, value, key)

    def __delitem__(self, key):
        dict.__delitem__(self, self[key])
        dict.__delitem__(self, key)

    def __len__(self):
        """Returns the number of connections"""
        return dict.__len__(self) // 2

# SocketIO setup
socketio = SocketIO(
    app,
    logger=logger, 
    engineio_logger=logger, 
    cors_allowed_origins="https://illuminated.cs.mtu.edu", 
    transports=["polling", "websocket", "webtransport"],
    async_mode="eventlet",
    ping_interval=10,
    ping_timeout=100,
)

users = TwoWayDict()
tutors = set()
db = Ark()

# mixed handlers

# tutor handlers
@socketio.on("basic_tutor_pull_all")
def basic_tutor_pull_all():
    emit("tutors_pull_all_data", to="tutor_room")

@socketio.on("patron_join_tutor")
def patron_join_tutor(data):
    emit("patron_join_tutor", {"p_id": data["p_id"]}, to=users[data["p_id"]])
    emit("r_p_from_queue", {"p_id": data["p_id"]}, to="tutor_room")

@socketio.on("t_message_t")
def t_message_t(data):
    emit("new_message", data, to=users[data["t_id"]])

@socketio.on("manage_patron_permissions")
def manage_patron_permissions(data):
    emit("patron_permissions", data, to=users[data["p_id"]])

@socketio.on("tutor_generic_send")
def tutor_generic(data):
    if "t_id" in data:
        emit("tutor_generic_receive", data, to=users[data["t_id"]])
    else:
        emit("tutor_generic_receive", data, to="tutor_room")


@socketio.on("clear_patron_queue")
def clear_mq(data):
    emit("mq_cleared", broadcast=True)


# patron handlers
@socketio.on("joined_queue")
def joined_queue(data):
    logger.debug("patron joined queue")
    logger.debug(users)
    logger.debug(data)

    if "regular_tutor_id" in data: # to specific tutor
        emit("p_joined", {"m_id": data["m_id"]}, to=users[data["regular_tutor_id"]])
    else:
        emit("p_joined", {"m_id": data["m_id"]}, to="supertutor_room")

@socketio.on("update_id")
def update_id(data):
    users[request.sid] = data["p_id"]

# other stuff
def handle_check_inout(p_id, out):
    if out:
        emit("checked_out", {"out": out}, to=users[p_id]) # p_id = device id
    else:
        emit("checked_in", {"out": out}, to=users[p_id]) # p_id = patron id
    
    emit("device_log_on", {"id": "checked_out"}, to="tutor_room") # on tutor side just refreshes list, so this is fine

# connection handling and errors
@socketio.on("connect")
def connect(auth):
    logger.debug("%s(%s):%s connected" % (request.args["type"], request.args["uuid"], request.sid))
    users[request.args["uuid"]]= request.sid
    print(request.args)
    print(request.args)
    if "patron" == request.args["type"]:
        db.device_log_onoff(request.args["uuid"], 1)
        emit("device_log_on", {"id": request.args["uuid"]}, to="tutor_room")

    if "tutor" in request.args["type"]:
        emit("t_log_on", {"uuid":request.args["uuid"]}, to="tutor_room")
        tutors.add(request.args["uuid"])

    join_room("%s_room" % request.args["type"])
    if "supertutor" == request.args["type"]:
        join_room("tutor_room")
    logger.debug(request.args)
    logger.debug(request.sid)
    logger.debug(users)
    logger.debug(users[request.args["uuid"]])
    if request.args["type"] == "patron":
        pass # for when a patron initially opens app
    
    #send({"joined_room":request.args["uuid"]}, json=True)

    return
    logger.info("\n\t" + str(request.args) + "\n\t" + \
                str(request.base_url) + "\n\t" + \
                str(request.data) + "\n\t" + \
                str(request.endpoint) + "\n\t" + \
                str(request.get_data) + "\n\t" + \
                str(request.get_json) + "\n\t" + \
                str(request.headers) + "\n\t" + \
                str(request.json) + "\n\t" + \
                str(request.namespace) + "\n\t" + \
                str(request.sid) + "\n\t" + \
                str(request.values) + "\n\t" + \
                str(request.view_args) + "\n\t")
    #emit("connect",{"data":"id: {request.sid} is connected"})

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    logger.debug(users)
    logger.debug(request.sid)

    if request.sid not in tutors: # patron
        db.device_log_onoff(request.args["uuid"], 0)
        emit("device_log_off", {"id": request.args["uuid"]}, to="tutor_room")

    if request.sid in users and users[request.sid] in tutors:
        tutors.remove(users[request.sid])
        db.tutor_log(users[request.sid], False)
        emit("t_log_off", {"uuid":users[request.sid]}, to="tutor_room")

    if request.sid in users:
        del users[request.sid]
    #logger.debug("client %s has disconnected" % request.sid)
    #emit("disconnect",{"data":request.sid},broadcast=True)

@socketio.on("connection_error")
def conn_error(err):
    """event listener when client disconnects to the server"""
    logger.error("error:", err)
