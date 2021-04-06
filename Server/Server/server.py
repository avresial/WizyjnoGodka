from aiohttp import web
import socketio
from User import user_list


ROOM = 'room'
list = user_list.UserList()
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)


@sio.event
async def connect(sid, environ):
    print('Connected', sid)
    sio.enter_room(sid, ROOM)
    list.append_new_user(sid)


@sio.event
async def disconnect(sid):
    list.remove_user(sid)
    await sio.emit('remove-connection', data=sid, skip_sid=sid)
    sio.leave_room(sid, ROOM)
    print('Disconnected', sid)


@sio.on('connections')
async def get_users(sid):
    str = list.get_user_list_in_json(sid)
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
    for user in list.list_of_users:
        if user.compare(sid):
            user.set_name(name)
            json_object = list.parse_user_to_json(user)
            await sio.emit('add-connection', data=json_object, skip_sid=sid)
            break


def start_server():
    web.run_app(app, port=8000)
