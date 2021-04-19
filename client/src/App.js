import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './Assets/LeftPanel/LeftPanel'
import RightPanel from './Assets/RightPanel/RightPanel'
import Container from 'react-bootstrap/Container'
import StarterPanel from './Assets/StarterPanel/StarterPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import LoggerBox from './Assets/LoggerBox/LoggerBox'

const io = require('socket.io-client');
const socket = io('127.0.0.1:8000', { autoConnect: false });
const PC_CONFIG = {};

const getTimeOfMessage = () => {
  let date = new Date();
  let hour = ('0' + date.getHours()).slice(-2);
  let minute = ('0' + date.getMinutes()).slice(-2);
  let second = ('0' + date.getSeconds()).slice(-2);
  let parsedDate = `${hour}:${minute}:${second}`;
  return parsedDate;
};

const App = () => {
  console.log("App rerendered");
  const [yourUserName, setName] = useState('default');
  const [isNameSet, setIsNameSet] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [videoSecondOn, setVideoSecondOn] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [listOfConnections, setListOfConnections] = useState([]);
  const [logList, setLogList] = useState([]);
  const logTimeout = useRef();
  
  const stream = useRef();
  const secondStream = useRef();

  useEffect(() => {
    socket.on('connect', () => {
    });
  
    socket.on('message', (data) => {
      onMessageGet(data);
    });
  
    socket.on('connections', (data) => {
      const tempList = JSON.parse(data);
      setListOfConnections(listOfConnections => ([...listOfConnections, ...tempList]));
    });
  
    socket.on('add-connection', (data) => {
      const parsedData = JSON.parse(data);
      const newConnection = [{sid: parsedData.sid, name: parsedData.name}];
      appendNewLog(`${parsedData.sid} connected to the server`);
      setListOfConnections(listOfConnections => ([...listOfConnections, ...newConnection]));
    });
  
    socket.on('remove-connection', (sid) => {
      appendNewLog(`${sid} disconnected from the server`);
      setListOfConnections(listOfConnections => {
        const tempList = [...listOfConnections];
        tempList.map( (connection, index) => {
          if (connection.sid === sid)
          {
            tempList.splice(index, 1);
          }
          return 0;
        });
        return tempList;
      });
    });

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
      document.getElementById('xd').srcObject = event.stream;
      setVideoSecondOn(true);
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

  // useEffect(() => {
  //   if (videoOn) {
  //     createPeerConnection();
  //     sendOffer();
  //   }
  // }, [videoOn]);

  const onButtonClickHandler = () => {
    setVideoOn(!videoOn);
  };

  const onMessageSend = (text) => {
    if (!text) {
      appendNewLog(`Message cannot be empty!`);
    }
    else {
      let time = getTimeOfMessage();
      const temporaryList = [{sender: 'You', type: 'user', message: text, time: time}];
      setMessageList(messageList => ([...messageList, ...temporaryList]));
      let nameAndSid = `${yourUserName}(${socket.id})`;
      let message = {senderName: nameAndSid, data: text};
      socket.emit('chat', message);
    }
  };

  const onMessageGet = (data) => {
    let time = getTimeOfMessage();
    const temporaryList = [{sender: data.senderName, type: 'guest', message: data.data, time: time}];
    setMessageList(messageList => ([...messageList, ...temporaryList]));
  };

  const SendConnectionRequest = (index) => {
    const data = listOfConnections[index].sid;
    socket.emit('send-invitation', data);
  };

  const setUserName = (userName) => {
    if (!userName) {
      appendNewLog(`Name cannot be empty!`);
    } else {
      socket.connect();
      setName(userName);
      setIsNameSet(true);
      socket.emit('name', userName);
      socket.emit('connections');
    }
  };

  useEffect( () => {
    if (!logTimeout.current) {
      if (logList.length > 0)
      {
        logTimeout.current = setTimeout(popFrontLogList, 5000);
      }
    }
  }, [logList])

  const popFrontLogList = () => {
    setLogList(logList => {
      const tempLogList = [...logList];
      logTimeout.current = null;
      tempLogList.shift();
      logList = tempLogList;
      return logList;
    });
  }; 

  const appendNewLog = (text) => {
    setLogList(logList => {
      const tempLogList = [...logList];
      tempLogList.push(text);
      logList = tempLogList;
      return logList;
    })
  };

  return(
    <Container fluid>
      {
        logList.length > 0
          ? <LoggerBox itemsCount={logList.length}>{logList[0]}</LoggerBox>
          : null
      }
      {
        isNameSet ?
        <div className = 'row vh-100'>
          <video playsInline muted id="xd" autoPlay ></video>
          <LeftPanel connections={listOfConnections} sendRequest={SendConnectionRequest} />
          <RightPanel streamRef={stream} secondStreamRef={secondStream} onVideoButtonClick={onButtonClickHandler} onSendButtonClick={(text) => onMessageSend(text)} videoOn={videoOn} videoSecondOn={videoSecondOn} messageList={messageList}/>
        </div>
        : <div className = 'row vh-100'>
          <StarterPanel OnClick={(userName) => setUserName(userName)}></StarterPanel>
          </div>
      }
    </Container>
  );
}

export default App;
