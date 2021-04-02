import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'

const io = require('socket.io-client');
const socket = io('127.0.0.1:8000', { autoConnect: false });

const App = () => {

  const interval = useRef();

  const [videoOn, setVideoOn] = useState(true);
  const [sendOn, setSendOn] = useState(false);

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

  }, []);

  const onButtonClickHandler = () => {
    setVideoOn(!videoOn);
  };

  const intervalSend = () => {
    if (!sendOn) {
      interval.current = setInterval(() => {
        socket.emit('data', 'elo');
      }, 1000);
    } else {
      clearInterval(interval.current);
    }
  };

  const onButtonSendClickhandler = () => {
    setSendOn(!sendOn);
    intervalSend();
  };

  return(
    <Container fluid>
      <div className = 'row vh-100'>
        <LeftPanel onClick={onButtonSendClickhandler} sendOn={sendOn} />
        <RightPanel onClick={onButtonClickHandler} videoOn={videoOn}/>
      </div>
    </Container>
  );
}

export default App;
