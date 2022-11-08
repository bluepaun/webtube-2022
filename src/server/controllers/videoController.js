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
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = (req, res) => {
  const {
    params: { id },
  } = req;
  return res.render("edit", { pageTitle: `edit` });
};
export const postEdit = (req, res) => {
  const {
    params: { id },
    body: { title },
  } = req;
  return res.redirect(`/videos/${id}`);
};

export const search = (req, res) => res.send("search");
export const deleteVideo = (req, res) => res.send("delete");
export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "upload" });
export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags: hashtagsStr },
  } = req;
  const hashtags = hashtagsStr.split(",").map((word) => `#${word}`);
  try {
    await videoModel.create({
      title,
      description,
      hashtags,
    });
  } catch (err) {
    return res.render("upload", {
      pageTitle: "upload",
      errorMessage: err._message,
    });
  }
  return res.redirect("/");
};
