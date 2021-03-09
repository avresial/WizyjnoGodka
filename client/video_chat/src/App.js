import React, { useEffect, useState } from 'react'
import Video from "./Video"
import './App.css';

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

    const onButtonClickHandler = () =>{
      setVideoOn(!videoOn);
    }

    return(
      <div className="App">
     
      <Video videoOn={videoOn} />
      
      <button onClick={onButtonClickHandler}>{videoOn ? 'hide' : 'show'} video </button>

    </div>
    )
}

export default App;
