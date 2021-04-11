import react from 'react'
import classes from './LoggerBox.module.css'

const LoggerBox = () => {

    return(
        <div className={classes.LoggerBox}>
            <div className={classes.exitButton}>
            </div>
            <span>
                Information about Logger something.
            </span>
        </div>
    );
};

export default LoggerBox;