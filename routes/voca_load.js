const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();
const mymodule = require("../lib/mymodule");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/voca_load", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.fl_id, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_load",
        loadlist: result[0],
        fl_id: post.fl_id,
        fd_id: post.fd_id,
        fd_name: post.fd_name,
        pr_id: post.pr_id,
        errmsg: post.errmsg,
        email: result[1][0].email,
        nickname: result[1][0].nickname,
        date: result[1][0].registered,
      });
    }
  );
});

router.post("/voca_study", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.fl_id, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_study",
        fl_id: post.fl_id,
        fd_id: post.fd_id,
        fd_name: post.fd_name,
        pr_id: post.pr_id,
        loadlist: result[0],
        email: result[1][0].email,
        nickname: result[1][0].nickname,
        date: result[1][0].registered,
      });
    }
  );
});

router.post("/search", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE voca REGEXP ? AND voca_data.user_id=? OR voca_mean REGEXP ? AND voca_data.user_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.voca, user.user_id, post.voca, user.user_id, user.user_id],
    (err, result) => {
      if (!result[0][0]) {
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
        <input type='hidden' name='errmsg' value='검색 결과가 없습니다' />
          `
        );
        res.send(body);
      } else {
        res.render("template", {
          page: "./index",
          content: "./voca/voca_search",
          fl_id: post.fl_id,
          fd_id: post.fd_id,
          fd_name: post.fd_name,
          pr_id: post.pr_id,
          loadlist: result[0],
          email: result[1][0].email,
          nickname: result[1][0].nickname,
          date: result[1][0].registered,
        });
      }
    }
  );
});

module.exports = router;
