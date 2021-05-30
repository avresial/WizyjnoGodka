export const io = require('socket.io-client');
export const socket = io('127.0.0.1:8000', { autoConnect: false });
export const PC_CONFIG = {
        iceServers: [
        {
        urls: ["stun:stun.l.google.com:19302"]
        }
    ]};