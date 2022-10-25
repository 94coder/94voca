const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const auth = require("../lib/logonStatus");

const flash = require("connect-flash");

app.use(flash());

/* GET home page. */
router.get("/", function (req, res) {
  if (auth.IsOwner(req, res)) {
    res.redirect("/voca");
  } else {
    db.query(
      `SELECT email,nickname FROM localuser
    `,
      (err, checked) => {
        const checked_email = new Array();
        const checked_nickname = new Array();
        for (var e of checked) {
          checked_email.push(e.email);
          checked_nickname.push(e.nickname);
        }
        const fmsg = req.flash();
        let feedback = "";
        if (fmsg.error) {
          feedback = fmsg.error[0];
        }
        res.render("template", {
          page: "./auth/auth",
          errmsg: feedback,
          email_list: checked_email,
          nick_list: checked_nickname,
        });
      }
    );
  }
});
module.exports = router;
