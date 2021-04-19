from aiohttp import web
import socketio
import random
import json
import time

class Invitation:
    # Sender is client who sends "send-invitation" event, receiver is a client to be invated
    def __init__(self,sender_sid, receiver_sid):
        self.sender_sid = sender_sid
        self.receiver_sid = receiver_sid

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def disconnect():
    print('disconnected from server')

@sio.on('add-connection')
def connections(data):
    #Data is user type
    print("EVENT - add-connection")
    new_user = json.loads(data)
    print("New boy connected")
    print('name:',new_user["name"])
    print('sid:',new_user["sid"])
    print("")

    #klient zaprasza nowych userów
    #time.sleep(2)
    #sio.emit("send-invitation", new_user["sid"])
    #print('Sent invitation to: ', new_user["sid"])
    

@sio.on('connections')
def connections(data):
    print("EVENT - connections")
    connections = json.loads(data)
    print('connections Json is as follows:')
    


@sio.on('receive-invite')
def connections(data):
    print("EVENT - receive-invite")
    received_invitation = json.loads(data)
    sio.emit("accept-invitation", data)
    print('accepted invitation from: ', received_invitation["sender_sid"])
   
sio.connect('http://localhost:8000')

sio.emit("name", "TestNamekurde-" + str(random.randint(0,100)))

sio.emit("connections")
