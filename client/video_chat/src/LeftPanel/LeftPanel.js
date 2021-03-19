import React from 'react'
import User from './User/User'
import classes from './LeftPanel.module.css'

const LeftPanel = () => {
    const style = `${classes.LeftPanel} col-md-4 vh-100`
    return (
        <div className={style}>
            <User name="Kamil" status={true}></User>
            <User name="Adam" status={true}></User>
            <User name="Łukasz" status={true}></User>
        </div>
    );
};

export default LeftPanel;