import React from 'react'
import classes from './StarterPanel.module.css'
import Button from 'react-bootstrap/Button'

const StarterPanel = (props) => {
    return (
        <div className={classes.StarterPanel}>
            <p>Enter your name here</p>
            <input id="name-input" className='form-control'></input>
            <Button onClick={() => {props.OnClick(document.getElementById('name-input').value); }}>Go</Button>
        </div>
    );
};

export default StarterPanel;