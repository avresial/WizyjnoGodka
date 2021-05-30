import React from 'react'
import Button from 'react-bootstrap/Button'
import styles from './CallBox.module.css'
import callingImage from './telephone-handle-silhouette.png'
import cancelImage from './close.png'

const CallBoxFrom = (props) => {
    const buttonStyle = styles.buttonStyle;
    return (
        <div>
            <p>{props.textToShow} is calling to you</p>
            <div className='row'>
                <div className='col'>
                    <Button onClick={props.SendAcceptation} className={`${buttonStyle} btn-success`}><img alt='' src={callingImage}></img></Button>
                </div>
                <div className='col'>
                    <Button onClick={props.SendDeclination} className={`${buttonStyle} btn-danger`}><img alt='' src={cancelImage}></img></Button>
                </div>
            </div>
        </div>
    );
}

const CallBoxTo = (props) => {
    const buttonStyle = styles.buttonStyle;
    return (
        <div>
            <p>You are calling to {props.textToShow}</p>
            <div className='row'>
                <div className='col'>
                    <Button onClick={props.SendDeclination} className={`${buttonStyle} btn-danger`}><img alt='' src={cancelImage}></img></Button>
                </div>
            </div>
        </div>
    );
}

const CallBox = (props) => {
    return(
        <div className={styles.CallBox}>
            {
                props.isCallingTo
                ? <CallBoxTo SendDeclination={props.SendDeclination} textToShow={props.textToShow}/>
                : null
            }
            {
                props.isCallingFrom
                ? <CallBoxFrom SendDeclination={props.SendDeclination} SendAcceptation={props.SendAcceptation} textToShow={props.textToShow}/>
                : null
            }
        </div>
    );
}

export default CallBox;