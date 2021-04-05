import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'

const io = require('socket.io-client');
const socket = io('127.0.0.1:8000', { autoConnect: false });

const App = () => {
  const [videoOn, setVideoOn] = useState(true);
  const [messageList, addToMessageList] = useState([
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

    //socket.connect();
    socket.on('connect', () => {
      console.log(socket.id);
    });

    socket.on('connect_error', () => {
      
    });

    socket.on('connect_failed', () => {
      
    });

    socket.on('disconnect', () => {
      
    });

  }, []);

  const onButtonClickHandler = () => {
    setVideoOn(!videoOn);
  };

  const onMessageSend = (text) => {
    let temporaryList = [...messageList];
    temporaryList.push({type: 'user', message: text});
    addToMessageList(temporaryList);
  };

  const onMessageGet = () => {

  };

  // const intervalSend = () => {
  //   if (!sendOn) {
  //     interval.current = setInterval(() => {
  //       socket.emit('data', 'elo');
  //     }, 1000);
  //   } else {
  //     clearInterval(interval.current);
  //   }
  // };

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
