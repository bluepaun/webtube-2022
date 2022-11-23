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
    resizeGriditem(item);
  });
}

window.addEventListener("load", resizeAllGriditem);
window.addEventListener("resize", resizeAllGriditem);
