import react from 'react'
import classes from './User.module.css'

const User = (props) => {
    return (
        <div className = {classes.User} >
            <p>{props.name}</p>
            <div className = {classes.status}></div>
        </div>
    ); 
};

export default User;