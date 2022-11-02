export const see = (req, res) => {
  console.log(res.params);
  return res.send("watch user");
};
export const join = (req, res) => res.send("join");
export const edit = (req, res) => res.send("edit user");
export const remove = (req, res) => res.send("remove user");
export const login = (req, res) => res.send("login");

export const logout = (req, res) => res.send("logout");
