import json


class Invitation:
    # Sender is client who sends "send-invitation" event, receiver is a client to be invated
    def __init__(self,sender_sid, receiver_sid):
        self.sender_sid = sender_sid
        self.receiver_sid = receiver_sid


class EncodeInvitation(json.JSONEncoder):
    def default(self, o):
        return o.__dict__
