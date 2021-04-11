import React, { useEffect, useState } from 'react'
import LeftPanel from './Assets/LeftPanel/LeftPanel'
import RightPanel from './Assets/RightPanel/RightPanel'
import Container from 'react-bootstrap/Container'
import StarterPanel from './Assets/StarterPanel/StarterPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
// import LoggerBox from './Assets/LoggerBox/LoggerBox'
// import {CSSTransition} from 'react-transition-group';

const io = require('socket.io-client');
const socket = io('127.0.0.1:8000', { autoConnect: false });

const getTimeOfMessage = () => {
  let date = new Date();
  let parsedDate = `${date.getHours()}:${date.getMinutes()}`;
  return parsedDate;
};

const App = () => {
  const [username, setName] = useState('default');
  const [isNameSet, setIsNameSet] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [listOfConnections, setListOfConnections] = useState([]);
  const [isLoggerBoxShowed, setLoggerBox] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Your socket id: ', socket.id);
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
      setListOfConnections(listOfConnections => ([...listOfConnections, ...newConnection]));
    });
  
    socket.on('remove-connection', (sid) => {
      setListOfConnections(listOfConnections => {
        const tempList = [...listOfConnections];
        tempList.map( (connection, index) => {
          if (connection.sid === sid)
          {
            console.log('removed');
            tempList.splice(index, 1);
          }
          return 0;
        });
        return tempList;
      });
    });

  }, []);

  const onButtonClickHandler = () => {
    setVideoOn(!videoOn);
  };

  const onMessageSend = (text) => {
    let time = getTimeOfMessage();
    const temporaryList = [{sender: 'You', type: 'user', message: text, time: time}];
    setMessageList(messageList => ([...messageList, ...temporaryList]));
    let nameAndSid = `${username}(${socket.id})`;
    let message = {senderName: nameAndSid, data: text};
    socket.emit('chat', message);
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

  const setUserName = (user) => {
    // socket.connect();
    setName( username => (username, user) );
    setIsNameSet(true);
    socket.emit('name', user);
    socket.emit('connections');
  };



  // const showLoggerBox = () => {
  //   console.log("Show logger box");
  //   setLoggerBox(true);
  //   setTimeout(timeoutForLoggerBox, 5000);
  // };

  // const timeoutForLoggerBox = () => {
  //   console.log("close logger box");
  //   setLoggerBox(false);
  // };


  return(
    <Container fluid>

    {/* <CSSTransition
      in={isLoggerBoxShowed}
      timeout={350}
      classNames="display"
      unmountOnExit
    >
      <LoggerBox />
    </CSSTransition> */}

      {/* {
        isNameSet ?
        <div className = 'row vh-100'>
          <LeftPanel connections={listOfConnections} sendRequest={SendConnectionRequest} />
          <RightPanel onVideoButtonClick={onButtonClickHandler} onSendButtonClick={(text) => onMessageSend(text)} videoOn={videoOn} messageList={messageList}/>
        </div>
        : <StarterPanel OnClick={(user) => setUserName(user)}></StarterPanel>
      } */}
        <div className = 'row vh-100'>
          <LeftPanel connections={listOfConnections} sendRequest={SendConnectionRequest} />
          <RightPanel onVideoButtonClick={onButtonClickHandler} onSendButtonClick={(text) => onMessageSend(text)} videoOn={videoOn} messageList={messageList}/>
        </div>
    </Container>
  );
}

export default App;
