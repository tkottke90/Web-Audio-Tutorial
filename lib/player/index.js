const AudioContext = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContext();
const analyser = audio.createAnalyser();
const gainNode = audio.createGain();
const panner = new StereoPannerNode(audio, { pan: 0 });
const distortion = audio.createWaveShaper();

const audioElement = document.querySelector('audio');
const track = audio.createMediaElementSource(audioElement);

analyser.fftSize = 4096;
let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

const canvas = document.querySelector('canvas#bars');
const context = canvas.getContext('2d');

const dotCanvas = document.querySelector('canvas#dots');
const dotContext = dotCanvas.getContext('2d');

const WIDTH = canvas.width = dotCanvas.width = window.innerWidth * 0.80;
const HEIGHT = canvas.height = dotCanvas.height = window.innerHeight * 0.60;

context.fillStyle = 'rgb(0, 0, 0)';
context.clearRect(0, 0, WIDTH, HEIGHT);
let drawVisual;

const bufferLengthMetric = document.querySelector('#buffer')

const seekControl = document.querySelector('#seek');
const currentTime = document.querySelector('#currentTime');
const totalTime = document.querySelector('#totalTime');
let updateSeek = true;

function drawBars(fbcArray) {
  bar_count = WIDTH/7.5;
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#fff'
  
  for (let i = 0; i < bar_count; i++) {
    bar_pos = i * 7.5;
    bar_width = 4;
    bar_height = -(fbcArray[i]) * 0.9; // Shorten as to avoid clipping
    
    context.fillRect(bar_pos, canvas.height, bar_width, bar_height);
  }
  
}


function drawDots(fbcArray) {
  bar_count = WIDTH/7.5;
  
  dotContext.clearRect(0, 0, dotCanvas.width, dotCanvas.height);

  for (let i = 0; i < bar_count; i++) {
    bar_pos = i * 7.5;
    bar_width = 4;
    // bar_height = -(fbcArray[i]);
    bar_height = 10;

    const hue = Math.ceil((i / bar_count) * 240);
    const saturation = 50 + Math.ceil((fbcArray[i]/255) * 50)
    let lightness = Math.ceil((fbcArray[i]/255) * 50);

    if (lightness < 33) {
      lightness = 0;
    }



    dotContext.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`

    dotContext.fillRect(bar_pos, dotCanvas.height/2, bar_width, bar_height);
  }
}

function displayTime(timeInSec) {
  const pad = (number) => {
    return `00${number}`.slice(-2);
  }

  let output = [ 0, 0 ]

  output[0] = Math.floor(timeInSec / 60);
  output[1] = Math.floor(timeInSec % 60);

  return output.map(pad).join(':');
}

function draw() {
  if (!audioElement.paused) {
    requestAnimationFrame(draw);
  }
  
  bufferLengthMetric.textContent = bufferLength;
  
  fbcArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fbcArray);

  drawBars(fbcArray);
  drawDots(fbcArray);


  seekControl.max = audioElement.duration;
  if(updateSeek) {
    seekControl.value = audioElement.currentTime;
  }

  currentTime.innerText = displayTime(audioElement.currentTime || 0)
  totalTime.innerText = displayTime(audioElement.duration || 0);

  seekControl.disabled = !audioElement.duration;
}

draw()

function makeDistortionCurve(amount) {
  let k = amount || 50;
  let n_samples = 44100
  let curve = new Float32Array(n_samples);
  let deg = Math.PI / 180;
  let x;

  for (let i = 0; i < n_samples; i++) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }

  return curve;
}


distortion.curve = makeDistortionCurve(0);
distortion.oversample = 'none';

track
  .connect(gainNode)
  .connect(panner)
  // .connect(distortion)
  .connect(analyser)
  .connect(audio.destination);

const playPauseBtn = document.querySelector('#play-pause');
playPauseBtn.addEventListener('click', function() {

  // check if context is in suspended state (autoplay policy)
  if (audio.state === 'suspended') {
      audio.resume();
  }

  // play or pause track depending on state
  if (this.dataset.playing === 'false') {
      audioElement.play();
      this.dataset.playing = 'true';
      draw();
  } else if (this.dataset.playing === 'true') {
      audioElement.pause();
      this.dataset.playing = 'false';
  }

}, false);

audioElement.addEventListener('ended', function() {
  playPauseBtn.dataset.playing = 'false';
  audioElement.pause();
  audio.currentTime = 0;
}, false);

audioElement.addEventListener('loadeddata', () => {
  volumeControl.disabled = false;
  panControl.disabled = false;
  seekControl.disabled = false;
  distortionControl.disabled = false;
  playPauseBtn.disabled = false;
})

const volumeControl = document.querySelector('#volume');
volumeControl.addEventListener('input', function() {
  gainNode.gain.value = this.value;
}, false);

volumeControl.addEventListener('mouseup', function(event) {
  if (event.button === 2) {
    gainNode.gain.value = 1;
    this.value = 1;
  }
}, false);

const panControl = document.querySelector('#panner');
panControl.addEventListener('input', function() {
  panner.pan.value = this.value;
}, false);

panControl.addEventListener('mouseup', function(event) {
  if (event.button === 2) {
    panner.pan.value.value = 0;
    this.value = 0;
  }
}, false);


const distortionControl = document.querySelector('#distortion');
distortionControl.addEventListener('input', function() {
  distortion.curve = makeDistortionCurve(this.value);
}, false);

distortionControl.addEventListener('mouseup', function(event) {
  if (event.button === 2) {
    distortion.curve = 0;
    this.value = 0;
  }
}, false);

seekControl.addEventListener('mousedown', function() {
  updateSeek = false;
}, false);

seekControl.addEventListener('mouseup', function() {
  updateSeek = true;
  audioElement.currentTime = this.value;
}, false);