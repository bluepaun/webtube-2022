import express from "express";
import {
  watch,
  getEdit,
  deleteVideo,
  postEdit,
  getUpload,
  postUpload,
  getRecorder,
  postRecorder,
  postDownload,
} from "../controllers/videoController.js";
import {
  cropPolicy,
  protectorMiddleware,
  videoUpload,
} from "../middlewares.js";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter.get("/:id([0-9a-f]{24})/delete", protectorMiddleware, deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );
videoRouter
  .route("/recorder")
  .all(protectorMiddleware)
  .get(getRecorder)
  .post(postRecorder);
videoRouter.route("/download").all(cropPolicy).post(postDownload);

export default videoRouter;
