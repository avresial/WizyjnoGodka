from aiohttp import web
import socketio

#https://pfertyk.me/2020/03/webrtc-a-working-example/

ROOM = 'room'

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

class User():
    Sid = 0

    def __init__(self, id):
        self.Sid = id
    pass

ListOfUsers = []

@sio.event
async def connect(sid, environ):
    print('Connected', sid)
    await sio.emit('ready', room=ROOM, skip_sid=sid)
    sio.enter_room(sid, ROOM)
    ListOfUsers.append(User(sid))


@sio.event
def disconnect(sid):
    sio.leave_room(sid, ROOM)
    print('Disconnected', sid)

@sio.event
def GetUsers(sid):
    sio.send(ListOfUsers,sid) #use aiohttp insted and send data via Json object
    print('Sending list of users to - ' + sid)
    #httpEndpoint


@sio.event
async def data(sid, data): # data is going to be Video and audio
    print('Message from {}: {}'.format(sid, data))
    await sio.emit('data', data, room=ROOM, skip_sid=sid)


if __name__ == '__main__':
    web.run_app(app, port=9999)
