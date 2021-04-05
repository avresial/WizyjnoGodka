import React from 'react'
import User from './User/User'
import classes from './LeftPanel.module.css'
import Button from 'react-bootstrap/Button'

const LeftPanel = (props) => {
    const style = `${classes.LeftPanel} col-md-4`
    return (
        <div className={style}>
            <User name="Kamil" status={true}></User>
            <User name="Adam" status={true}></User>
            <User name="Łukasz" status={true}></User>
            <center><Button onClick={props.onClick}>Send</Button></center>
        </div>
    );
};

export default LeftPanel;