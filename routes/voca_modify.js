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

router.post("/modify_folder", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT folder_name from voca_folder WHERE parent_id=?
  `,
    [post.pr_id],
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
          `UPDATE voca_folder SET folder_name=? WHERE folder_id=?;
      `,
          [post.new_fd_name, post.fd_id],
          (err, result) => {
            body = mymodule.POST(
              "/voca/voca_main",
              mymodule.HIDDEN(post.fd_id, post.new_fd_name, post.pr_id) +
                `
            <input type='hidden' name='successmsg' value='폴더명이 변경되었습니다' />
            `
            );
            res.send(body);
          }
        );
      }
    }
  );
});

router.post("/modify_file", (req, res) => {
  const post = req.body;
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
        <input type='hidden' name='errmsg' value='단어장명이 상위 폴더내에 이미 존재합니다' />
        `
        );
        res.send(body);
      } else {
        db.query(
          `UPDATE voca_file SET file_name=? WHERE file_id=?
      `,
          [post.new_fl_name, post.fl_id],
          (err, result) => {
            body = mymodule.POST(
              "/voca/voca_main",
              mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
                `
          <input type='hidden' name='successmsg' value='단어장명이 변경되었습니다' />
          `
            );
            res.send(body);
          }
        );
      }
    }
  );
});

router.post("/modify_data", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT voca FROM voca_data WHERE file_id=?
  `,
    [post.fl_id],
    (err, result) => {
      if (result.find((x) => x.voca === post.voca)) {
        body = mymodule.POST(
          "/voca/voca_load",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
      <input type='hidden' name='errmsg' value='같은 단어or표현이 해당 단어장내에 이미 존재합니다' />
      <input type='hidden' name='fl_id' value='${post.fl_id}' />
      `
        );
        res.send(body);
      } else {
        db.query(
          `UPDATE voca_data SET voca=?, voca_mean=?, exam=?, exam_mean=? WHERE file_id=? AND voca=?
      `,
          [
            post.voca,
            post.voca_mean,
            post.exam,
            post.exam_mean,
            post.fl_id,
            post.p_voca,
          ],
          (err, result) => {
            body = mymodule.POST(
              "/voca/voca_load",
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
          body = mymodule.POST(
            "/voca/voca_main",
            mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
              `
            <input type='hidden' name='toast' value='${favorites}' />
            `
          );
          res.send(body);
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
          body = mymodule.POST(
            "/voca/voca_main",
            mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
              `
            <input type='hidden' name='toast' value='${favorites}' />
            `
          );
          res.send(body);
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
          body = mymodule.POST(
            "/voca/voca_main",
            mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
              `
        <input type='hidden' name='toast' value='${shared + 2}' />
        `
          );
          res.send(body);
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
          body = mymodule.POST(
            "/voca/voca_main",
            mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
              `
        <input type='hidden' name='toast' value='${shared + 2}' />
        `
          );
          res.send(body);
        }
      );
    }
  );
});

module.exports = router;
