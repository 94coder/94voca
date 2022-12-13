const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const flash = require("connect-flash");

app.use(flash());

const auth = require("../lib/logonStatus");

const sanitizeHtml = require("sanitize-html");

const sanitizeOption = {
  allowedTags: [
    "h1",
    "h2",
    "b",
    "i",
    "u",
    "s",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "name", "target"],
    img: ["src"],
    li: ["class"],
  },
  allowedSchemes: ["data", "http"],
};

router.post("*", (req, res, next) => {
  const keys = Object.keys(req.body);
  const dirtyvalues = Object.values(req.body);
  const values = new Array();
  const body = new Object();

  for (filtered of dirtyvalues) {
    values.push(sanitizeHtml(filtered, sanitizeOption));
  }
  for (let i = 0; i < keys.length; i++) {
    body[keys[i]] = values[i];
  }
  req.body = body;
  next();
});

router.get("/", (req, res, next) => {
  // res.redirect("/inspecting");
  if (!auth.IsOwner(req, res)) {
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    res.render("template", {
      page: "./signpage/signpage",
      errmsg: feedback,
    });
  } else {
    next();
  }
});

router.get("/", (req, res) => {
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_file WHERE user_id=? ORDER BY current DESC;
  SELECT * FROM voca_file WHERE user_id=? AND favorites=1;
  `,
    [user.user_id, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/main",
        current: result[0],
        fav: result[1],
      });
    }
  );
});

router.get("/inspecting", (req, res) => {
  res.render("template", {
    page: "./inspect",
  });
});

module.exports = router;
