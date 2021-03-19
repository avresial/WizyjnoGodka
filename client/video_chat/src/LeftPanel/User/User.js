import react from 'react'
import classes from './User.module.css'

const User = (props) => {
    const style = `${classes.User} row`
    return (
        <div className = {style} >
            <p>{props.name}</p>
            <div className = {classes.status}></div>
        </div>
    ); 
};

export default User;