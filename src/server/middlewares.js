import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3";
import { isDeploy } from "./utils.js";

export const s3 = new S3({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

function createDirectoryFunc(pathName) {
  return function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = pathName + newFileName;
    ab_callback(null, fullPath);
  };
}

const multerS3ImageUploader = multerS3({
  s3,
  acl: "public-read",
  bucket: "wetube-blue",
  key: createDirectoryFunc("images/"),
});

const multerS3VideoUploader = multerS3({
  s3,
  acl: "public-read",
  bucket: "wetube-blue",
  key: createDirectoryFunc("videos/"),
});

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Wetube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isDeploy = isDeploy;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "already Logged in");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
  storage: isDeploy ? multerS3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 50000000,
  },
  storage: isDeploy ? multerS3VideoUploader : undefined,
});

export const cropPolicy = (req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
};
