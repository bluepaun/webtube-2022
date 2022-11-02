const fakeUser = {
  username: "Jungwoo",
  logined: false,
};

export const trending = (_, res) => {
  const videos = [
    { title: "one", id: 1, comments: 2 },
    { title: "two", id: 2, comments: 3 },
  ];
  return res.render("home", { pageTitle: "home", videos });
};

export const see = (req, res) => {
  const {
    params: { id },
  } = req;
  return res.render("watch", { pageTitle: `watch ${id}` });
};

export const edit = (req, res) => {
  return res.render("edit", { pageTitle: `edit` });
};

export const search = (req, res) => res.send("search");
export const deleteVideo = (req, res) => res.send("delete");

export const upload = (req, res) => res.send("upload");
