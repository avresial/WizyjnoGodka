import React, {useState, useRef, useEffect} from 'react'
import Video from './Video'
import classes from './VideoArea.module.css'
import {socket, PC_CONFIG} from '../../Context/socket'

const VideoArea = (props) => {
    const userVideo = useRef();
    const stream = useRef();
    const guestVideo = useRef();

    useEffect( () => {
        const peerConnections = {};

        socket.on('data', (data) => {
            console.log("Data received");
            handleSignalingData(data);
          });

          socket.on('ready', (data) => {
            const sender_id = JSON.parse(data).id
            console.log(sender_id);
            createPeerConnection(sender_id);
            sendOffer(sender_id);
          });
      
          const sendData = (data) => {
            socket.emit('data', data);
          };
     
          const createPeerConnection = (sender_id) => {
            try {
              const pc = new RTCPeerConnection(PC_CONFIG);
              peerConnections[sender_id] = pc;
              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  console.log('ICE candidate');
                  const dataToSend = {
                    receiver_sid: sender_id,
                    sender_sid: socket.id,
                    type: 'candidate',
                    candidate: event.candidate
                  }
                  sendData(dataToSend);
                }
              };
              pc.onaddstream = (event) => {
                console.log('Add stream');
                guestVideo.current.srcObject = event.stream;
              };
              if (stream.current) {
                pc.addStream(stream.current);
                console.log("Added local stream");
              }
              console.log('PeerConnection created');
            } catch (error) {
              console.error('PeerConnection failed: ', error);
            }
          };
      
          const sendOffer = (sender_id) => {
            console.log('Send offer');
            peerConnections[sender_id].createOffer().then( (offer) => {
              peerConnections[sender_id].setLocalDescription(offer);
              console.log('Local description set');
              const dataToSend = {
                type: offer.type,
                receiver_sid: sender_id,
                sender_sid: socket.id,
                description: offer
              }
              sendData(dataToSend);
            });
          };
          
          const sendAnswer = (sender_id) => {
            console.log('Send answer');
            peerConnections[sender_id].createAnswer().then((answer) => {
              peerConnections[sender_id].setLocalDescription(answer);
              console.log('Local description set');
              const dataToSend = {
                type: answer.type,
                receiver_sid: sender_id,
                sender_sid: socket.id,
                description: answer
              }
              sendData(dataToSend);
            });
          };
          
          const handleSignalingData = (data) => {
            switch (data.type) {
              case 'offer':
                createPeerConnection(data.sender_sid);
                peerConnections[data.sender_sid].setRemoteDescription(new RTCSessionDescription(data.description));
                sendAnswer(data.sender_sid);
                break;
              case 'answer':
                peerConnections[data.sender_sid].setRemoteDescription(new RTCSessionDescription(data.description));
                break;
              case 'candidate':
                console.log("Candidate IN HANDLE");
                peerConnections[data.sender_sid].addIceCandidate(new RTCIceCandidate(data.candidate));
                break;
            }
          };
    }, []);

    useEffect(() => {
        if (props.videoOn) {
            navigator.mediaDevices.getUserMedia({audio:false, video:true}).then((mediaStream) => {
                stream.current = mediaStream;
                if(userVideo.current) {
                    userVideo.current.srcObject = mediaStream;
                }
            });
        }
        else {
            try{
                const tracks = stream.current.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            } catch (e) {
                console.log(e);
            }
        }
    }, [props.videoOn]);

    return (
        <div className={`row ${classes.VideoArea}`}>
            <Video videoOn = {props.videoOn} userVideo = {userVideo} ></Video>
            <Video videoOn = {true} userVideo = {guestVideo} ></Video>
            {/* {
                listOfVideos.map((currentItem, index) => {
                    return(
                        <Video key = {index} videoOn = {props.videoOn} userVideo = {userVideo} ></Video>
                    );
                })
            } */}
        </div>
    );
};

export default VideoArea;