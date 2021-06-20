from aiohttp import web
import socketio, json, time, sys
from User.user_list import UserList
from Invitation.invitation import Invitation, EncodeInvitation
from Invitation.invitation_list import InvitationList
from loguru import logger


class Room:
    def __init__(self, room):
        self.sid_list = []
        self.room = room

    def append_to_list(self, sid):
        self.sid_list.append(sid)

    def remove_from_list(self, sid):
        self.sid_list.remove(sid)

    def get_all_sid_from_room(self) -> str:
        json_list = json.dumps(self.sid_list)
        return json_list

    def if_sid_is_in_room(self, sid):
        if self.sid_list.__contains__(sid):
            return True
        else:
            return False

    def are_sids_in_room(self, sid1, sid2):
        if self.sid_list.__contains__(sid1) and self.sid_list.__contains__(sid2):
            return True
        else:
            return False


users_list = UserList()
invitations_list = InvitationList()
rooms_list = {}
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


@sio.on('candidate')
async def candidate(sid, candidate_data):
    logger.info(f"Message from {sid}: {candidate_data}")
    to_sid = candidate_data['receiver_sid']
    await sio.emit('candidate', candidate_data, skip_sid=sid, to=to_sid)


@sio.on('offer')
async def offer(sid, offer_data):
    logger.info(f"Message from {sid}: {offer_data}")
    to_sid = offer_data['receiver_sid']
    await sio.emit('offer', offer_data, skip_sid=sid, to=to_sid)


@sio.on('answer')
async def answer(sid, answer_data):
    logger.info(f"Message from {sid}: {answer_data}")
    to_sid = answer_data['receiver_sid']
    await sio.emit('answer', answer_data, skip_sid=sid, to=to_sid)


@sio.on('chat')
async def pass_chat_data(sid, message):
    logger.info(f"chat message sent: {message}")
    try:
        if sio.rooms(sid)[0] != sid:
            await sio.emit('message', message, room=sio.rooms(sid)[0], skip_sid=sid)
        else:
            await sio.emit('message', message, room=sio.rooms(sid)[1], skip_sid=sid)
    except IndexError as e:
        logger.warning(f'index error in chat data: {e}')


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
    for room in rooms_list:
        if rooms_list[room].are_sids_in_room(sender_sid, receiver_sid):
            logger.warning(f"sender sid: {sender_sid} & receiver sid: {receiver_sid} are already in the same room")
            await sio.emit('room-is-already-set', to=sender_sid)
            return

    if invitations_list.count_same_invitations(sender_sid, receiver_sid) < 5:
        invitations_list.append(sender_sid, receiver_sid)
        logger.info(f"New pending invitation - sender sid: {sender_sid} & receiver sid: {receiver_sid}")

    str = json.dumps(Invitation(sender_sid, receiver_sid), indent=2, cls=EncodeInvitation)
    await sio.emit('receive-invite', data=str, to=receiver_sid)
    await sio.sleep(10)
    if invitations_list.invitation_exist(sender_sid, receiver_sid):
        await sio.emit('invite-expired-receiver', data=str, to=receiver_sid)
        await sio.emit('invite-expired-sender', data=str, to=sender_sid)
        invitations_list.remove(sender_sid, receiver_sid)
        logger.debug(f"invitation {sender_sid}->{receiver_sid} expired")


# Sender is client who sends "send-invitation" event, receiver is a client to be invited
@sio.on('accept-invitation')
async def accept_invitation(sid, data):
    new_data = json.loads(data)
    receiver_sid = new_data["receiver_sid"]
    sender_sid = new_data["sender_sid"]
    
    if invitations_list.invitation_exist(sender_sid, receiver_sid):
        if len(sio.rooms(sender_sid)) > 1:
            room = add_receiver_to_already_existed_room(sender_sid, receiver_sid)
        else:
            room = create_new_room_and_add_participants(sender_sid, receiver_sid)
        logger.info(f"{receiver_sid} accepted invitation from {sender_sid}")
        invitations_list.remove(sender_sid, receiver_sid)
        str = json.dumps(Invitation(sender_sid, receiver_sid), indent=2, cls=EncodeInvitation)
        await sio.emit('invite-accepted', data=str, to=sender_sid)

        json_list = rooms_list[room].get_all_sid_from_room()
        await sio.emit('create-peer', data=json_list, room=room)
    else:
        logger.error(f"{sender_sid}->{receiver_sid} invitation not found")


def add_receiver_to_already_existed_room(sender_sid, receiver_sid) -> str:
    logger.debug(f"adding {receiver_sid} to already existed room")
    remove_from_all_rooms(receiver_sid)

    if sio.rooms(sender_sid)[0] != sender_sid:
        current_room = sio.rooms(sender_sid)[0]
    else:
        current_room = sio.rooms(sender_sid)[1]

    sio.enter_room(receiver_sid, current_room)
    rooms_list[current_room].append_to_list(receiver_sid)

    logger.debug(f"sio.rooms(sender_sid) {sio.rooms(sender_sid)}")
    logger.debug(f"sio.rooms(receiver_sid) {sio.rooms(receiver_sid)}")
    return current_room


def create_new_room_and_add_participants(sender_sid, receiver_sid) -> str:
    logger.debug(f"adding {receiver_sid} to newly created room")
    new_room_name = str(sender_sid + str(time.strftime("%H:%M:%S", time.localtime())) + "room")

    room = Room(new_room_name)
    room.append_to_list(sender_sid)
    room.append_to_list(receiver_sid)
    rooms_list[new_room_name] = room

    sio.enter_room(sender_sid, new_room_name)
    remove_from_all_rooms(receiver_sid)
    sio.enter_room(receiver_sid, new_room_name)
    logger.debug(f"sio.rooms(sender_sid) {sio.rooms(sender_sid)}")
    logger.debug(f"sio.rooms(receiver_sid) {sio.rooms(receiver_sid)}")
    return new_room_name


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
        if sid == sender_sid:
            await sio.emit('invite-declined', data=str, to=receiver_sid)
        else:
            await sio.emit('invite-declined', data=str, to=sender_sid)
        for invitation in invitations_list.list_of_invitations:
            logger.debug(f"{invitation.sender_sid}->{invitation.receiver_sid}")


# Sender is client who sends "send-invitation" event, receiver is a client to be invited
@sio.on('leave-all-rooms')
async def decline_invitation(sid):
    logger.debug(f"before removal:{sio.rooms(sid)}")
    remove_from_all_rooms(sid)
    logger.debug(f"after removal:{sio.rooms(sid)}")


@sio.on('toggle-mic')
async def toggle_mic(sid):
    for room in sio.rooms(sid):
        if room != sid:
            await sio.emit('toggle-mic', data={'sender_sid': sid}, to=room)


@sio.on('toggle-video')
async def toggle_mic(sid):
    for room in sio.rooms(sid):
        if room != sid:
            await sio.emit('toggle-video', data={'sender_sid': sid}, to=room)


def remove_from_all_rooms(sid):
    logger.debug(f"{sid} is being removed from all rooms")
    for room in sio.rooms(sid):
        if room != sid:
            sio.leave_room(sid, room)


@sio.on('leave-room')
async def leave_rooms(sid):
    for custom_room in rooms_list:
        if rooms_list[custom_room].if_sid_is_in_room(sid):
            rooms_list[custom_room].remove_from_list(sid)

    for room in sio.rooms(sid):
        if room != sid:
            await sio.emit('remove-peer-connection', data={'sender_sid': sid}, room=room)
            sio.leave_room(sid, room)


def start_server():
    logger.success("Server started")
    web.run_app(app, port=8000)
