const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/modify_folder", (req, res) => {
  const post = req.body;
  db.query(
    `UPDATE voca_folder SET folder_name=? WHERE folder_id=?;
    `,
    [post.new_fd_name, post.fd_id],
    (err, result) => {
      res.send("0");
    }
  );
});

router.post("/modify_file", (req, res) => {
  const post = req.body;
  db.query(
    `UPDATE voca_file SET file_name=? WHERE file_id=?
    `,
    [post.new_fl_name, post.fl_id],
    (err, result) => {
      res.send("0");
    }
  );
});

router.post("/modify_data", (req, res) => {
  const post = req.body;
  db.query(
    `UPDATE voca_data SET voca=?, voca_mean=?, exam=?, exam_mean=? WHERE data_id=?
      `,
    [post.voca, post.voca_mean, post.exam, post.exam_mean, post.dt_id],
    (err, result) => {
      res.send("1");
    }
  );
});

router.post("/favorites_file", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT favorites FROM voca_file WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      if (result[0].favorites == 0) {
        favorites = 1;
      } else {
        favorites = 0;
      }
      db.query(
        `
        UPDATE voca_file SET favorites=? WHERE file_id=?
        `,
        [favorites, post.fl_id],
        (err, result) => {
          res.send(`${favorites}`);
        }
      );
    }
  );
});

router.post("/favorites_folder", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT favorites FROM voca_folder WHERE folder_id=?
  `,
    [post.fd_id],
    (err, result) => {
      if (result[0].favorites == 0) {
        favorites = 1;
      } else {
        favorites = 0;
      }
      db.query(
        `
      UPDATE voca_folder SET favorites=? WHERE folder_id=?
      `,
        [favorites, post.fd_id],
        (err, result) => {
          res.send(`${favorites}`);
        }
      );
    }
  );
});

router.post("/share_file", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT shared FROM voca_file WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      if (result[0].shared == 0) {
        shared = 1;
      } else {
        shared = 0;
      }
      db.query(
        `UPDATE voca_file SET shared=? WHERE file_id=?
    `,
        [shared, post.fl_id],
        (err, result) => {
          res.send(`${shared}`);
        }
      );
    }
  );
});

router.post("/share_folder", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT shared FROM voca_folder WHERE folder_id=?
  `,
    [post.fd_id],
    (err, result) => {
      if (result[0].shared == 0) {
        shared = 1;
      } else {
        shared = 0;
      }
      db.query(
        `UPDATE voca_folder SET shared=? WHERE folder_id=?
    `,
        [shared, post.fd_id],
        (err, result) => {
          res.send(`${shared}`);
        }
      );
    }
  );
});

router.post("/move_file", (req, res) => {
  const post = req.body;
  db.query(
    `
  UPDATE voca_file SET folder_id=? WHERE file_id=?
  `,
    [post.fd_id, post.fl_id],
    (err, result) => {
      res.send("0");
    }
  );
});

module.exports = router;
