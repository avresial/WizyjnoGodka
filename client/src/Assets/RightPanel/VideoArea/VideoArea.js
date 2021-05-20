import React, {useState, useRef, useEffect} from 'react'
import Video from './VideoUser/VideoUser'
import VideoGuest from './VideoGuest/VideoGuest'
import classes from './VideoArea.module.css'
import {socket, PC_CONFIG} from '../../Context/socket'

const peerConnections = {};
const senderTracks = {};

const VideoArea = (props) => {
    const userVideo = useRef();
    const stream = useRef();
    const [peerStreams, setPeerStreams] = useState([]);
    const [isStreamSet, setIsStreamSet] = useState(false);

    useEffect( () => {
        socket.on('data', (data) => {
            handleSignalingData(data);
          });

          socket.on('users-connected', data => {
            const arr = JSON.parse(data);
            arr.forEach( (element, index, array) => {
              createPeerConnection(element.sid);
            });
          });

          socket.on('ready', (data) => {
            const sender_id = JSON.parse(data).id;
            createPeerConnection(sender_id);
          });
      
          const sendData = (data) => {
            socket.emit('data', data);
          };
     
          const createPeerConnection = (sender_id) =>  {
            try {
              if (!peerConnections[sender_id]) {
                const pc = new RTCPeerConnection(PC_CONFIG);
                peerConnections[sender_id] = pc;
              }

              peerConnections[sender_id].addEventListener("iceconnectionstatechange", event => {
                if (peerConnections[sender_id].iceConnectionState === "failed") {
                  peerConnections[sender_id].restartIce();
                }
              });

              peerConnections[sender_id].onicecandidate = (event) => {
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

              peerConnections[sender_id].ontrack = ({track, streams: [stream]}) => {
                stream.onremovetrack = (event) => {
                  setPeerStreams( peerStreams => {
                    const tempPeerStreams = [...peerStreams];
                    tempPeerStreams.map( (streamItem, index) => {
                      if (streamItem.id === sender_id) {
                        tempPeerStreams.splice(index, 1);
                      };
                      return 0;
                    });
                    return tempPeerStreams;
                  });
                };
                
                setPeerStreams( peerStreams => {
                  const tempPeerStreams = [...peerStreams];
                  tempPeerStreams.push({id: sender_id, data: stream});
                  return tempPeerStreams;
                });
              }; 

              peerConnections[sender_id].onnegotiationneeded = () => {
                sendOffer(sender_id);
              };

              if (stream.current) {
                const tracks = stream.current.getTracks();
                tracks.forEach( (track) => {
                  senderTracks[sender_id] = peerConnections[sender_id].addTrack(track, stream.current);
                });
                setIsStreamSet(true);
              }
              console.log('PeerConnection created');
            } catch (error) {
              console.error('PeerConnection failed: ', error);
            }
          };
      
          const sendOffer = async (sender_id) => {
            const offer = await peerConnections[sender_id].createOffer();
            await peerConnections[sender_id].setLocalDescription(offer);
            const dataToSend = {
              type: offer.type,
              receiver_sid: sender_id,
              sender_sid: socket.id,
              description: offer
            }
            sendData(dataToSend);
          };
          
          const sendAnswer = async (sender_id) => {
            const answer = await peerConnections[sender_id].createAnswer();
            await peerConnections[sender_id].setLocalDescription(answer);
            const dataToSend = {
              type: answer.type,
              receiver_sid: sender_id,
              sender_sid: socket.id,
              description: answer
            }
            sendData(dataToSend);
          };

          const handleSignalingData = async (data) => {
            try {
              switch (data.type) {
                case 'offer':
                  if (!peerConnections[data.sender_sid]) {
                    createPeerConnection(data.sender_sid);
                  }
                  await peerConnections[data.sender_sid].setRemoteDescription(new RTCSessionDescription(data.description));
                  sendAnswer(data.sender_sid);
                  console.log("REMOTE OFFER");
                  break;
                case 'answer':
                  await peerConnections[data.sender_sid].setRemoteDescription(new RTCSessionDescription(data.description));
                  console.log("REMOTE ANSWER");
                  break;
                case 'candidate':
                  if (data.candidate) {
                    await peerConnections[data.sender_sid].addIceCandidate(new RTCIceCandidate(data.candidate));
                    console.log("REMOTE ICE-CANDIDATE");
                  }
                  break;
              }
            } catch (error) {
              console.error(error);
            }
          };
    }, []);

    useEffect(() => {
        if (props.videoOn) {
            navigator.mediaDevices.getUserMedia({audio:false, video:true}).then((mediaStream) => {
                stream.current = mediaStream;
                if(userVideo.current) {
                    userVideo.current.srcObject = mediaStream;
                    if (!isStreamSet) {
                      const tracks = stream.current.getTracks();
                      Object.keys(peerConnections).map(function(key, index) {
                        tracks.forEach( (track) => {
                          console.log(peerConnections[key].currentRemoteDescription);
                          senderTracks[key] = peerConnections[key].addTrack(track, stream.current);
                        });
                      });
                      setIsStreamSet(true);
                    }
                }
            });
        }
        else {
            try{
                const tracks = stream.current.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                    Object.keys(peerConnections).map(function(key, index) {
                      console.log("REMOVED TRACK");
                      peerConnections[key].removeTrack(senderTracks[key]);
                    });
                    setIsStreamSet(false);
                });
            } catch (e) {
                console.log(e);
            }
        }
    }, [props.videoOn]);

    return (
        <div className={`row ${classes.VideoArea}`}>
            <Video videoOn = {true} userVideo = {userVideo} ></Video>
            {
                peerStreams.map( currentItem => {
                    return(
                        <VideoGuest key = {currentItem.id} videoOn = {true} pc={currentItem.data}></VideoGuest>
                    );
                })
            }
        </div>
    );
};

export default VideoArea;