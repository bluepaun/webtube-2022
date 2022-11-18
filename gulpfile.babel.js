import gulp from "gulp";
import gpug from "gulp-pug";
import { deleteSync } from "del";
import gsass from "gulp-sass";
import sass from "sass";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import browserify from "browserify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import GulpImage from "gulp-image";
import cp from "child_process";
import minify from "gulp-minify";

const scss = gsass(sass);

const routes = {
  pug: {
    src: "src/client/views/*.pug",
    dest: "build/",
    watch: "src/client/views/**/*.pug",
  },
  scss: {
    src: "src/client/scss/style.scss",
    dest: "build/css",
    watch: "src/client/scss/**/*.scss",
  },
  js: {
    src: "src/client/js/main.js",
    dest: "build/js",
    watch: "src/client/js/**/*.js",
  },
  img: {
    src: "src/resources/images/*",
    dest: "build/resources/images",
    watch: "src/resources/images/*",
  },
  server: {
    src: "src/server/init.js",
    watch: "src/server/**/*.js",
  },
};

const clean = async () => await deleteSync(["build"]);

const buildPug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const buildScss = () =>
  gulp
    .src(routes.scss.src)
    .pipe(scss().on("error", scss.logError))
    .pipe(
      autoprefixer({
        flexbox: true,
        grid: "autoplace",
      })
    )
    .pipe(csso())
    .pipe(gulp.dest(routes.scss.dest));

const buildJs = () =>
  browserify(routes.js.src)
    .transform("babelify", { presets: ["@babel/preset-env"] })
    .bundle()
    .on("error", function (err) {
      console.error(err);
      this.emit("end");
    })
    .pipe(source("main.js"))
    .pipe(buffer())
    .pipe(
      minify({
        ext: {
          src: "-debug.js",
          min: ".js",
        },
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const buildImg = () =>
  gulp.src(routes.img.src).pipe(GulpImage()).pipe(gulp.dest(routes.img.dest));

let sv = null;
const runServer = (cb) => {
  if (sv) {
    sv.kill("SIGINT");
  }
  sv = cp.spawn(`babel-node`, [`./${routes.server.src}`], { stdio: "inherit" });
  cb();
};

const watch = () => {
  /* gulp.watch(routes.pug.watch, buildPug); */
  gulp.watch(routes.scss.watch, buildScss);
  gulp.watch(routes.js.watch, buildJs);
  gulp.watch(routes.server.watch, runServer);
};

const cleanPublish = async () => await deleteSync([".publish"]);

const prepare = gulp.series([clean]);
export const build = gulp.series([
  prepare,
  gulp.parallel(
    /* buildPug,  */
    buildScss,
    buildJs
    /* buildImg */
  ),
]);
const post = gulp.series([runServer, watch]);

export const dev = gulp.series([build, post]);
export const deploy = gulp.series([prepare, build, cleanPublish]);
