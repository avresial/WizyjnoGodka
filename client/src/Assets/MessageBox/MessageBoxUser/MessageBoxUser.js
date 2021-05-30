import React from 'react'
import classes from './MessageBoxUser.module.css'

const MessageBoxUser = (props) => {
    return(
        <div className={classes.MessageBoxUser}>
            <div className={classes.infoContainer}>
                <p className = {classes.name}>{props.sender}</p>
                <div className = {classes.time}>{props.time}</div>
            </div>
            <span>{props.children}</span>
        </div>
    );
};

export default MessageBoxUser;