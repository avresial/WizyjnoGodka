import React, { useEffect } from 'react'
import MessageBoxGuest from './MessageBoxGuest'
import MessageBoxUser from './MessageBoxUser'

const MessageBox = (props) => {
    let element = null;
    if (props.type === 'user'){
        element = <MessageBoxUser sender={props.sender}>{props.children}</MessageBoxUser>
    }
    else {
        element = <MessageBoxGuest sender={props.sender}>{props.children}</MessageBoxGuest>
    }

    return(
        element
    );
};

export default MessageBox;