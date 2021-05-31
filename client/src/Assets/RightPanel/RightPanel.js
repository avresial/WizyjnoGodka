import React, {useEffect, useRef} from 'react'
import VideoArea from './VideoArea/VideoArea'
import classes from './RightPanel.module.css'
import Button from 'react-bootstrap/Button'
import FormGroup from 'react-bootstrap/FormGroup'
import MessageBox from '../MessageBox/MessageBox'
import {KeyPress} from '../Helpers/KeyEvents'
import CameraOff from './video-camera-off.png'
import CameraOn from './video-camera-on.png'
import EndCall from './end-call.png'
import MicrophoneOn from './microphone-on.png'
import MicrophoneOff from './microphone-off.png'
import Send from './send.png'

const RightPanel = (props) => {
    const style = `${classes.RightPanel} col`;
    const overflowArea = useRef();
    const sendButtonRef = useRef();
    const textAreaRef = useRef();

    const styleButtonRowRight = {
        justifyContent: 'right'
    };
    
    const formGroupStype = {
        width: '100%'
    };

    useEffect(() => {
        let scrollArea = overflowArea.current;
        scrollArea.scrollTop = scrollArea.scrollHeight;
    }, [props.messageList]);

    useEffect(() => {
        KeyPress(sendButtonRef.current, textAreaRef.current);
    }, []);

    return(
        <div className = {style}>
            <div className='row'>           
                <div className='col'>
                    <VideoArea connections={props.connections} videoOn = {props.videoOn} micOn = {props.micOn}/>
                </div>
            </div>
            <div className='row'>
                <div className={`col ${classes.styleControlPanel}`}>
                    <div className='row'>
                        <div className='col'>
                            <Button onClick={props.onVideoButtonClick}><img alt='' src={props.videoOn ? CameraOn : CameraOff}></img></Button>
                        </div>
                        <div className='col'>
                            <Button onClick={props.onMicButtonClick}><img alt='' src={props.micOn ? MicrophoneOn : MicrophoneOff} ></img></Button>
                        </div>
                        <div className='col'>
                            <Button><img alt='' src={EndCall}></img></Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div ref={overflowArea} className={`overflow-auto ${classes.overflowStyle}`} >
                {
                    props.messageList.map((currentElement, index) => {
                        return(
                            <MessageBox key={index} sender={currentElement.sender} type={currentElement.type} time={currentElement.time}>{currentElement.message}</MessageBox>
                        );
                    })
                }
                </div>
            </div>

            <div className='row'>
                <div className={classes.test}>
                    <FormGroup style={formGroupStype}>
                        <textarea ref={textAreaRef} maxLength='1000' className="form-control"></textarea>
                    </FormGroup>
                    <div className={classes.SendButton}>
                        <Button ref={sendButtonRef} onClick={() => { props.onSendButtonClick(
                            document.getElementsByClassName('form-control')[0].value); 
                            document.getElementsByClassName('form-control')[0].value = '';
                            }}><img alt='' src={Send}></img>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightPanel;