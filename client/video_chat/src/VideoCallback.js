class VideoCallback{
    startCapture = () => {
        var constraints = { audio: false, video: true };
        navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
          var video = document.querySelector('video');
          video.srcObject = mediaStream;
          video.onloadedmetadata = function(e) {
            video.play();
          };
        })
        .catch(function(err) { console.log(err.name + ": " + err.message); });
    };
}

export default VideoCallback;