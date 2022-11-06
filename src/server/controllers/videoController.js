const fakeUser = {
  username: "Jungwoo",
  logined: false,
};
let videos = [
  { title: "one", id: 1, views: 3, comments: 2 },
  { title: "two", id: 2, views: 1, comments: 3 },
  { title: "three", id: 3, views: 1000, comments: 3 },
];

export const trending = (_, res) => {
  return res.render("home", { pageTitle: "home", videos });
};

export const watch = (req, res) => {
  const {
    params: { id },
  } = req;
  const video = videos.find((v) => {
    return v.id === parseInt(id);
  });
  return res.render("watch", { pageTitle: `watch ${video.title}`, video });
};

export const getEdit = (req, res) => {
  const {
    params: { id },
  } = req;
  const video = videos.find((v) => v.id === parseInt(id));
  return res.render("edit", { pageTitle: `edit ${video.title}`, video });
};
export const postEdit = (req, res) => {
  const {
    params: { id },
    body: { title },
  } = req;
  console.log(title);
  const video = videos.find((v) => v.id === parseInt(id));
  video.title = title;
  console.log(videos);
  return res.redirect(`/videos/${id}`);
};

export const search = (req, res) => res.send("search");
export const deleteVideo = (req, res) => res.send("delete");
export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "upload" });
export const postUpload = (req, res) => {
  const {
    body: { title },
  } = req;
  videos.push({
    title,
    id: videos[videos.length - 1].id + 1,
    views: 0,
    comments: 0,
  });
  return res.redirect("/");
};
