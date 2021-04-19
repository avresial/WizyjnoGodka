from aiohttp import web
import socketio
import random
import json

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def disconnect():
    print('disconnected from server')

@sio.on('connections')
def connections(data):
    tererere = json.loads(data)
    print('connections Json is as follows:')
    for no in tererere:
        print(no["name"])

sio.connect('http://localhost:8000')

sio.emit("name", "TestNamekurde-" + str(random.randint(0,100)))

sio.emit("connections")
