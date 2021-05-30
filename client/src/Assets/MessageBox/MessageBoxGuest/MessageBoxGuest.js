import React from 'react'
import classes from './MessageBoxGuest.module.css'

const MessageBoxGuest = (props) => {
    return(
        <div className={classes.MessageBoxGuest}>
            <div className={classes.infoContainer}>
                <p className = {classes.name}>{props.sender}</p>
                <div className = {classes.time}>{props.time}</div>
            </div>
            <span>{props.children}</span>
        </div>
    );
};

export default MessageBoxGuest;