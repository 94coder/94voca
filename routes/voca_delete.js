const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/delete_data", (req, res) => {
  const post = req.body;
  db.query(
    `DELETE FROM voca_data WHERE data_id=?
  `,
    [post.dt_id],
    (err, result) => {
      res.send("0");
    }
  );
});

router.post("/delete_file", (req, res) => {
  const post = req.body;
  db.query(
    `
  DELETE FROM voca_data WHERE file_id=?;
  DELETE FROM voca_file WHERE file_id=?
  `,
    [post.fl_id, post.fl_id],
    (err, result) => {
      res.send("0");
    }
  );
});

router.post("/delete_folder", (req, res) => {
  const post = req.body;
  db.query(
    `
    SELECT parent_id FROM voca_folder WHERE folder_id=?;
  DELETE FROM voca_data WHERE folder_id=?;
  DELETE FROM voca_file WHERE folder_id=?;
  DELETE FROM voca_folder WHERE folder_id=?;
  
  `,
    [post.fd_id, post.fd_id, post.fd_id, post.fd_id],
    (err, result) => {
      res.send(`${result[0][0].parent_id}`);
    }
  );
});

router.post("/delete_support", (req, res) => {
  const post = req.body;
  db.query(
    `
  DELETE FROM support WHERE support_id=?;
  `,
    [post.id],
    (err, result) => {
      res.send("0");
    }
  );
});

module.exports = router;
