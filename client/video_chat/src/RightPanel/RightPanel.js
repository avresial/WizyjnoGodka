import React from 'react'
import Video from '../Assets/Video'
import classes from './RightPanel.module.css'
import Button from 'react-bootstrap/Button'
import FormGroup from 'react-bootstrap/FormGroup'
import MessageBox from '../MessageBox/MessageBoxUser'
import MessageBoxGuest from '../MessageBox/MessageBoxGuest'

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
            <div className='row'>
                {/* <Video videoOn = {props.videoOn} /> */}
            </div>
            <div className='row' style={styleButtonRow}>
                <Button onClick={props.onClick}> {props.videoOn ? 'hide' : 'show'} video</Button>
            </div>
            <div className='row' >
                <div className='overflow-auto' style={overflowStyle}>
                    <MessageBox>Hello. How are you today?</MessageBox>
                    <MessageBoxGuest>Fine</MessageBoxGuest>
                    <MessageBox>Fock off</MessageBox>
                    <MessageBoxGuest>U too motherfocker</MessageBoxGuest>
                </div>
            </div>
            <div className='row'>
                <FormGroup style={formGroupStype}>
                    <textarea className="form-control">

                    </textarea>
                </FormGroup>
            </div>
            <div className='row' style={styleButtonRowRight}>
                <Button>Send</Button>
            </div>
        </div>
    );
};

export default RightPanel;