import User from "../models/User.js";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const see = async (req, res) => {
  const {
    params: { id },
  } = req;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).render("404", { pageTitle: "404" });
  }

  return res.render("users/profile", { pageTitle: user.name, user });
};
export const getJoin = (req, res) => res.render("join", { pageTitle: "join" });
export const postJoin = async (req, res) => {
  const {
    body: { email, username, password, passwordConfirm, name, location },
  } = req;
  if (password !== passwordConfirm) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMessage: "password confirmation does not match",
    });
  }

  const isExists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (isExists) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMessage: "This username/email is already taken",
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
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMessage: err._message,
    });
  }

  return res.redirect("/login");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
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

  if (email !== orignalEmail) {
    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "Email already exists",
      });
    }
  }

  if (username !== orignalUsername) {
    const exists = await User.exists({ username });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "Username already exists",
      });
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        avatarUrl: file ? file.path : avatarUrl,
        email,
        username,
        name,
        location,
      },
      { new: true }
    );
    /* req.session.user = { */
    /*   ...req.session.user, */
    /*   email, */
    /*   username, */
    /*   name, */
    /*   location, */
    /* }; */
    req.session.user = updatedUser;
  } catch (error) {
    cosole.log(error);
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: error,
    });
  }

  return res.redirect("/");
};
export const remove = (req, res) => res.send("remove user");

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const {
    body: { username, password },
  } = req;
  const user = await User.findOne({ username });
  if (!user || user.socialOnly) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exist",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;

  res.redirect("/");
};

export const logout = (req, res) => {
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
    return res.redirect("/login");
  }
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: { user },
    body: { confirmPassword, password, passwordConfirm },
  } = req;

  const match = await bcrypt.compare(confirmPassword, user.password);

  if (!match) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change password",
      errorMessage: "Password is wrong, Can not change password",
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).render("users/change-password", {
      pageTitle: "change-password",
      errorMessage: "password confirmation does not match",
    });
  }

  /* const updatedUser = await User.findByIdAndUpdate( */
  /*   user._id, */
  /*   { password }, */
  /*   { new: true } */
  /* ); */
  const updatedUser = await User.findById(user._id);
  updatedUser.password = password;
  await updatedUser.save();

  req.session.user.password = updatedUser.password;

  return res.redirect("/users/logout");
};
