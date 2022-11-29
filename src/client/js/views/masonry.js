function setImageRatio(item, cb) {
  const thumbnail = item.querySelector(".video__thumbnail");
  const imageSrc = thumbnail.style.backgroundImage.replace(
    /url\((['"])?(.*?)\1\)/gi,
    "$2"
  );
  const image = new Image();
  image.src = imageSrc;
  image.onload = () => {
    const { width, height } = image;
    const ratio = (height / width) * 100;
    thumbnail.style.paddingTop = `${ratio}%`;
    cb(item);
  };
}
function resizeGriditem(item) {
  const grid = document.querySelector(".video-grid");
  const rowHeight = parseInt(
    window.getComputedStyle(grid).getPropertyValue("grid-auto-rows")
  );
  const rowGap = parseInt(
    window.getComputedStyle(grid).getPropertyValue("gap")
  );
  const rowSpan = Math.ceil(
    (item.querySelector(".content").getBoundingClientRect().height + rowGap) /
      (rowHeight + rowGap)
  );
  item.style.gridRowEnd = `span ${rowSpan}`;
}

function resizeAllGriditem() {
  const items = document.querySelectorAll(".video");
  items.forEach((item) => {
    setImageRatio(item, resizeGriditem);
  });
}

window.addEventListener("load", resizeAllGriditem);
window.addEventListener("resize", resizeAllGriditem);
