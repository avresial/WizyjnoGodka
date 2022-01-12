const IP_ADDRES = process.env.IP_ADDRES || '127.0.0.1';
const PORT = process.env.PORT || '8000'
export const io = require('socket.io-client');
export const socket = io( IP_ADDRES + ':' + PORT, { autoConnect: false });
export const PC_CONFIG = {
        iceServers: [
        {
        urls: ["stun:stun.l.google.com:19302"]
        }
    ]};
