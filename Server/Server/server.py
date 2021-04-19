from aiohttp import web
import socketio
from User import user_list


ROOM = 'room'
users_list = user_list.UserList()
invitations_list = []
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)



@sio.event
async def connect(sid, environ):
    print('Connected', sid)
    users_list.append_new_user(sid)
    sio.leave_room(sid, str(sid))


@sio.event
async def disconnect(sid):
    users_list.remove_user(sid)
    await sio.emit('remove-connection', data=sid, skip_sid=sid)
    for room in sio.rooms(sid):
        sio.leave_room(sid, room)
    print('Disconnected', sid)


@sio.on('connections')
async def get_users(sid):
    str = users_list.get_user_list_in_json(sid)
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
    for user in users_list.list_of_users:
        if user.compare(sid):
            user.set_name(name)
            json_object = users_list.parse_user_to_json(user)
            await sio.emit('add-connection', data=json_object, skip_sid=sid)
            break


# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('send-invitation')
async def send_invitation(sender_sid, receiver_sid):
    invitations_list.append(Invitation(receiver_sid, sender_sid))
    await sio.emit('receive-invite', data=sid, to=receiver_sid)

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('accept-invitation')
async def accept_invitation(sender_sid, receiver_sid, data):
    if data == 'Accepted':
        if(invitations_list.__contains__(Invitation(receiver_sid, sender_sid))):
            remove_from_all_rooms(sender_sid)
            sio.enter_room(sender_sid, f"{sender_sid}-room")
            remove_from_all_rooms(receiver_sid)
            sio.enter_room(receiver_sid, f"{sender_sid}-room")
    else:
        await sio.emit('log', data='', to=receiver_sid)

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('decline-invitation')
async def decline_invitation( sender_sid, receiver_sid, data):
    invitations_list.remove(Invitation)

def remove_from_all_rooms(sid):
    for room in sio.rooms(sid):
        sio.leave_room(sid, room)


def start_server():
    web.run_app(app, port=8000)

class Invitation:
    # Sender is client who sends "send-invitation" event, receiver is a client to be invated
    def __init__(self,sender_sid, receiver_sid):
        self.sender_sid = sender_sid
        self.receiver_sid = receiver_sid


