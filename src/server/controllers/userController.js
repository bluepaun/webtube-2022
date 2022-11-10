import User from "../models/User.js";

export const see = (req, res) => {
  console.log(res.params);
  return res.send("watch user");
};
export const getJoin = (req, res) => res.render("join", { pageTitle: "join" });
export const postJoin = async (req, res) => {
  const {
    body: { email, username, password, name, location },
  } = req;
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
