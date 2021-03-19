import React, { useRef, useEffect } from 'react'

const Video = (props) => {
    const stream = useRef();
    const userVideo = useRef();

    useEffect(() => {
        if (props.videoOn) {
            navigator.mediaDevices.getUserMedia({audio:false, video:true}).then((mediaStream) => {
                stream.current = mediaStream;
                if(userVideo.current)
                {
                    userVideo.current.srcObject = mediaStream;
                }
            });
        }
        else {
            const tracks = stream.current.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        }
    }, [props.videoOn]);

    return(
        <div id='video-container'>
            {props.videoOn 
            ? <video playsInline muted ref={userVideo} autoPlay /> 
            : null}
        </div>
    )

}

export default Video;