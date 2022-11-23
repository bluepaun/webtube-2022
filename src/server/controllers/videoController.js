import videoModel from "../models/videoModel.js";
import User from "../models/User.js";

const VIDEO_VIEW_PREFIX = "videos/";

export const home = async (req, res) => {
  try {
    const videos = await videoModel.find({}).sort({ createdAt: "desc" });
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
  const video = await videoModel.findById(id).populate("owner");
  if (!video) {
    return res.status(404).render("404", { pagetTitle: "not find" });
  }

  return res.render(VIDEO_VIEW_PREFIX + "watch", {
    pageTitle: video.title,
    video,
  });
};

export const getEdit = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.status(404).render("404", { pagetTitle: "not find" });
  }

  if (!req.session.user || String(video.owner) !== req.session.user._id) {
    return res.status(403).redirect("/");
  }

  return res.render(VIDEO_VIEW_PREFIX + "edit", {
    pageTitle: `edit ${video.title}`,
    video,
  });
};
export const postEdit = async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const video = await videoModel.findById(id);
  if (!video) {
    return res.status(404).render("404", { pagetTitle: "not find" });
  }

  if (!req.session.user || String(video.owner) !== req.session.user._id) {
    return res.status(403).redirect("/");
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

export const search = async (req, res) => {
  const {
    query: { s },
  } = req;
  let videos = [];
  if (s) {
    videos = await videoModel.find({
      title: {
        $regex: new RegExp(s, "i"),
      },
    });
  }
  return res.render("search", {
    pageTitle: "Search",
    videos,
  });
};

export const deleteVideo = async (req, res) => {
  const {
    params: { id },
  } = req;

  const video = await videoModel.findById(id);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "404" });
  }

  if (!req.session.user || String(video.owner) !== req.session.user._id) {
    return res.status(403).redirect("/");
  }

  const user = await User.findById(req.session.user._id);

  await videoModel.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();

  return res.redirect("/");
};

export const getUpload = (req, res) =>
  res.render(VIDEO_VIEW_PREFIX + "upload", { pageTitle: "upload" });

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags },
    file: { path: fileUrl },
    session: {
      user: { _id },
    },
  } = req;
  try {
    const newVideo = await videoModel.create({
      title,
      description,
      hashtags: videoModel.formatHashtags(hashtags),
      fileUrl,
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
  } catch (err) {
    return res.status(400).render(VIDEO_VIEW_PREFIX + "upload", {
      pageTitle: "upload",
      errorMessage: err._message,
    });
  }
  return res.redirect("/");
};
