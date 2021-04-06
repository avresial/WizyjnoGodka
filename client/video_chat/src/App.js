import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'
import Container from 'react-bootstrap/Container'
import StarterPanel from './StarterPanel/StarterPanel'
import 'bootstrap/dist/css/bootstrap.min.css';

const io = require('socket.io-client');
const socket = io('127.0.0.1:8000', { autoConnect: false });

const App = () => {
  const [username, setName] = useState('default');
  const [isNameSet, setIsNameSet] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [messageList, setMessageList] = useState([]);
  const [listOfConnections, setListOfConnections] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log(socket.id);
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
        console.log(tempList);
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
    const temporaryList = [{type: 'user', message: text}];
    setMessageList(messageList => ([...messageList, ...temporaryList]));
    socket.emit('chat', text);
  };

  const onMessageGet = (text) => {
    const temporaryList = [{type: 'guest', message: text}];
    setMessageList(messageList => ([...messageList, ...temporaryList]));
  }

  const setUserName = (user) => {
    socket.connect();
    setName( username => (username, user) );
    setIsNameSet(true);
    socket.emit('name', user);
    socket.emit('connections');
  }

  return(
    <Container fluid>
      {
        isNameSet ?
        <div className = 'row vh-100'>
          <LeftPanel connections={listOfConnections}/>
          <RightPanel onVideoButtonClick={onButtonClickHandler} onSendButtonClick={(text) => onMessageSend(text)} videoOn={videoOn} messageList={messageList}/>
        </div>
        : <StarterPanel OnClick={(user) => setUserName(user)}></StarterPanel>
      }
    </Container>
  );
}

export default App;
