import react, {useState} from 'react'
import Video from './Video'
import classes from './VideoArea.module.css'

const VideoArea = (props) => {
    const [listOfVideos, setlistOfVideos] = useState(['#FF0000', '#FF8000', '#FF8000', '#660033']);
    return (
        <div className={`row ${classes.VideoArea}`}>
            {
                listOfVideos.map((currentItem) => {
                    return(
                        <div className="col-md">
                            {/* <Video videoOn = {props.videoOn} ></Video> */}
                            <div style={{maxWidth:'1280px', maxHeight:'720px', minWidth:'50px', minHeight:'50px', backgroundColor: currentItem}}></div>
                        </div>
                    );
                })
            }
        </div>
    );
};

export default VideoArea;