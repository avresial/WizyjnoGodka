import React, { useRef, useEffect } from 'react'
import classes from './Video.module.css'

const Video = (props) => {
    return(
        <div id='video-container' className={classes.Video}>
            {props.videoOn 
            ? <video playsInline muted ref={props.userVideo} autoPlay /> 
            : null}
        </div>
    )

}

export default Video;