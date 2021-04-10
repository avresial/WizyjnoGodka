import React from 'react'
import Video from '../Assets/Video'
import classes from './RightPanel.module.css'
import Button from 'react-bootstrap/Button'
import FormGroup from 'react-bootstrap/FormGroup'
import MessageBox from '../MessageBox/MessageBox'

const RightPanel = (props) => {
    const style = `${classes.RightPanel} col-md-8`;

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
    
    return(
        <div className = {style}>
            {/* <div className='row'>
                <Video videoOn = {props.videoOn} />
            </div>
            <div className='row' style={styleButtonRow}>
                <Button onClick={props.onVideoButtonClick}> {props.videoOn ? 'hide' : 'show'} video</Button>
            </div> */}
            <div className='row' >
                <div className='overflow-auto' style={overflowStyle}>
                {
                    props.messageList.map((currentElement, index) => {
                        return(
                            <MessageBox key={index} sender={currentElement.sender} type={currentElement.type}>{currentElement.message}</MessageBox>
                        );
                    })
                }
                </div>
            </div>
            <div className='row'>
                <FormGroup style={formGroupStype}>
                    <textarea className="form-control"></textarea>
                </FormGroup>
            </div>
            <div className='row' style={styleButtonRowRight}>
                <Button onClick={() => { props.onSendButtonClick(
                    document.getElementsByClassName('form-control')[0].value); 
                    document.getElementsByClassName('form-control')[0].value = '';
                    }}>Send</Button>
            </div>
        </div>
    );
};

export default RightPanel;