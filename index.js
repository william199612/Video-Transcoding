import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm';

// Get HTML elements
const resolutionCheckBoxes = document.getElementsByClassName('checkbox-resolution');
const formatCheckBoxes = document.getElementsByClassName('checkbox-format');
const fileInput = document.getElementById('input-file');
const dropZone = document.getElementById('drop-area');
const content = document.getElementById('content');
const resetBtn = document.getElementById('reset-btn');
const videoPreview = document.querySelector('video');
const msgDiv = document.getElementById('msg-div');

// prevant checkbox select multiple at the same time
for (let i = 0; i < resolutionCheckBoxes.length; i++) {
  resolutionCheckBoxes[i].addEventListener('click', function (e) {
    for (let j = 0; j < resolutionCheckBoxes.length; j++) {
      if (resolutionCheckBoxes[j].value !== e.target.value) {
        resolutionCheckBoxes[j].checked = false;
      }
    }
  });
}

for (let i = 0; i < formatCheckBoxes.length; i++) {
  formatCheckBoxes[i].addEventListener('click', function (e) {
    for (let j = 0; j < formatCheckBoxes.length; j++) {
      if (formatCheckBoxes[j].value !== e.target.value) {
        formatCheckBoxes[j].checked = false;
      }
    }
  });
}

window.onload = async function () {
  console.log('Winodw onload!!!');
  const res = await axios.post(`${window.location.href}redis/getCache`);
  if (res.data.success && res.data.hasCache) {
    const msgDiv = document.getElementById('msgDiv');
    msgDiv.innerHTML = `<br><a href=${res.data.url}>Download Video</a>`;
  }
};

// handle file input
fileInput.removeEventListener('change', handleFileInput);
fileInput.addEventListener('change', handleFileInput);

function handleFileInput (e) {
  handleVideoPreview();
}

// drag and drop
dropZone.removeEventListener('drop', handleFileDrop);
dropZone.addEventListener('drop', handleFileDrop, false);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.removeEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
  e.preventDefault();
}

function handleFileDrop (e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (!files[0].type.includes('video')) {
    msgDiv.innerText = 'This file is not supported!!';
    return;
  } else {
    msgDiv.innerText = '';
  }
  console.log(files[0].type);
  fileInput.files = files;
  handleVideoPreview();
}

// process video preview
function handleVideoPreview () {
  console.log('Enter handleVideoPreview');
  dropZone.classList.toggle('hidden');
  videoPreview.classList.toggle('hidden');
  console.log(videoPreview.classList);
  const blobURL = window.URL.createObjectURL(fileInput.files[0]);
  videoPreview.src = blobURL;
  console.log(videoPreview);
}

// handle event of reset button
resetBtn.removeEventListener('click', clickResetBtn);
resetBtn.addEventListener('click', clickResetBtn);

function clickResetBtn (e) {
  msgDiv.innerText = '';
  if (fileInput.files.length === 0) return;
  fileInput.value = '';
  dropZone.classList.toggle('hidden');
  videoPreview.classList.toggle('hidden');
}
