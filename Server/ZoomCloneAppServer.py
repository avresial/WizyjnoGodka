from aiohttp import web
import socketio
import json


ROOM = 'room'


sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

list_of_users = []


class User:
    def __init__(self, sid_id):
        self.sid = sid_id
        self.name = ''

    def set_name(self, name):
        self.name = name

    def compare(self, sid):
        if self.sid == sid:
            return True
        else:
            return False


class EncodeUser(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


def parse_to_json() -> str:
    str = json.dumps(list_of_users, indent=4, cls=EncodeUser)
    return str


@sio.event
async def connect(sid, environ):
    print('Connected', sid)
    await sio.emit('ready', room=ROOM, skip_sid=sid)
    sio.enter_room(sid, ROOM)
    list_of_users.append(User(sid))


@sio.event
def disconnect(sid):
    sio.leave_room(sid, ROOM)
    print('Disconnected', sid)


@sio.on('connections')
async def get_users(sid):
    str = parse_to_json()
    await sio.emit('connections', data=str, to=sid)


@sio.on('data')
async def data(sid, data): # data is going to be Video and audio
    print('Message from {}: {}'.format(sid, data))
    await sio.emit('data', data, room=ROOM, skip_sid=sid)


@sio.on('chat')
async def pass_data(sid, message):
    await sio.emit('message', data=message, room=ROOM, skip_sid=sid)


@sio.on('name')
async def pass_name(sid, name):
    for user in list_of_users:
        if user.compare(sid):
            user.set_name(name)
            break


if __name__ == '__main__':
    web.run_app(app, port=8000)
