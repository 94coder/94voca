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
  if (user.darkmode == "0") {
    style = "logonstyle";
  } else {
    style = "darkmode";
  }
  db.query(
    `SELECT folder_id FROM voca_folder WHERE user_id=? AND parent_id=0`,
    [user.user_id],
    (err, result) => {
      let fd_id = result[0].folder_id;
      db.query(
        `SELECT * FROM voca_folder WHERE parent_id=?;
      SELECT * FROM voca_file WHERE folder_id=?
      `,
        [fd_id, fd_id],
        (err, result2) => {
          res.render("template", {
            page: "./index",
            content: "./voca/voca_main",
            fd_id: fd_id,
            pr_id: "0",
            gpr_id: "0",
            folder: result2[0],
            file: result2[1],
            fd_name: "Home",
            pr_name: "0",
            fav: "0",
            sha: "0",
            toast: "",
            style: style,
          });
        }
      );
    }
  );
});

router.get("/inspecting", (req, res) => {
  res.render("template", {
    page: "./inspect",
  });
});

module.exports = router;
