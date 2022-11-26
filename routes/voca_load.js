const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/voca_load", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      console.log(result);
      res.render("template", {
        page: "./index",
        content: "./voca/voca_load",
        loadlist: result,
        fd_id: post.fd_id,
        fl_id: post.fl_id,
        fl_name: post.fl_name,
      });
    }
  );
});

router.post("/voca_study", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_study",
        fd_id: post.fd_id,
        fl_id: post.fl_id,
        fl_name: post.fl_name,
        loadlist: result,
      });
    }
  );
});

router.get("/shared_page", (req, res) => {
  db.query(
    `SELECT * FROM voca_folder WHERE shared=1;
  SELECT * FROM voca_file WHERE shared=1;
  `,
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_shared",
        folder: result[0],
        file: result[1],
      });
    }
  );
});

router.post("/shared_user", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT nickname FROM localuser WHERE user_id=?;
  `,
    [post.user_id],
    (err, result) => {
      res.send(result[0]);
    }
  );
});

router.post("/shared_voca_load", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_share_load",
        loadlist: result,
        fl_id: post.fl_id,
        fl_name: post.fl_name,
      });
    }
  );
});

router.post("/shared_voca_study", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_share_study",
        fl_id: post.fl_id,
        fl_name: post.fl_name,
        loadlist: result,
      });
    }
  );
});

router.post("/my_search", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE voca REGEXP ? AND voca_data.user_id=? OR voca_mean REGEXP ? AND voca_data.user_id=?;
  `,
    [post.voca, user.user_id, post.voca, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_search",
        loadlist: result,
        user: 0,
        keyword: post.voca,
      });
    }
  );
});

router.post("/sha_search", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE voca REGEXP ? OR voca_mean REGEXP ?;
  `,
    [post.voca, post.voca],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_search",
        loadlist: result,
        user: 1,
        keyword: post.voca,
      });
    }
  );
});

router.get("/load_support", (req, res) => {
  const user = req.user[0];
  db.query(
    `
  SELECT * FROM support WHERE user_id=?
  `,
    [user.user_id],
    (err, result) => {
      res.send(result);
    }
  );
});

module.exports = router;
