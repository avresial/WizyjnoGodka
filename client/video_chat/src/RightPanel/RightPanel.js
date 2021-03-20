import React from 'react'
import Video from '../Assets/Video'
import classes from './RightPanel.module.css'
import Button from 'react-bootstrap/Button'

const RightPanel = (props) => {

    const style = `${classes.RightPanel} col-md-8`;
    
    return(
        <div className = {style}>
            <div className='row'>
                <Video videoOn = {props.videoOn} />
            </div>
            <div className='row'>
                <Button onClick={props.onClick}> {props.videoOn ? 'hide' : 'show'} video</Button>
            </div>
        </div>
    );
};

export default RightPanel;