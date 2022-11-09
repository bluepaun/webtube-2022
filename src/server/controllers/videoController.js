import videoModel from "../models/videoModel.js";

export const home = async (_, res) => {
  try {
    const videos = await videoModel.find({});
    return res.render("home", { pageTitle: "home", videos });
  } catch (err) {
    console.log(err);
    return res.send("error", err);
  }
};

export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.render("404", { pagetTitle: "not find" });
  }

  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.render("404", { pagetTitle: "not find" });
  }
  return res.render("edit", { pageTitle: `edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const isVideo = await videoModel.exists({ _id: id });
  if (!isVideo) {
    return res.render("404", { pagetTitle: "not find" });
  }

  const {
    body: { title, description, hashtags },
  } = req;

  await videoModel.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: videoModel.formatHashtags(hashtags),
  });

  return res.redirect(`/videos/${id}`);
};

export const search = (req, res) => res.send("search");
export const deleteVideo = (req, res) => res.send("delete");
export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "upload" });
export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags },
  } = req;
  try {
    await videoModel.create({
      title,
      description,
      hashtags: videoModel.formatHashtags(hashtags),
    });
  } catch (err) {
    return res.render("upload", {
      pageTitle: "upload",
      errorMessage: err._message,
    });
  }
  return res.redirect("/");
};
