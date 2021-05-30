import React from 'react'
import classes from './User.module.css'

const User = (props) => {
    const userStyle = `${classes.User} row`;
    return (
        <div className = {userStyle} onClick = {props.sendRequest} >
            <div className = 'col'>
                <span>{props.name}</span>
            </div>
            <div className = 'col'>
                <div className = {classes.status}></div>
            </div>
        </div>
    ); 
};

export default User;