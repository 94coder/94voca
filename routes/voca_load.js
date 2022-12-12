const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/load", (req, res) => {
  const post = req.body;
  res.render("template", {
    page: "./index",
    content: "./voca/load",
    fl_id: post.fl_id,
    fl_name: post.fl_name,
    fd_id: post.fd_id,
  });
});

router.post("/load_data", (req, res) => {
  const post = req.body;
  db.query(
    `UPDATE voca_file SET current=CURRENT_TIMESTAMP WHERE file_id=?;
    SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id, post.fl_id],
    (err, result) => {
      res.send(result[1]);
    }
  );
});

router.post("/study", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/study",
        fl_id: post.fl_id,
        fl_name: post.fl_name,
        fd_id: post.fd_id,
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
        content: "./voca/shared_page",
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

router.post("/shared_file_load", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/shared_file_load",
        loadlist: result,
        fl_id: post.fl_id,
        fl_name: post.fl_name,
      });
    }
  );
});

router.post("/load_shared_foldersfile", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_file WHERE folder_id=?
  `,
    [post.fd_id],
    (err, result) => {
      res.send(result);
    }
  );
});

router.post("/search", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE voca REGEXP ? AND voca_data.user_id=? OR voca_mean REGEXP ? AND voca_data.user_id=?;
  `,
    [post.word, user.user_id, post.word, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/search",
        loadlist: result,
        keyword: post.word,
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
