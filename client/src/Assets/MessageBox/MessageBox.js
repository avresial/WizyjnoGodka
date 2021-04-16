import React from 'react'
import MessageBoxGuest from './MessageBoxGuest/MessageBoxGuest'
import MessageBoxUser from './MessageBoxUser/MessageBoxUser'

const MessageBox = (props) => {
    let element = null;
    if (props.type === 'user'){
        element = <MessageBoxUser sender={props.sender} time={props.time}>{props.children}</MessageBoxUser>
    }
    else {
        element = <MessageBoxGuest sender={props.sender} time={props.time}>{props.children}</MessageBoxGuest>
    }

    return(
        element
    );
};

export default MessageBox;