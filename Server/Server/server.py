from aiohttp import web
import socketio, json, time, sys
from User.user_list import UserList
from Invitation.invitation import Invitation, EncodeInvitation
from Invitation.invitation_list import InvitationList
from loguru import logger

BaseAllRoom = 'All'
users_list = UserList()
invitations_list = InvitationList()
rooms_list = [BaseAllRoom]
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)
logger.remove()
logger.add(sys.stdout,
           level='DEBUG',
           format='<green>{time:HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{function: <21}</cyan> - <level>{message}</level>',
           filter=None,
           colorize=True,
           serialize=False,
           backtrace=True,
           diagnose=True,
           enqueue=True,
           catch=True
           )

@sio.event
async def connect(sid, environ):
    sio.enter_room(sid, BaseAllRoom)
    logger.success(f"Connected {sid}")
    logger.debug(f"rooms list: {rooms_list}")
    users_list.append_new_user(sid)

@sio.event
async def disconnect(sid):
    users_list.remove_user(sid)
    for room in sio.rooms(sid):
        sio.leave_room(sid, room)
    await sio.emit('remove-connection', data=sid, skip_sid=sid)
    logger.opt(colors=True).info(f"<yellow>Disconnected {sid}</yellow>")


@sio.on('connections')
async def get_users(sid):
    str = users_list.get_user_list_in_json(sid)
    logger.info(f"sending data to {sid}: {str}")
    await sio.emit('connections', data=str, to=sid)


@sio.on('data')
async def data(sid, data): # data is going to be Video and audio
    logger.info(f"Message from {sid}: {data}")
    if sio.rooms(sid)[0] != sid:
        await sio.emit('data', data, room=sio.rooms(sid)[0], skip_sid=sid)
    else:
        await sio.emit('data', data, room=sio.rooms(sid)[1], skip_sid=sid)


@sio.on('chat')
async def pass_chat_data(sid, message):
    logger.info(f"chat message sent: {message}")
    if sio.rooms(sid)[0] != sid:
        await sio.emit('message', message, room=sio.rooms(sid)[0], skip_sid=sid)
    else:
        await sio.emit('message', message, room=sio.rooms(sid)[1], skip_sid=sid)

@sio.on('name')
async def pass_new_clients_name(sid, name):
    logger.info(f"name set to: {name}")
    for user in users_list.list_of_users:
        if user.compare(sid):
            user.set_name(name)
            json_object = users_list.parse_user_to_json(user)
            await sio.emit('add-connection', data=json_object, skip_sid=sid)
            break


# Sender is client who sends "send-invitation" event, receiver is a client to be invited
@sio.on('send-invitation')
@logger.catch
async def send_invitation(sender_sid, receiver_sid):
    if invitations_list.count_same_invitations(sender_sid, receiver_sid) < 5:
        invitations_list.append(sender_sid, receiver_sid)
        logger.info(f"New pending invitation - sender sid: {sender_sid} & receiver sid: {receiver_sid}")

    str = json.dumps(Invitation(sender_sid, receiver_sid), indent=2, cls=EncodeInvitation)
    await sio.emit('receive-invite', data=str, to=receiver_sid)
    await sio.sleep(10)
    if invitations_list.invitation_exist(sender_sid, receiver_sid):
        await sio.emit('invite-expired', data=str, to=receiver_sid)
        invitations_list.remove(sender_sid, receiver_sid)
        logger.debug(f"invitation {sender_sid}->{receiver_sid} expired")


# Sender is client who sends "send-invitation" event, receiver is a client to be invited
@sio.on('accept-invitation')
async def accept_invitation(sid, data):
    new_data = json.loads(data)
    receiver_sid = new_data["receiver_sid"]
    sender_sid = new_data["sender_sid"]
    
    if invitations_list.invitation_exist(sender_sid,receiver_sid):
        if len(sio.rooms(sender_sid)) > 1:
            add_receiver_to_already_existed_room(sender_sid,receiver_sid)
        else:
            create_new_room_and_add_participants(sender_sid,receiver_sid)
        logger.info(f"{receiver_sid} accepted invitation from {sender_sid}")
        invitations_list.remove(sender_sid, receiver_sid)
        str = json.dumps(Invitation(sender_sid, receiver_sid), indent=2, cls=EncodeInvitation)
        await sio.emit('invite-accepted', data=str, to=sender_sid)
    else:
        logger.error(f"{sender_sid}->{receiver_sid} invitation not found")


def add_receiver_to_already_existed_room(sender_sid, receiver_sid) -> None:
    logger.debug(f"adding {receiver_sid} to already existed room")
    remove_from_all_rooms(receiver_sid)
    if sio.rooms(sender_sid)[0] != sender_sid:
        sio.enter_room(receiver_sid, sio.rooms(sender_sid)[0])
    else:
        sio.enter_room(receiver_sid, sio.rooms(sender_sid)[1])
    logger.debug(f"sio.rooms(sender_sid) {sio.rooms(sender_sid)}")
    logger.debug(f"sio.rooms(receiver_sid) {sio.rooms(receiver_sid)}")


def create_new_room_and_add_participants(sender_sid, receiver_sid) -> None:
    logger.debug(f"adding {receiver_sid} to newly created room")
    newRoom = str(sender_sid + str(time.strftime("%H:%M:%S", time.localtime())) + "room")
    rooms_list.append(newRoom)
    sio.enter_room(sender_sid, newRoom)
    remove_from_all_rooms(receiver_sid)
    sio.enter_room(receiver_sid, newRoom)
    logger.debug(f"sio.rooms(sender_sid) {sio.rooms(sender_sid)}")
    logger.debug(f"sio.rooms(receiver_sid) {sio.rooms(receiver_sid)}")


# Sender is client who sends "send-invitation" event, receiver is a client to be invited
@sio.on('decline-invitation')
async def decline_invitation(sid, data):
    new_data = json.loads(data)
    sender_sid = new_data["sender_sid"]
    receiver_sid = new_data["receiver_sid"]

    if invitations_list.invitation_exist(sender_sid, receiver_sid):
        invitations_list.remove(sender_sid, receiver_sid)
        logger.debug(f"invitation {sender_sid}->{receiver_sid} declined")
        str = json.dumps(Invitation(sender_sid, receiver_sid), indent=2, cls=EncodeInvitation)
        await sio.emit('invite-declined', data=str, to=sender_sid)
        for invitation in invitations_list:
            logger.debug(f"{invitation.sender_sid}->{invitation.receiver_sid}")


# Sender is client who sends "send-invitation" event, receiver is a client to be invited
@sio.on('leave-all-rooms')
async def decline_invitation(sid):
    logger.debug(f"before removal:{sio.rooms(sid)}")
    remove_from_all_rooms(sid)
    logger.debug(f"after removal:{sio.rooms(sid)}")


def remove_from_all_rooms(sid):
    logger.debug(f"{sid} is being removed from all rooms")
    for room in sio.rooms(sid):
        if room != sid:
            sio.leave_room(sid, room)


def start_server():
    logger.success("Server started")
    web.run_app(app, port=8000)
