import {
  fileOpen,
  directoryOpen,
  fileSave,
  supported,
} from 'https://unpkg.com/browser-fs-access';

if (supported) {
  console.log('Using the File System Access API.');
} else {
  console.log('Using the fallback implementation.');
}

const openButton = document.querySelector('button#openFile');

openButton.addEventListener('click', async () => {
  const label = document.querySelector('#filename');
  const seek = document.querySelector('#seek');
  const audioElement = document.querySelector('audio');
  audioElement.pause();
  
  const blob = await fileOpen({ mimeTypes: [ 'audio/*' ] });

  label.innerText = blob.name;
  audioElement.src = URL.createObjectURL(blob);

  seek.max = audioElement.duration;
  seek.value = 0;
})