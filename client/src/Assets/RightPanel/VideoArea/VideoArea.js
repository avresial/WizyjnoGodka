import React, {useState, useRef, useEffect} from 'react'
import Video from './VideoUser/VideoUser'
import VideoGuest from './VideoGuest/VideoGuest'
import classes from './VideoArea.module.css'
import {socket, PC_CONFIG} from '../../Context/socket'

const peerConnections = {};
const senderTracks = {};
var isStreamSet = false;

const VideoArea = (props) => {
    const userVideo = useRef();
    const stream = useRef();
    const [peerStreams, setPeerStreams] = useState([]);

    useEffect( () => {
        socket.on('remove-peer-connection', async data => {
          if (socket.id !== data.sender_sid) {
            try {
              peerConnections[data.sender_sid].removeTrack(senderTracks[data.sender_sid]);
              delete senderTracks[data.sender_sid];
            } catch (e) {
              console.log('removing sender tracks err:' + e);
            }
            peerConnections[data.sender_sid].close();
            delete peerConnections[data.sender_sid];

            setPeerStreams( peerStreams => {
              const tempPeerStreams = [...peerStreams];
              tempPeerStreams.map( (streamItem, index) => {
                if (streamItem.id === data.sender_sid) {
                  tempPeerStreams.splice(index, 1);
                };
                return 0;
              });
              return tempPeerStreams;
            });
          }
          else {
            try {
            const tracks = stream.current.getTracks();
            tracks.forEach(function(track) {
                track.stop();
                Object.keys(peerConnections).map(function(key, index) {

                  setPeerStreams( peerStreams => {
                    const tempPeerStreams = [...peerStreams];
                    tempPeerStreams.map( (streamItem, index) => {
                      if (streamItem.id === key) {
                        tempPeerStreams.splice(index, 1);
                      };
                      return 0;
                    });
                    return tempPeerStreams;
                  });

                  peerConnections[key].removeTrack(senderTracks[key]);
                  delete senderTracks[key];

                  peerConnections[key].close();
                  delete peerConnections[key];

                  return 0;
                });
                stream.current = null;
                isStreamSet = false;
            });
          } catch (e) {
            console.log(e);
          }
          }
        });

        socket.on('candidate', async data => {
          try {
            if (data.candidate) {
              await peerConnections[data.sender_sid].addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch (error) {
            console.log(error);
          }
        });

        socket.on('answer', async data => {
          try {
            await peerConnections[data.sender_sid].setRemoteDescription(new RTCSessionDescription(data.description));
          } catch (error) {
            console.log(error);
          }
        });

        socket.on('offer', async data => {
          try {
            if (!peerConnections[data.sender_sid]) {
              createPeerConnection(data.sender_sid);
            }
            await peerConnections[data.sender_sid].setRemoteDescription(new RTCSessionDescription(data.description));
            sendAnswer(data.sender_sid);
          } catch (error) {
            console.log(error);
          }
        });

          socket.on('create-peer', data => {
            const arr = JSON.parse(data.peers);
            arr.forEach( (element, index, array) => {
              if (socket.id !== element) {
                createPeerConnection(element);
              }
            });
          });
     
          const createPeerConnection = (sender_id) => {
            try {
              if (!peerConnections[sender_id]) {
                const pc = new RTCPeerConnection(PC_CONFIG);
                peerConnections[sender_id] = pc;
              } else {
                return;
              } 

              peerConnections[sender_id].oniceconnectionstatechange = (event) => {
                if (peerConnections[sender_id].iceConnectionState === "closed") {
                  console.log('iceConnection closed'); 
                }
              };

              peerConnections[sender_id].addEventListener('iceconnectionstatechange', event => {
                if (peerConnections[sender_id].iceConnectionState === 'failed') {
                  peerConnections[sender_id].restartIce();
                }
                else if (peerConnections[sender_id].iceConnectionState === 'disconnected') {
                  console.log("disconnected");
                  try {
                    peerConnections[sender_id].removeTrack(senderTracks[sender_id]);
                    delete senderTracks[sender_id];
                  } catch (e) {
                    console.log('removing sender tracks err:' + e);
                  }
                  peerConnections[sender_id].close();
                  delete peerConnections[sender_id];
      
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
                }
              });

              peerConnections[sender_id].onicecandidate = (event) => {
                if (event.candidate) {
                  const dataToSend = {
                    receiver_sid: sender_id,
                    sender_sid: socket.id,
                    type: 'candidate',
                    candidate: event.candidate
                  }
                  socket.emit('candidate', dataToSend);
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
                  let isInList = false;
                  tempPeerStreams.map( (streamItem, index) => {
                    if (streamItem.id === sender_id) {
                      isInList = true;
                    };
                    return 0;
                  });
                  if (!isInList) {
                    tempPeerStreams.push({id: sender_id, data: stream});
                  }
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
                isStreamSet = true;
              } else {
                navigator.mediaDevices.getUserMedia({audio:true, video:true}).then((mediaStream) => {
                  stream.current = mediaStream;
                  if(userVideo.current) {
                      userVideo.current.srcObject = mediaStream;
                      if (!isStreamSet) {
                        const tracks = stream.current.getTracks();
                        Object.keys(peerConnections).map(function(key, index) {
                          tracks.forEach( (track) => {
                            senderTracks[key] = peerConnections[key].addTrack(track, stream.current);
                          });
                          return 0;
                        });
                        isStreamSet = true;
                      }
                  }
              });
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
            socket.emit('offer', dataToSend);
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
            socket.emit('answer', dataToSend);
          };

    }, []);

    useEffect(() => {
      if (!props.videoOn) {
        const vid = userVideo.current.srcObject.getVideoTracks()[0];
        vid.enabled = false;
      } else if (isStreamSet && props.videoOn) {
        const vid = userVideo.current.srcObject.getVideoTracks()[0];
        vid.enabled = true;
      }
  }, [props.videoOn]);


    return (
        <div className={`row ${classes.VideoArea}`}>
            {
              props.isInRoom ? <Video videoOn = {true} userVideo = {userVideo} ></Video>
              : null
            }
            {
                peerStreams.map( currentItem => {
                    return(
                        <VideoGuest key = {currentItem.id} videoOn = {true} pc={currentItem.data} id = {currentItem.id}></VideoGuest>
                    );
                })
            }
        </div>
    );
};

export default VideoArea;
