import React, { useEffect, useState } from 'react'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'
import Container from 'react-bootstrap/Container'
import 'bootstrap/dist/css/bootstrap.min.css';

const io = require('socket.io-client');
const socket = io('127.0.0.1:8000', { autoConnect: false });

const App = () => {
  const [videoOn, setVideoOn] = useState(true);
  const [messageList, setMessageList] = useState([
    {type: 'guest', message: 'Hello. How are you today?'},
    {type: 'user',  message: 'Fine'},
    {type: 'guest', message: 'Fock off'},
    {type: 'user',  message: 'U too motherfocker'}
  ]);
  const [listOfConnections, changeListOfConnections] = useState([
    {uniqueId: 'ZVBlgeqphfos', name: 'Kamil'},
    {uniqueId: 'POGHieqodvjh', name: 'Adam'},
    {uniqueId: 'QEYOGDvppauy', name: 'Łukasz'},
    {uniqueId: 'HADSHreywfdg', name: 'Krystian'}
  ]);

  useEffect(() => {
    console.log('SoC called');

    socket.connect();
    socket.on('connect', () => {
      console.log(socket.id);
    });

    socket.on('connect_error', () => {
      
    });

    socket.on('connect_failed', () => {
      
    });

    socket.on('disconnect', () => {
      
    });

    socket.on('message', (data) =>{
      onMessageGet(data);
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

  return(
    <Container fluid>
      <div className = 'row vh-100'>
        <LeftPanel connections={listOfConnections}/>
        <RightPanel onVideoButtonClick={onButtonClickHandler} onSendButtonClick={(text) => onMessageSend(text)} videoOn={videoOn} messageList={messageList}/>
      </div>
    </Container>
  );
}

export default App;
