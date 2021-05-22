import React from 'react'
import Button from 'react-bootstrap/Button'
import styles from './CallBox.module.css'
import callingImage from './telephone-handle-silhouette.png'
import cancelImage from './close.png'

const CallBoxFrom = (props) => {
    const buttonStyle = styles.buttonStyle;
    return (
        <div className='row'>
            <div className='col'>
                <Button onClick={props.SendAcceptation} className={`${buttonStyle} btn-success`}><img src={callingImage}></img></Button>
            </div>
            <div className='col'>
                <Button onClick={props.SendDeclination} className={`${buttonStyle} btn-danger`}><img src={cancelImage}></img></Button>
            </div>
        </div>
    );
}

const CallBoxTo = (props) => {
    const buttonStyle = styles.buttonStyle;
    return (
        <div className='row'>
            <div className='col'>
                <Button onClick={props.SendDeclination} className={`${buttonStyle} btn-danger`}><img src={cancelImage}></img></Button>
            </div>
        </div>
    );
}

const CallBox = (props) => {
    return(
        <div className={styles.CallBox}>
            <p>SOMEONE is calling to you</p>
            {
                props.isCallingTo
                ? <CallBoxTo SendDeclination={props.SendDeclination}/>
                : null
            }
            {
                props.isCallingFrom
                ? <CallBoxFrom SendDeclination={props.SendDeclination} SendAcceptation={props.SendAcceptation}/>
                : null
            }
        </div>
    );
}

export default CallBox;