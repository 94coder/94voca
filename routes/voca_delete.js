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

router.post("/delete_data", (req, res) => {
  const post = req.body;
  db.query(
    `DELETE FROM voca_data WHERE file_id=? AND voca=?
  `,
    [post.fl_id, post.voca],
    (err, result) => {
      body = mymodule.POST(
        "/voca/voca_load",
        mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
          `
    <input type='hidden' name='fl_id' value='${post.fl_id}' />
    <input type='hidden' name='errmsg' value='' />
    `
      );
      res.send(body);
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
      body = mymodule.POST(
        "/voca/voca_main",
        mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
          `
    <input type='hidden' name='errmsg' value='' />
    `
      );
      res.send(body);
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
    [post.pfd_id, post.pfd_id, post.pfd_id],
    (err, result) => {
      body = mymodule.POST(
        "/voca/voca_main",
        mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
          `
    <input type='hidden' name='errmsg' value='' />
    `
      );
      res.send(body);
    }
  );
});

module.exports = router;
