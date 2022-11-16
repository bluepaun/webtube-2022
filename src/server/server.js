import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware } from "./middlewares.js";
import MongoStore from "connect-mongo";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(morgan("dev"));

//body parser
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    resave: false,
    saveUninitialized: false,
  })
);

app.use(localsMiddleware);

app.use("/uploads", express.static("uploads"));

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
