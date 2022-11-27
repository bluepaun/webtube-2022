const preview = document.getElementById("preview");
const recordBtn = document.getElementById("record");

let previewStream;
async function getStream() {
  try {
    previewStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    preview.srcObject = previewStream;
    preview.play();
  } catch (err) {
    console.log(err);
    return;
  }
}

let recorder;
let videoUrl;

function handleDataAvailable(e) {
  const { data } = e;
  videoUrl = URL.createObjectURL(data);
  preview.srcObject = null;
  preview.src = videoUrl;
  preview.play();
}

async function downloadRecord() {
  const f = document.createElement("form");
  const input = document.createElement("input");
  f.method = "POST";
  f.action = "/videos/download";
  f.target = "_blank";
  input.type = "text";
  input.name = "url";
  input.value = videoUrl;
  f.appendChild(input);

  document.body.appendChild(f);

  f.submit();
  f.remove();

  preview.srcObject = previewStream;
  preview.play();

  recordBtn.innerText = "Record";
  recordBtn.removeEventListener("click", downloadRecord);
  recordBtn.addEventListener("click", startRecord);
}

function startRecord() {
  recordBtn.innerText = "Stop";
  recordBtn.removeEventListener("click", startRecord);
  recordBtn.addEventListener("click", stopRecord);

  const options = {
    mimeType: "video/webm",
  };

  recorder = new MediaRecorder(previewStream, options);
  recorder.addEventListener("dataavailable", handleDataAvailable);
  recorder.start();
}

function stopRecord() {
  recordBtn.innerText = "Download File";
  recordBtn.removeEventListener("click", stopRecord);
  recordBtn.addEventListener("click", downloadRecord);
  if (recorder) {
    recorder.stop();
    recorder = null;
  }
}
recordBtn.addEventListener("click", startRecord);

getStream();
