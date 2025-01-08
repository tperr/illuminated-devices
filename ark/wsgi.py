from index import app
from socketer import socketio

if __name__ == '__main__':
    #app.run()
    socketio.run(app, port=6002, debug=True)
