const { createFFmpeg, fetchFile } = FFmpeg;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

function downloadFile(url, fileName) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
}

async function converting() {
  const fileUrl = document.body.dataset.url;
  const ffmpeg = createFFmpeg({
    log: true,
    codePath: "https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js",
  });

  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(fileUrl));
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const curTime = Date.now();

  const mp4File = await ffmpeg.FS("readFile", files.output);
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  downloadFile(mp4Url, `${curTime}.mp4`);

  const thumbnailFile = await ffmpeg.FS("readFile", files.thumb);
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" });
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
  downloadFile(thumbnailUrl, `${curTime}_thumb.jpg`);

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(fileUrl);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbnailUrl);

  window.close();
}

converting();
