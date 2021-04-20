import React, {useState, useRef, useEffect} from 'react'
import Video from './Video'
import classes from './VideoArea.module.css'
import {socket, PC_CONFIG} from '../../Context/socket'

const VideoArea = (props) => {
    const [listOfVideos, setlistOfVideos] = useState(['own_video']);
    const userVideo = useRef();
    const stream = useRef();
    const guestVideo = useRef();

    useEffect( () => {
        socket.on('data', (data) => {
            console.log("Data received");
            handleSignalingData(data);
          });
      
          socket.on('ready', () => {
            createPeerConnection();
            sendOffer();
            console.log('Ready');
          });
      
          const sendData = (data) => {
            socket.emit('data', data);
          };
      
          const onIceCandidate = (event) => {
            if (event.candidate) {
              console.log('ICE candidate');
              sendData({
                type: 'candidate',
                candidate: event.candidate
              });
            }
          };
      
          const onAddStream = (event) => {
            console.log('Add stream');
            guestVideo.current.srcObject = event.stream;
          };
      
          let pc;
          const createPeerConnection = () => {
            try {
              pc = new RTCPeerConnection(PC_CONFIG);
              pc.onicecandidate = onIceCandidate;
              pc.onaddstream = onAddStream;
              if (stream.current) {
                pc.addStream(stream.current);
              }
              console.log('PeerConnection created');
            } catch (error) {
              console.error('PeerConnection failed: ', error);
            }
          };
      
          const sendOffer = () => {
            console.log('Send offer');
            pc.createOffer().then(
              setAndSendLocalDescription,
              (error) => { console.error('Send offer failed: ', error); }
            );
          };
          
          const sendAnswer = () => {
            console.log('Send answer');
            pc.createAnswer().then(
              setAndSendLocalDescription,
              (error) => { console.error('Send answer failed: ', error); }
            );
          };
          
          const setAndSendLocalDescription = (sessionDescription) => {
            pc.setLocalDescription(sessionDescription);
            console.log('Local description set');
            sendData(sessionDescription);
          };
      
          const handleSignalingData = (data) => {
            switch (data.type) {
              case 'offer':
                createPeerConnection();
                pc.setRemoteDescription(new RTCSessionDescription(data));
                sendAnswer();
                break;
              case 'answer':
                pc.setRemoteDescription(new RTCSessionDescription(data));
                break;
              case 'candidate':
                pc.addIceCandidate(new RTCIceCandidate(data.candidate));
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