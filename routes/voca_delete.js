const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
const mymodule = require("../lib/mymodule");
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
  DELETE FROM voca_data WHERE folder_id=?;
  DELETE FROM voca_file WHERE folder_id=?;
  DELETE FROM voca_folder WHERE folder_id=?
  `,
    [post.fd_id, post.fd_id, post.fd_id],
    (err, result) => {
      body = mymodule.POST(
        "/voca/main",
        mymodule.HIDDEN(post.pr_id, post.gpr_id) +
          `
        <input type="hidden" name="toast" value="폴더가 삭제되었습니다" />
        `
      );
      res.send(body);
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
