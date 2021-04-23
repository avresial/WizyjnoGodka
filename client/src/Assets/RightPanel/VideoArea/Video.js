import React from 'react'
import classes from './Video.module.css'

const Video = (props) => {
    return(
        <div id='video-container' className = {`${classes.Video} col-xs-6 col-md-4`} >
            {props.videoOn 
            ? <video playsInline muted ref={props.userVideo} autoPlay /> 
            : null}
        </div>
    )

}

export default Video;