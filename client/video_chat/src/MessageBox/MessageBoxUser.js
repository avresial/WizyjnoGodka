import React from 'react'
import classes from './MessageBoxUser.module.css'

const MessageBoxUser = (props) => {
    return(
        <div className={classes.MessageBoxUser}>
            <p>{props.children}</p>
        </div>
    );
};

export default MessageBoxUser;