import React from 'react'
import Video from '../Assets/Video'
import classes from './RightPanel.module.css'

const RightPanel = (props) => {

    const style = `${classes.RightPanel} col-md-8 vh-100`;
    
    return(
        <div className = {style}>
            <Video videoOn = {props.videoOn} />
            <button onClick={props.onClick}>{props.videoOn ? 'hide' : 'show'} video </button>
        </div>
    );
};

export default RightPanel;