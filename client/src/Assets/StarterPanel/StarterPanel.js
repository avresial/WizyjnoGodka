import React from 'react'
import classes from './StarterPanel.module.css'
import Button from 'react-bootstrap/Button'

const StarterPanel = (props) => {
    return (
        <div className={`col ${classes.StarterPanel}`}>
            <div className={`${classes.StarterPanelInside}`}>
                <h1 className='display-4'>Wizyjno Godka</h1>
                <p className='lead'>Enter your name here</p>
                <hr className='my-4'></hr>
                <div className='row'>
                    <div className='col'>
                        <input id='name-input' className='form-control' />
                    </div>
                    <div className='col col-lg-2'>
                        <Button onClick={() => {props.OnClick(document.getElementById('name-input').value); }}>Go</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StarterPanel;