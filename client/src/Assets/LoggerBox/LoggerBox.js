import React from 'react'
import classes from './LoggerBox.module.css'

const LoggerBox = (props) => {

    let isVisible = false;
    if( props.itemsCount > 1)
    {
        isVisible = true;
    }

    return(
        <div className={classes.LoggerBox}>
            {
                isVisible 
                ? <div className={classes.exitButton}>{props.itemsCount}</div>
                : null
            }
            <span>
                {props.children}
            </span>
        </div>
    );
};

export default LoggerBox;