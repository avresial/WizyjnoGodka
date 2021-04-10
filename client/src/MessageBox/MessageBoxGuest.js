import React from 'react'
import classes from './MessageBoxGuest.module.css'

const MessageBoxGuest = (props) => {
    return(
        <div className={classes.MessageBoxGuest}>
            <div className={classes.infoContainer}>
                <p className = {classes.name}>11:50</p>
                <div className = {classes.time}>11:50</div>
            </div>
            <span>{props.children}</span>
        </div>
    );
};

export default MessageBoxGuest;