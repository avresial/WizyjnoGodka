import React from 'react'
import classes from './MessageBoxGuest.module.css'

const MessageBoxGuest = (props) => {
    return(
        <div className={classes.MessageBoxGuest}>
            <p>{props.children}</p>
        </div>
    );
};

export default MessageBoxGuest;