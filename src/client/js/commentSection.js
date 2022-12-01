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
  console.dir(btn);
  btn.addEventListener("click", handleDeleteComment);
});

async function handleDeleteComment(e) {
  const {
    target: {
      dataset: { commentid },
    },
  } = e;

  console.dir(e.target);
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

function addComment(comment, owner) {
  const li = document.createElement("li");
  li.classList.add("video__comment");

  let img;
  if (owner.avatarUrl) {
    const imgurl =
      (owner.avatarUrl.includes("http") ? "" : "/") + owner.avatarUrl;
    img = `<img src="${imgurl}">`;
  } else {
    img = `<i class="bx bx-user"></i>`;
  }

  li.innerHTML = `<li class="video__comment"><a class="video__owner" href="/users/${owner._id}"><div class="video__owner-avatar">
${img}</div><h5>${owner.name}</h5></a><span>${comment.text}
</span><button data-commentid="${comment._id}"> <i class="bx bx-message-alt-x"></i></button></li>`;

  commentsUl.prepend(li);
  const btn = li.querySelector("button");
  btn.addEventListener("click", handleDeleteComment);
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
      const { comment, owner } = await response.json();
      addComment(comment, owner);
      textarea.value = "";
    }
  });
}
