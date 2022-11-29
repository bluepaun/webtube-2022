import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware } from "./middlewares.js";
import MongoStore from "connect-mongo";
import apiRouter from "./routers/apiRouter.js";
import flash from "express-flash";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(morgan("dev"));

//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use(localsMiddleware);

app.use("/uploads", express.static("uploads"));
app.use("/js", express.static("build/js"));
app.use("/css", express.static("build/css"));
app.use("/static", express.static("build/static"));

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
