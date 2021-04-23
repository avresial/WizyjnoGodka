from aiohttp import web
import socketio
from User import user_list
from Invitation import invitation as inv
import json
import time


BaseAllRoom = 'All'
users_list = user_list.UserList()
invitations_list = []
rooms_list = [BaseAllRoom]
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)


@sio.event
async def connect(sid, environ):
    print("EVENT - connect")
    sio.enter_room(sid, BaseAllRoom)
    print(" ",'Connected', sid)
    print(" ","rooms_list: ",rooms_list)
    users_list.append_new_user(sid)
    print("END event\n") 

@sio.event
async def disconnect(sid):
    print("EVENT - disconnect")
    users_list.remove_user(sid)
    for room in sio.rooms(sid):
        sio.leave_room(sid, room)
    await sio.emit('remove-connection', data=sid, skip_sid=sid)
    print(" ",'Disconnected', sid)
    print("END event\n")


@sio.on('connections')
async def get_users(sid):
    print("EVENT - connections ")
    str = users_list.get_user_list_in_json(sid)
    print(" ","sending data to ", sid, str)
    await sio.emit('connections', data=str, to=sid)
    print("END event\n")


@sio.on('data')
async def data(sid, data): # data is going to be Video and audio
    print("EVENT - data ")
    print(" ",'Message from {}: {}'.format(sid, data))

    if sio.rooms(sid)[0] != sid:
        await sio.emit('data', data, room=sio.rooms(sid)[0], skip_sid=sid)
    else:
        await sio.emit('data', data, room=sio.rooms(sid)[1], skip_sid=sid)
    
    print("END event\n") 

@sio.on('chat')
async def pass_chat_data(sid, message):
    print("EVENT - chat ")
    print(" ","chat message sent - ", message)
    if sio.rooms(sid)[0] != sid:
        await sio.emit('message', message, room=sio.rooms(sid)[0], skip_sid=sid)
    else:
        await sio.emit('message', message, room=sio.rooms(sid)[1], skip_sid=sid)
    print("END event\n") 

@sio.on('name')
async def pass_new_clients_name(sid, name):
    print("EVENT - name ")
    print(" ",sid,"name set to -", name)
    for user in users_list.list_of_users:
        if user.compare(sid):
            user.set_name(name)
            json_object = users_list.parse_user_to_json(user)
            await sio.emit('add-connection', data=json_object, skip_sid=sid)
            print("END EVENT")
            print(" ")
            break
    print("END event\n")


# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('send-invitation')
async def send_invitation(sender_sid, receiver_sid):
    print("EVENT - send-invitation ")
    print(" ","sender_sid", sender_sid,"receiver_sid",receiver_sid )
    invitations_list.append(inv.Invitation(sender_sid,receiver_sid))
    str = json.dumps(inv.Invitation(sender_sid, receiver_sid), indent=2, cls=inv.EncodeInvitation)
    await sio.emit('receive-invite', data=str, to=receiver_sid)
    print("END event\n") 

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('accept-invitation')
async def accept_invitation(sid,data):
    print("EVENT - accept-invitation ")

    new_data = json.loads(data)
    receiver_sid = new_data["receiver_sid"]
    sender_sid = new_data["sender_sid"]
    
    if is_this_invitation_on_list(sender_sid,receiver_sid):
        print(" ","Accepted invitation")
        
        if len(sio.rooms(sender_sid)) > 1:
            add_receiver_to_already_existed_room(sender_sid,receiver_sid)
        else:
            create_new_room_and_add_participants(sender_sid,receiver_sid)
    else:
        print(" ","invitation not found :c")
    print("END event\n")

def is_this_invitation_on_list(sender_sid,receiver_sid) -> bool:
    for invitation in invitations_list:
        if invitation.sender_sid == sender_sid and invitation.receiver_sid == receiver_sid:
            return True
    return False 

def add_receiver_to_already_existed_room(sender_sid,receiver_sid) -> None:
    print(" ","adding receiver sid to already existed room")
    remove_from_all_rooms(receiver_sid)
    if sio.rooms(sender_sid)[0] != sender_sid:
        sio.enter_room(receiver_sid, sio.rooms(sender_sid)[0])
    else:
        sio.enter_room(receiver_sid, sio.rooms(sender_sid)[1])
    print(" ","sio.rooms(sender_sid)", sio.rooms(sender_sid))
    print(" ","sio.rooms(receiver_sid)", sio.rooms(receiver_sid))

def create_new_room_and_add_participants(sender_sid,receiver_sid) -> None:    
    print(" ","adding receiver sid to newly created room")
    newRoom = str(sender_sid + str(time.strftime("%H:%M:%S", time.localtime())) + "room")
    rooms_list.append(newRoom)
    sio.enter_room(sender_sid, newRoom)
    remove_from_all_rooms(receiver_sid)
    sio.enter_room(receiver_sid, newRoom)
    print(" ","sio.rooms(sender_sid)", sio.rooms(sender_sid))
    print(" ","sio.rooms(receiver_sid)", sio.rooms(receiver_sid))

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('decline-invitation')
async def decline_invitation(sid, data):
    print("EVENT - decline-invitation ")
    new_data = json.loads(data)
    for invitation in invitations_list:
        if invitation.sender_sid == new_data["sender_sid"] and invitation.receiver_sid == new_data["receiver_sid"]:
            print(" ","removed: ",invitation.sender_sid,invitation.receiver_sid)
            invitations_list.remove(invitation)
            for invitation in invitations_list:
                print(invitation.sender_sid,invitation.receiver_sid)
    print("END event\n")

# Sender is client who sends "send-invitation" event, receiver is a client to be invated
@sio.on('leave-all-rooms')
async def decline_invitation(sid):
    print("EVENT - leave-all-rooms ")
    print(" ",sio.rooms(sid))
    remove_from_all_rooms(sid)
    print(" ",sio.rooms(sid))
    print("END event\n")

def remove_from_all_rooms(sid):
    print(sid, " is being removed from all rooms")
    for room in sio.rooms(sid):
        if room != sid:
            sio.leave_room(sid, room)

def start_server():
    print("Server started")
    web.run_app(app, port=8000)