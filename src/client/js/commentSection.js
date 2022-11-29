const form = document.getElementById("commentForm");
const videoPlay = document
  .getElementById("videoContainer")
  .querySelector("video");

const videoid = videoPlay.dataset.videoid;
const commentsBox = document.querySelector(".video__comments");
const commentsUl = commentsBox.querySelector("ul");
const commentsLis = commentsUl.querySelectorAll(".video__comment");
commentsLis.forEach((li) => {
  const btn = li.querySelector("button");
  if (!btn) return;
  btn.addEventListener("click", handleDeleteComment);
});

async function handleDeleteComment(e) {
  const {
    target: {
      dataset: { commentid },
    },
  } = e;
  const { status } = await fetch(`/api/videos/${videoid}/comment`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentid }),
  });
  if (status !== 202) {
    return;
  }
  const parentLi = e.target.parentElement;
  parentLi.remove();
}

function addComment(text, newCommentId) {
  const li = document.createElement("li");
  li.classList.add("video__comment");
  const span = document.createElement("span");
  span.innerText = text;
  const button = document.createElement("button");
  button.innerText = "x";
  button.dataset.commentid = newCommentId;
  button.addEventListener("click", handleDeleteComment);

  li.appendChild(span);
  li.appendChild(button);
  commentsUl.prepend(li);
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;

    if (text === "") return;

    const response = await fetch(`/api/videos/${videoid}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.status === 201) {
      const { newCommentId } = await response.json();
      addComment(text, newCommentId);
      textarea.value = "";
    }
  });
}
