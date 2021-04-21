import React, {useState, useRef, useEffect} from 'react'
import Video from './Video'
import classes from './VideoArea.module.css'
import {socket, PC_CONFIG} from '../../Context/socket'

const VideoArea = (props) => {
    // const [listOfConnections, setlistOfConnections] = useState([]);
    const userVideo = useRef();
    const stream = useRef();
    const guestVideo = useRef();

    useEffect( () => {
      const peerConnections = {};
      socket.on("watcher", id => {
        const peerConnection = new RTCPeerConnection(config);
        peerConnections[id] = peerConnection;
      
        let stream = video.srcObject;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
          
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
          }
        };
       
        peerConnection
          .createOffer()
          .then(sdp => peerConnection.setLocalDescription(sdp))
          .then(() => {
            socket.emit("offer", id, peerConnection.localDescription);
          });
      });

      socket.on("offer", (id, description) => {
        peerConnection = new RTCPeerConnection(config);
        peerConnection
          .setRemoteDescription(description)
          .then(() => peerConnection.createAnswer())
          .then(sdp => peerConnection.setLocalDescription(sdp))
          .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
          });
        peerConnection.ontrack = event => {
          video.srcObject = event.streams[0];
        };
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
          }
        };
      });

      socket.on("connect", () => {
        socket.emit("watcher");
      });

      socket.on("broadcaster", () => {
        socket.emit("watcher");
      });
      
      socket.on("answer", (id, description) => {
        peerConnections[id].setRemoteDescription(description);
      });
      
      socket.on("candidate", (id, candidate) => {
        peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("disconnectPeer", id => {
        peerConnections[id].close();
        delete peerConnections[id];
      });

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