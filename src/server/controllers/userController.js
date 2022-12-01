import User from "../models/User.js";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { isDeploy } from "../utils.js";
import fs from "fs";
import { s3 } from "../middlewares.js";

const USERS_VIEW_PREFIX = "users/";

export const see = async (req, res) => {
  const {
    params: { id },
  } = req;

  const user = await User.findById(id).populate({
    path: "videos",
    populate: { path: "owner", sort: { createdAt: "desc" } },
  });

  user.videos.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  if (!user) {
    req.flash("error", "Cannot find user");
    return res.status(404).render("404", { pageTitle: "404" });
  }

  return res.render(USERS_VIEW_PREFIX + "profile", {
    pageTitle: user.name,
    user,
  });
};

export const getJoin = (req, res) =>
  res.render(USERS_VIEW_PREFIX + "join", { pageTitle: "join" });

export const postJoin = async (req, res) => {
  const {
    body: { email, username, password, passwordConfirm, name, location },
  } = req;
  if (password !== passwordConfirm) {
    req.flash("error", "password confirmation does not match");
    return res.status(400).render(USERS_VIEW_PREFIX + "join", {
      pageTitle: "join",
    });
  }

  const isExists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (isExists) {
    req.flash("error", "This username/email is already taken");
    return res.status(400).render(USERS_VIEW_PREFIX + "join", {
      pageTitle: "join",
    });
  }

  try {
    await User.create({
      email,
      username,
      password,
      name,
      location,
    });
  } catch (error) {
    req.flash("error", "Cannot create user");
    return res.status(400).render(USERS_VIEW_PREFIX + "join", {
      pageTitle: "join",
      errorMessage: err._message,
    });
  }

  return res.redirect("/login");
};
export const getEdit = (req, res) => {
  return res.render(USERS_VIEW_PREFIX + "edit-profile", {
    pageTitle: "Edit Profile",
  });
};
export const postEdit = async (req, res) => {
  const {
    body: { email, username, name, location },
    session: {
      user: {
        _id: id,
        username: orignalUsername,
        email: orignalEmail,
        avatarUrl,
      },
    },
    file,
  } = req;
  let newAvatarUrl;
  if (file) {
    newAvatarUrl = file.path || file.location;
  }

  if (email !== orignalEmail) {
    const exists = await User.exists({ email });
    if (exists) {
      req.flash("error", "Email already exists");
      return res.status(400).render(USERS_VIEW_PREFIX + "edit-profile", {
        pageTitle: "Edit Profile",
      });
    }
  }

  if (username !== orignalUsername) {
    const exists = await User.exists({ username });
    if (exists) {
      req.flash("error", "Username already exists");
      return res.status(400).render(USERS_VIEW_PREFIX + "edit-profile", {
        pageTitle: "Edit Profile",
      });
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        avatarUrl: newAvatarUrl || avatarUrl,
        email,
        username,
        name,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
  } catch (error) {
    req.flash("error", "Cannot update user");
    return res.status(400).render(USERS_VIEW_PREFIX + "edit-profile", {
      pageTitle: "Edit Profile",
    });
  }

  if (isDeploy) {
    if (!avatarUrl.includes("avatars.githubusercontent.com")) {
      const fileName = avatarUrl.replace(/^.*\/images\/(.*)$/gi, "$1");
      const param = {
        Bucket: "wetube-blue",
        Key: `images/${fileName}`,
      };
      s3.deleteObject(param, (err, data) => {
        if (err) console.log(err, err.stack); // an error occurred
      });
    }
  } else {
    if (newAvatarUrl && !avatarUrl.includes("http"))
      fs.unlink(`./${avatarUrl}`, (err) => console.log(err));
  }

  return res.redirect("/");
};

export const getLogin = (req, res) => {
  return res.render(USERS_VIEW_PREFIX + "login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const {
    body: { username, password },
  } = req;
  const user = await User.findOne({ username });
  if (!user || user.socialOnly) {
    req.flash("error", "An account with this username does not exist");
    return res.status(400).render(USERS_VIEW_PREFIX + "login", {
      pageTitle: "Login",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    req.flash("error", "Wrong password");
    return res.status(400).render(USERS_VIEW_PREFIX + "login", {
      pageTitle: "Login",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;

  req.flash("success", "Login success Welcome");
  res.redirect("/");
};

export const logout = (req, res) => {
  req.flash("info", "bye bye");
  req.session.destroy();
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };

  const params = new URLSearchParams(config);

  const url = `${baseUrl}?${params.toString()}`;
  return res.redirect(url);
};

export const finishGithubLogin = async (req, res) => {
  const {
    query: { code },
  } = req;

  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code,
  };
  const baseUrl = "https://github.com/login/oauth/access_token";

  const params = new URLSearchParams(config);
  const url = `${baseUrl}?${params.toString()}`;
  const tokenRequest = await (
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const emailUrl = "/user/emails";
    const emailData = await (
      await fetch(`${apiUrl}${emailUrl}`, {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find((email) => email.primary && email.verified);
    if (!emailObj) {
      req.flash("error", "Cannot find email");
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        email: emailObj.email,
        socialOnly: true,
        username: userData.login,
        name: userData.name ? userData.name : "Unknow",
        location: userData.location ? userData.location : "Unknow",
        avatarUrl: userData.avatar_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    req.flash("error", "Cannot access github login");
    return res.redirect("/login");
  }
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    req.flash("error", "Cannot change password of social account");
    return res.redirect("/");
  }
  return res.render(USERS_VIEW_PREFIX + "change-password", {
    pageTitle: "Change password",
  });
};

export const postChangePassword = async (req, res) => {
  const {
    session: { user },
    body: { confirmPassword, password, passwordConfirm },
  } = req;

  const match = await bcrypt.compare(confirmPassword, user.password);

  if (!match) {
    req.flash("error", "Password is wrong, Can not change password");
    return res.status(400).render(USERS_VIEW_PREFIX + "change-password", {
      pageTitle: "Change password",
    });
  }

  if (password !== passwordConfirm) {
    req.flash("error", "password confirmation does not match");
    return res.status(400).render(USERS_VIEW_PREFIX + "change-password", {
      pageTitle: "change-password",
    });
  }

  const updatedUser = await User.findById(user._id);
  updatedUser.password = password;
  await updatedUser.save();

  req.session.user.password = updatedUser.password;

  req.flash("info", "password changing sucess");
  return res.redirect("/users/logout");
};
