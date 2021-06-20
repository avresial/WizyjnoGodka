import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './Assets/LeftPanel/LeftPanel'
import RightPanel from './Assets/RightPanel/RightPanel'
import Container from 'react-bootstrap/Container'
import StarterPanel from './Assets/StarterPanel/StarterPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import LoggerBox from './Assets/LoggerBox/LoggerBox'
import CallBox from './Assets/CallBox/CallBox'
import {socket} from './Assets/Context/socket'


const getTimeOfMessage = () => {
  let date = new Date();
  let hour = ('0' + date.getHours()).slice(-2);
  let minute = ('0' + date.getMinutes()).slice(-2);
  let second = ('0' + date.getSeconds()).slice(-2);
  let parsedDate = `${hour}:${minute}:${second}`;
  return parsedDate;
};

const App = () => {
  const invitationData = useRef(null);
  const [yourUserName, setName] = useState('default');
  const [isNameSet, setIsNameSet] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [listOfConnections, setListOfConnections] = useState([]);
  const [logList, setLogList] = useState([]);
  const [isCallingTo, setIsCallingTo] = useState(false);
  const [isCallingFrom, setIsCallingFrom] = useState(false);
  const [isInRoom, setIsInRoom] = useState(true);

  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const logTimeout = useRef();
  const [callerName, setCallerName] = useState('');
  const [currentRoomList, setCurrentRoomList] = useState([]);

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

    socket.on('create-peer', data => {
      // create list of current room
      console.log(data);
    });

  }, []);

  useEffect( () => {
    socket.on('receive-invite', (data) => {
      invitationData.current = data;
      let caller_sid = JSON.parse(data).sender_sid;
      setCallerName(caller_sid);
      if (!isCallingTo && !isCallingFrom) {
        setIsCallingFrom(true);
      } else {
        appendNewLog('There is another call already!');
      }
    });

    socket.on('room-is-already-set', () => {
      setIsCallingTo(false);
      setIsCallingFrom(false);
    });

    socket.on('invite-expired-receiver', (data) => {
      setIsCallingTo(false);
      setIsCallingFrom(false);
      appendNewLog('invitation was expired!');
    });

    socket.on('invite-expired-sender', (data) => {
      setIsCallingTo(false);
      setIsCallingFrom(false);
      appendNewLog('Receiver does not respond!');     
    });

    socket.on('invite-declined', (data) => {
        setIsCallingTo(false);
        setIsCallingFrom(false);
        appendNewLog('invitation was declined!');
    });

    socket.on('invite-accepted', (data) => {
      setIsCallingTo(false);
      setIsInRoom(true);
    });
  }, [isCallingFrom, isCallingTo]);

  const onButtonClickHandler = () => {
    socket.emit('toggle-video');
    setVideoOn(!videoOn);
  };

  const onMicClickHandler = () => {
    socket.emit('toggle-mic');
    setMicOn(!micOn);
  }

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
    if (!isCallingTo && !isCallingFrom) {
      setIsCallingTo(true);
      const data = listOfConnections[index].sid;
      setCallerName(data);
      const jsonObject = {
        'receiver_sid': data,
        'sender_sid': socket.id
      };
      invitationData.current = JSON.stringify(jsonObject);
      socket.emit('send-invitation', data);
    } else {
      appendNewLog('You are already calling');
    }
  };

  const SetFalseIsCalling = () => {
    if (isCallingTo) {
      setIsCallingTo(false);
    } else if (isCallingFrom) {
      setIsCallingFrom(false);
    }
  }

  const SendAcceptation = () => {
    setIsInRoom(true);
    const dataToSend = invitationData.current;
    socket.emit('accept-invitation', dataToSend);
    SetFalseIsCalling();
  }

  const SendDeclination = () => {
    const dataToSend = invitationData.current;
    socket.emit('decline-invitation', dataToSend);
    SetFalseIsCalling();
  }

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

  const SetCurrentRoomList = (data) => {
    setCurrentRoomList( currentList => {
      currentList = data;
      return currentList;
    });
  };

  const DisconnectFromRoom = () => {
    socket.emit('leave-room');
  }

  // window.onunload = window.onbeforeunload = () => {
  //   socket.close();
  // };

  return(
    <Container fluid>
      {
        isCallingTo || isCallingFrom
        ? <CallBox isCallingTo={isCallingTo} isCallingFrom={isCallingFrom} 
                  SendAcceptation={SendAcceptation} SendDeclination={SendDeclination} 
                  textToShow={callerName} />
        : null
      }
      {
        logList.length > 0
          ? <LoggerBox itemsCount={logList.length}>{logList[0]}</LoggerBox>
          : null
      }
      {
        isNameSet ?
        <div className = 'row vh-100'>
          <LeftPanel connections={listOfConnections} sendRequest={SendConnectionRequest} />
          {
            isInRoom ? <RightPanel isInRoom={isInRoom} connections={listOfConnections} 
              onVideoButtonClick={onButtonClickHandler} 
              onMicButtonClick={onMicClickHandler}
              onSendButtonClick={(text) => onMessageSend(text)} 
              videoOn={videoOn} 
              micOn={micOn}
              messageList={messageList}
              setCurrentRoomList={SetCurrentRoomList}
              disconnectFromRoomButton={DisconnectFromRoom}/>
            : null
          }
        </div>
        : <div className = 'row vh-100'>
          <StarterPanel OnClick={(userName) => setUserName(userName)}></StarterPanel>
          </div>
      }
    </Container>
  );
}

export default App;
