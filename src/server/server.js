import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter.mjs";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
