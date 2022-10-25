const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  for (i = 0; i < keys.length; i++) {
    body[keys[i]] = values[i];
  }
  req.body = body;
  next();
});

router.get("/", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/signpage");
  } else {
    res.redirect("/voca");
  }
});

module.exports = router;
