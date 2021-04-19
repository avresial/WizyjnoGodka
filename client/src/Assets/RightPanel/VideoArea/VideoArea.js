import React, {useState, useRef, useEffect} from 'react'
import Video from './Video'
import classes from './VideoArea.module.css'

const VideoArea = (props) => {
    const [listOfVideos, setlistOfVideos] = useState(['own_video']);
    const userVideo = useRef();
  
    useEffect(() => {
        if (props.videoOn) {
            navigator.mediaDevices.getUserMedia({audio:false, video:true}).then((mediaStream) => {
                props.streamRef.current = mediaStream;
                if(userVideo.current) {
                    userVideo.current.srcObject = mediaStream;
                }
            });
        }
        else {
            try{
                const tracks = props.streamRef.current.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            } catch (e) {
                console.log(e);
            }
        }
    }, [props.videoOn]);

    useEffect( () => {
        console.log("VIDEOAREARERENDERED AGAIN");
    }, [props.videoSecondOn]);

    return (
        <div className={`row ${classes.VideoArea}`}>
            <Video videoOn = {props.videoOn} userVideo = {userVideo} ></Video>
            <Video videoOn = {props.videoOn} userVideo = {props.secondStreamRef} ></Video>
            
            {/* {
                listOfVideos.map((currentItem, index) => {
                    return(
                        <Video key = {index} videoOn = {props.videoOn} userVideo = {userVideo} ></Video>
                    );
                })
            } */}
        </div>
    );
};

export default VideoArea;