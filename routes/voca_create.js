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

router.post("/create_folder", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `
    SELECT folder_name from voca_folder WHERE parent_id=?
    `,
    [post.fd_id],
    (err, result) => {
      if (result.find((x) => x.folder_name === post.new_fd_name)) {
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
        <input type='hidden' name='errmsg' value='폴더명이 상위 폴더내에 이미 존재합니다' />
        `
        );
        res.send(body);
      } else {
        db.query(
          `
            INSERT INTO voca_folder(user_id,parent_id,folder_name) VALUES(?,?,?)
            `,
          [user.user_id, post.fd_id, post.new_fd_name],
          (err, result) => {
            body = mymodule.POST(
              "/voca/voca_main",
              mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id)
            );
            res.send(body);
          }
        );
      }
    }
  );
});

router.post("/create_file", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT file_name from voca_file WHERE folder_id=?
  `,
    [post.fd_id],
    (err, result) => {
      if (result.find((x) => x.file_name === post.new_fl_name)) {
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
      <input type='hidden' name='errmsg' value='단어장명이 해당 폴더내에 이미 존재합니다' />
      `
        );
        res.send(body);
      } else {
        db.query(
          `
    INSERT INTO voca_file(user_id,folder_id,file_name) VALUES(?,?,?)
    `,
          [user.user_id, post.fd_id, post.new_fl_name],
          (err, reset) => {
            db.query(
              `
        SELECT * FROM voca_file WHERE folder_id=? AND file_name=?
        `,
              [post.fd_id, post.new_fl_name],
              (err, result) => {
                body = mymodule.POST(
                  "/voca/create_data_page",
                  mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
                    `
              <input type='hidden' name='fl_id' value='${result[0].file_id}' />
              <input type='hidden' name='errmsg' value='' />
              `
                );

                res.send(body);
              }
            );
          }
        );
      }
    }
  );
});

router.post("/create_data_page", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM localuser WHERE user_id=?
  `,
    [user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_create_data",
        fd_id: post.fd_id,
        fd_name: post.fd_name,
        pr_id: post.pr_id,
        fl_id: post.fl_id,
        errmsg: post.errmsg,
      });
    }
  );
});

router.post("/create_data", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT voca from voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      if (result.find((x) => x.voca === post.voca)) {
        body = mymodule.POST(
          "/voca/create_data_page",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
      <input type='hidden' name='fl_id' value='${post.fl_id}' />
      <input type='hidden' name='errmsg' value='같은 단어or표현이 해당 단어장 내에 존재합니다' />
      `
        );
        res.send(body);
      } else {
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
            body = mymodule.POST(
              "/voca/create_data_page",
              mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
                `
        <input type='hidden' name='fl_id' value='${post.fl_id}' />
        `
            );
            res.send(body);
          }
        );
      }
    }
  );
});

module.exports = router;
