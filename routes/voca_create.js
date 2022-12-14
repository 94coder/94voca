const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/folder_check", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT folder_name from voca_folder WHERE parent_id=? AND folder_name=?
  `,
    [post.fd_id, post.new_fd_name],
    (err, result) => {
      if (result[0]) {
        res.send("1");
      } else {
        res.send("0");
      }
    }
  );
});

router.post("/parent_check", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT parent_id from voca_folder WHERE folder_id=?;
  `,
    [post.fd_id],
    (err, result) => {
      db.query(
        `SELECT folder_name from voca_folder WHERE parent_id=? AND folder_name=?`,
        [result[0].parent_id, post.new_fd_name],
        (err, result2) => {
          if (result2[0]) {
            res.send("1");
          } else {
            res.send("0");
          }
        }
      );
    }
  );
});

router.post("/create_folder", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `
      INSERT INTO voca_folder(user_id,parent_id,folder_name) VALUES(?,?,?)
      `,
    [user.user_id, post.fd_id, post.new_fd_name],
    (err, result) => {
      res.send("0");
    }
  );
});

router.post("/file_check", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT file_name from voca_file WHERE folder_id=? AND file_name=?
  `,
    [post.fd_id, post.new_fl_name],
    (err, result) => {
      if (result[0]) {
        res.send("1");
      } else {
        res.send("0");
      }
    }
  );
});

router.post("/create_file", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `
    INSERT INTO voca_file(user_id,folder_id,file_name) VALUES(?,?,?)
    `,
    [user.user_id, post.fd_id, post.new_fl_name],
    (err, result) => {
      db.query(
        `SELECT file_id FROM voca_file WHERE folder_id=? AND file_name=?
              `,
        [post.fd_id, post.new_fl_name],
        (err, result) => {
          res.send(`${result[0].file_id}`);
        }
      );
    }
  );
});

router.post("/create_data", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `
      INSERT INTO voca_data(user_id,folder_id,file_id,voca,voca_mean,exam,exam_mean) VALUES(?,?,?,?,?,?,?)
      `,
    [
      user.user_id,
      post.fd_id,
      post.fl_id,
      post.voca,
      post.voca_mean,
      post.exam,
      post.exam_mean,
    ],
    (err, result) => {
      res.send("1");
    }
  );
});

router.post("/create_support", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `
  INSERT INTO support(user_id,title,message) VALUES(?,?,?)
  `,
    [user.user_id, post.title, post.message],
    (err, result) => {
      res.send("0");
    }
  );
});

module.exports = router;
