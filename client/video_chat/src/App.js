import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'

const App = () => {

  const io = require('socket.io-client');
  const socket = io('127.0.0.1:8000', { autoConnect: false });

  console.log("called");
  
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

  const onButtonSendClickhandler = () => {
    setSendOn(!sendOn);
    const interval = () => {
        if (sendOn) {
          interval = setInterval(() => {
            console.log("Hej");
          }, 1000);
        }
    };
  };

  return(
    <Container fluid >
      <div className = 'row vh-100'>
        <LeftPanel onClick={onButtonSendClickhandler} sendOn={sendOn} />
        <RightPanel onClick={onButtonClickHandler} videoOn={videoOn}/>
      </div>
    </Container>
  );
}

export default App;
