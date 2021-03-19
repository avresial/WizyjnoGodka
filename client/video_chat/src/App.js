import React, { useEffect, useState } from 'react'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'

const App = () => {

  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    console.log("Soc called");
    const io = require("socket.io-client");
    const socket = io("127.0.0.1:8000", { autoConnect: false });
    //socket.connect();
    socket.on("connect", () => {
        console.log(socket.id);
    });
  }, []);

    const onButtonClickHandler = () => {
      setVideoOn(!videoOn);
    }

    return(
      <Container fluid >
        <div className = 'row h-100'>
          <LeftPanel />
          <RightPanel onClick={onButtonClickHandler} videoOn={videoOn}/>
        </div>
      </Container>
    );
}

export default App;
