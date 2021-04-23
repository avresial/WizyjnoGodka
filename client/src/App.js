import React, { useEffect, useState, useRef } from 'react'
import LeftPanel from './Assets/LeftPanel/LeftPanel'
import RightPanel from './Assets/RightPanel/RightPanel'
import Container from 'react-bootstrap/Container'
import StarterPanel from './Assets/StarterPanel/StarterPanel'
import 'bootstrap/dist/css/bootstrap.min.css';
import LoggerBox from './Assets/LoggerBox/LoggerBox'
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
  console.log("App rerendered");
  const [yourUserName, setName] = useState('default');
  const [isNameSet, setIsNameSet] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [listOfConnections, setListOfConnections] = useState([]);
  const [logList, setLogList] = useState([]);
  const logTimeout = useRef();
 
  useEffect(() => {
    console.log("USE EFFECT APP JS");
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
  }, []);

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

  // window.onunload = window.onbeforeunload = () => {
  //   socket.close();
  // };

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
          <LeftPanel connections={listOfConnections} sendRequest={SendConnectionRequest} />
          <RightPanel onVideoButtonClick={onButtonClickHandler} onSendButtonClick={(text) => onMessageSend(text)} videoOn={videoOn} messageList={messageList}/>
        </div>
        : <div className = 'row vh-100'>
          <StarterPanel OnClick={(userName) => setUserName(userName)}></StarterPanel>
          </div>
      }
    </Container>
  );
}

export default App;
