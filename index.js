import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm';


let videoFile = null;

function handleFileSelect (e) {
    videoFile = e.target.files[0];
}

async function videoTranscode () {
    if (videoFile != null) {
        const res = await axios.post(
            `${window.location.href}transcode`,
            {
                file: videoFile
            }
        )
        console.log(res);
    } else {
        console.log('Please choose a file which u want to transcode!!!');
    }
}


const videoFileBtn = document.getElementById('video-file');
videoFileBtn.removeEventListener('change', handleFileSelect);
videoFileBtn.addEventListener('change', handleFileSelect);

const transcodeBtn = document.getElementById('transcodeBtn');
transcodeBtn.removeEventListener('click', videoTranscode);
transcodeBtn.addEventListener('click', videoTranscode);
