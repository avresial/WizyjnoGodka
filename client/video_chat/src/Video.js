import React, { useEffect } from 'react'
import VideoCallback from './VideoCallback'

const Vid = () => {
    useEffect(() => {
        const callback = new VideoCallback();
        callback.startCapture();
    }, []);

    return(
        <div id='video-container'>
            <video autoPlay></video>
        </div>
    )

}

export default Vid;