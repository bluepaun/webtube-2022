const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeLineRange = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5;
video.volume = volumeValue;

let controlsTimeoutId = null;

function hideControls() {
  if (controlsTimeoutId) {
    clearTimeout(controlsTimeoutId);
    controlsTimeoutId = null;
  }
  controlsTimeoutId = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
}

video.addEventListener("mousemove", () => {
  videoControls.classList.add("showing");
  hideControls();
});

fullScreenBtn.addEventListener("click", () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtn.innerText = "Full Screen";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "Exit";
  }
});

function formatTime(millisecond) {
  const arr = [];
  const hours = Math.floor(millisecond / (1000 * 60 * 60));
  if (hours !== 0) arr.push(hours);
  millisecond %= 1000 * 60 * 60;
  const minutes = Math.floor(millisecond / (1000 * 60));
  if (hours !== 0) {
    arr.push(String(minutes).padStart(2, "0"));
  } else {
    arr.push(minutes);
  }
  millisecond %= 1000 * 60;
  const seconds = Math.floor(millisecond / 1000);
  arr.push(String(seconds).padStart(2, "0"));

  return arr.join(":");
}

function setTotalDuration(millisecond) {
  totalTime.innerText = formatTime(millisecond);
  timeLineRange.max = millisecond / 1000;
}

if (video.readyState >= 2) {
  setTotalDuration(video.duration * 1000);
}
video.addEventListener("loadedmetadata", () => {
  setTotalDuration(video.duration * 1000);
});

video.addEventListener("timeupdate", () => {
  currentTime.innerText = formatTime(video.currentTime * 1000);
  timeLineRange.value = video.currentTime;
});

playBtn.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

function volumeMute(mute) {
  video.muted = mute;
  if (mute) {
    volumeRange.value = 0;
  } else {
    volumeRange.value = volumeValue;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
}

muteBtn.addEventListener("click", () => {
  volumeMute(!video.muted);
});

volumeRange.addEventListener("input", (e) => {
  const {
    target: { value },
  } = e;

  video.volume = Number(value);
  if (video.volume === 0) {
    video.muted = true;
  } else {
    video.muted = false;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
});

volumeRange.addEventListener("change", (e) => {
  const {
    target: { value },
  } = e;
  if (Number(value) !== 0) {
    volumeValue = Number(value);
  }
  video.volume = Number(value);
});

video.addEventListener("pause", () => {
  playBtn.innerText = "Play";
});

video.addEventListener("play", () => {
  playBtn.innerText = "Pause";
});

timeLineRange.addEventListener("input", (e) => {
  const {
    target: { value },
  } = e;
  video.currentTime = Number(value);
});
