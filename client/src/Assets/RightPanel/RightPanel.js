import React, {useEffect, useRef} from 'react'
import VideoArea from './VideoArea/VideoArea'
import classes from './RightPanel.module.css'
import Button from 'react-bootstrap/Button'
import FormGroup from 'react-bootstrap/FormGroup'
import MessageBox from '../MessageBox/MessageBox'
import {KeyPress} from '../Helpers/KeyEvents'

const RightPanel = (props) => {
    const style = `${classes.RightPanel} col-md-8`;
    const overflowArea = useRef();
    const sendButtonRef = useRef();
    const textAreaRef = useRef();

    const styleButtonRow = {
        justifyContent: 'center'
    };

    const styleButtonRowRight = {
        justifyContent: 'right'
    };
    
    const formGroupStype = {
        width: '100%'
    };

    const overflowStyle = {
        width: '100%',
        maxHeight: '400px'
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
                    <VideoArea videoOn = {props.videoOn} />
                </div>
            </div>
            <div className='row' style={styleButtonRow}>
                <Button onClick={props.onVideoButtonClick}> {props.videoOn ? 'hide' : 'show'} video</Button>
            </div>
            <div className='row' >
                <div ref={overflowArea} className='overflow-auto' style={overflowStyle} >
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
                <FormGroup style={formGroupStype}>
                    <textarea ref={textAreaRef} maxLength='1000' className="form-control"></textarea>
                </FormGroup>
            </div>
            <div className='row' style={styleButtonRowRight}>
                <Button ref={sendButtonRef} onClick={() => { props.onSendButtonClick(
                    document.getElementsByClassName('form-control')[0].value); 
                    document.getElementsByClassName('form-control')[0].value = '';
                    }}>Send</Button>
            </div>
        </div>
    );
};

export default RightPanel;