import videoModel from "../models/videoModel.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import fs from "fs";
import { isDeploy } from "../utils.js";
import { s3 } from "../middlewares.js";

const VIDEO_VIEW_PREFIX = "videos/";

export const home = async (req, res) => {
  try {
    const videos = await videoModel
      .find({})
      .populate("owner")
      .sort({ createdAt: "desc" });
    return res.render("home", {
      pageTitle: "home",
      videos,
    });
  } catch (err) {
    req.flash("error", "Cannot find videos");
    return res.send("error", err);
  }
};

export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await videoModel
    .findById(id)
    .populate("owner")
    .populate({ path: "comments", populate: { path: "owner" } });

  if (!video) {
    req.flash("error", "Cannot find video");
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
    req.flash("error", "Cannot find video");
    return res.status(404).render("404", { pagetTitle: "not find" });
  }

  if (!req.session.user || String(video.owner) !== req.session.user._id) {
    req.flash("error", "Owner does not match. Please check Login");
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
  } = req;

  const video = await videoModel.findById(id);
  if (!video) {
    req.flash("error", "Cannot find video");
    return res.status(404).render("404", { pagetTitle: "not find" });
  }

  if (!req.session.user || String(video.owner) !== req.session.user._id) {
    req.flash("error", "Owner does not match. Please check Login");
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
    req.flash("error", "Cannot find video");
    return res.status(404).render("404", { pageTitle: "404" });
  }

  if (!req.session.user || String(video.owner) !== req.session.user._id) {
    req.flash("error", "Owner does not match. Please check Login");
    return res.status(403).redirect("/");
  }

  const { fileUrl, thumbUrl } = video;
  if (isDeploy) {
    const deleteFile = (url) => {
      const fileName = url.replace(/^.*\/videos\/(.*)$/gi, "$1");
      const param = {
        Bucket: "wetube-blue",
        Key: `videos/${fileName}`,
      };
      s3.deleteObject(param, (err, data) => {
        if (err) console.log(err, err.stack); // an error occurred
      });
    };
    deleteFile(fileUrl);
    deleteFile(thumbUrl);
  } else {
    fs.unlink(`./${fileUrl}`, (err) => console.log(err));
    fs.unlink(`./${thumbUrl}`, (err) => console.log(err));
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
    files: { video, thumb },
    session: {
      user: { _id },
    },
  } = req;

  const fileUrl = video[0].path || video[0].location;
  const thumbUrl = thumb[0].path || thumb[0].location;

  try {
    const newVideo = await videoModel.create({
      title,
      description,
      hashtags: videoModel.formatHashtags(hashtags),
      fileUrl,
      thumbUrl,
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
  } catch (err) {
    req.flash("error", "Cannot create video");
    return res.status(400).render(VIDEO_VIEW_PREFIX + "upload", {
      pageTitle: "upload",
    });
  }

  req.flash("info", "Upload Video success");
  return res.redirect("/");
};

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  console.log(id);
  const video = await videoModel.findById(id);
  if (!video) {
    req.flash("error", "Cannot find Video");
    return res.sendStatus(404);
  }

  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};

export const getRecorder = (req, res) =>
  res.render(VIDEO_VIEW_PREFIX + "recorder", { pageTitle: "Recorder" });

export const postRecorder = (req, res) => {};

export const postDownload = (req, res) => {
  console.log(req.body);
  const { url } = req.body;
  res.render(VIDEO_VIEW_PREFIX + "download", {
    pageTitle: "Download",
    fileUrl: url,
  });
};

export const createComment = async (req, res) => {
  const {
    params: { id: videoId },
    body: { text },
    session: {
      user: { _id: userId },
    },
  } = req;

  const video = await videoModel.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }

  const commentUser = await User.findById(userId);
  if (!commentUser) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: commentUser._id,
    video: video._id,
  });

  video.comments.push(comment._id);
  commentUser.comments.push(comment._id);
  video.save();
  commentUser.save();

  req.session.user = commentUser;

  return res.status(201).json({ comment, owner: commentUser });
};

export const deleteComment = async (req, res) => {
  const {
    body: { commentid },
    session: {
      user: { _id: commentUserId },
    },
    params: { id: videoId },
  } = req;

  const video = await videoModel.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }

  const commentUser = await User.findById(commentUserId);
  if (!commentUser) {
    return res.sendStatus(404);
  }

  const comment = await Comment.findById(commentid);
  if (!comment) {
    return res.sendStatus(404);
  }

  if (
    String(comment.owner) !== String(commentUser._id) ||
    String(comment.video) !== String(video._id)
  ) {
    return res.sendStatus(401);
  }

  await Comment.findByIdAndDelete(commentid);
  commentUser.comments.splice(commentUser.comments.indexOf(commentid), 1);
  commentUser.save();
  video.comments.splice(video.comments.indexOf(commentid), 1);
  video.save();

  return res.sendStatus(202);
};
