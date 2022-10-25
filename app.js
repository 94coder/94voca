const createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// const helmet = require("helmet");
// const cspOptions = {
//   directives: {
//     ...helmet.contentSecurityPolicy.getDefaultDirectives(),

//     "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],

//     "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
//   },
// };

// app.use(
//   helmet({
//     contentSecurityPolicy: cspOptions,
//   })
// );

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const authLogicRouter = require("./routes/auth_process");
const vocaRouter = require("./routes/voca");
const vocaCreateRouter = require("./routes/voca_create");
const vocaLoadRouter = require("./routes/voca_load");
const vocaModifyRouter = require("./routes/voca_modify");
const vocaDeleteRouter = require("./routes/voca_delete");

const passport = require("passport");

const session = require("express-session");
const session_store = require("./lib/config").sessionstore;
const MySQLStore = require("express-mysql-session")(session);

app.use(
  session({
    secret: "session_cookie_secret",
    store: new MySQLStore(session_store),
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

const flash = require("connect-flash");
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

const compression = require("compression");
app.use(compression());

app.use("", indexRouter);
app.use("/auth", authRouter);
app.use("/auth", authLogicRouter);
app.use("/voca", vocaRouter);
app.use("/voca", vocaCreateRouter);
app.use("/voca", vocaLoadRouter);
app.use("/voca", vocaModifyRouter);
app.use("/voca", vocaDeleteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
