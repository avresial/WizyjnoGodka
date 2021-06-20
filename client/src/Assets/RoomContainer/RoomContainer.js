import React from 'react'
import classes from './RoomContainer.module.css'

const RoomContainer = (props) => {
    return(
        <div className={classes.RoomContainer}>
            <span>Room: {props.roomId}</span>
        </div>
    );
};

export default RoomContainer;