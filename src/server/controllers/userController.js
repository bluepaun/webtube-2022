import User from "../models/User.js";

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
    return res.render("join", {
      pageTitle: "join",
      errorMessage: "password confirmation does not match",
    });
  }

  const isExists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (isExists) {
    return res.render("join", {
      pageTitle: "join",
      errorMessage: "This username/email is already taken",
    });
  }

  await User.create({
    email,
    username,
    password,
    name,
    location,
  });
  return res.redirect("/login");
};
export const edit = (req, res) => res.send("edit user");
export const remove = (req, res) => res.send("remove user");
export const login = (req, res) => res.send("login");

export const logout = (req, res) => res.send("logout");
