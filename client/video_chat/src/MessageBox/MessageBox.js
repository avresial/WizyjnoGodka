import React from 'react'
import MessageBoxGuest from './MessageBoxGuest'
import MessageBoxUser from './MessageBoxUser'

const MessageBox = (props) => {
    let element = null;
    if (props.type === 'user'){
        element = <MessageBoxUser>{props.children}</MessageBoxUser>
    }
    else {
        element = <MessageBoxGuest>{props.children}</MessageBoxGuest>
    }

    return(
        element
    );
};

export default MessageBox;