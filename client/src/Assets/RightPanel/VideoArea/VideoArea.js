import React, {useState, useRef, useEffect} from 'react'
import Video from './Video'
import classes from './VideoArea.module.css'

const VideoArea = (props) => {
    const [listOfVideos, setlistOfVideos] = useState(['own_video']);

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
            try{
                const tracks = stream.current.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            } catch (e) {
                console.log(e);
            }
        }
    }, [props.videoOn]);

    return (
        <div className={`row ${classes.VideoArea}`}>
            {
                listOfVideos.map((currentItem, index) => {
                    return(
                        <Video key = {index} videoOn = {props.videoOn} userVideo = {userVideo} ></Video>
                    );
                })
            }
        </div>
    );
};

export default VideoArea;