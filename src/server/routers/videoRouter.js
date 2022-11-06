import express from "express";
import {
  watch,
  getEdit,
  deleteVideo,
  postEdit,
  getUpload,
  postUpload,
} from "../controllers/videoController.js";

const videoRouter = express.Router();

videoRouter.route("/upload").get(getUpload).post(postUpload);
videoRouter.get("/:id(\\d+)", watch);
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
videoRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videoRouter;
