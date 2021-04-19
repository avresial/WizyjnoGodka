from aiohttp import web
import socketio
from User import user_list


ROOM = 'All'
users_list = user_list.UserList()
invitations_list = []
rooms_list = [ROOM]
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)


@sio.event
async def connect(sid, environ):
    sio.enter_room(sid, rooms_list[0])
    print('Connected', sid)
    print("rooms_list: ",rooms_list)
    users_list.append_new_user(sid)
    

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
    print("sending data to ", sid, str)
    await sio.emit('connections', data=str, to=sid)


@sio.on('data')
async def data(sid, data): # data is going to be Video and audio
    print('Message from {}: {}'.format(sid, data))
    await sio.emit('data', data, room=ROOM, skip_sid=sid)


@sio.on('chat')
async def pass_data(sid, message):
    print("chat message sent - ", message)
    await sio.emit('message', data=message, room=ROOM, skip_sid=sid)


@sio.on('name')
async def pass_name(sid, name):
    print(sid,"name set to -", name)
    for user in users_list.list_of_users:
        if user.compare(sid):
            user.set_name(name)
            json_object = users_list.parse_user_to_json(user)
            await sio.emit('add-connection', data=json_object, skip_sid=sid)
            break


# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('send-invitation')
async def send_invitation(sender_sid, receiver_sid):
    print("sender_sid", sender_sid,"receiver_sid",receiver_sid )
    invitations_list.append(Invitation(receiver_sid, sender_sid))
    await sio.emit('receive-invite', data=sid, to=receiver_sid)

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('accept-invitation')
async def accept_invitation(sender_sid, receiver_sid, data):
    if data == 'Accepted':
        if(invitations_list.__contains__(Invitation(receiver_sid, sender_sid))):
            print("Accepted invitation")
            remove_from_all_rooms(sender_sid)
            rooms_list.append(str(sender_sid))
            sio.enter_room(sender_sid, f"{sender_sid}-room")
            remove_from_all_rooms(receiver_sid)
            sio.enter_room(receiver_sid, f"{sender_sid}-room")
        else:
            print("No invitation on invitations list :c")
    else:
        print("Invitation not accepted")
        await sio.emit('log', data='', to=receiver_sid)

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('decline-invitation')
async def decline_invitation( sender_sid, receiver_sid, data):
    print("Invitation declined")
    invitations_list.remove(Invitation)

def remove_from_all_rooms(sid):
    print(sid, " is being removed")
    for room in sio.rooms(sid):
        if room != sid:
            sio.leave_room(sid, room)


def start_server():
    print("Server started")
    web.run_app(app, port=8000)

class Invitation:
    # Sender is client who sends "send-invitation" event, receiver is a client to be invated
    def __init__(self,sender_sid, receiver_sid):
        self.sender_sid = sender_sid
        self.receiver_sid = receiver_sid


