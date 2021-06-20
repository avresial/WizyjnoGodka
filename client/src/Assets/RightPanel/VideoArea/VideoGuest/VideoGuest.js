import React, {useEffect, useRef} from 'react'
import classes from './../Video.module.css'
import {socket} from '../../../Context/socket'


const VideoGuest = (props) => {
    const video = useRef();
    const userId = useRef();

    useEffect( () => {
        video.current.srcObject = props.pc;
    }, [props.pc]);

    useEffect( () => {
        userId.current = props.id;
    }, [props.id]);


    socket.on('toggle-mic', async data => {
        if (data.sender_sid === userId.current) {
            console.log('toggled mic');
            if (video.current) {
                const audio = video.current.srcObject.getAudioTracks()[0];
                audio.enabled = !audio.enabled;
            }
        }
    });

    socket.on('toggle-video', async data => {
        if (data.sender_sid === userId.current) {
            console.log('toggled video');
            if (video.current) {
                const vid = video.current.srcObject.getVideoTracks()[0];
                vid.enabled = !vid.enabled;
            }
        }
    });


    return(
        <div id='video-container' className = {`${classes.Video} col-xs-6 col-md-4`} >
            <video playsInline ref={video} autoPlay />
        </div>
    )

}

export default VideoGuest;