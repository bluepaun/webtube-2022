import User from "../models/User.js";
import bcrypt from "bcrypt";

export const see = (req, res) => {
  console.log(res.params);
  return res.send("watch user");
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
export const edit = (req, res) => res.send("edit user");
export const remove = (req, res) => res.send("remove user");

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const {
    body: { username, password },
  } = req;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exist",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).redner("login", {
      pageTitle: "Login",
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;

  res.redirect("/");
};

export const logout = (req, res) => res.send("logout");
