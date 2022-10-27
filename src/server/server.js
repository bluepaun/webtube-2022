import express from "express";

const PORT = 3000;

const app = express();

app.get("/", (req, res) => {
  res.render("hello");
});

app.listen(PORT, () => {
  console.log(`listening localhost:${PORT}`);
});
