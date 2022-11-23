const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const auth = require("../lib/logonStatus");

router.get("*", (req, res, next) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/signpage");
  } else {
    next();
  }
});

router.post("*", (req, res, next) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/signpage");
  } else {
    next();
  }
});

/* GET home page. */
router.get("/", (req, res, next) => {
  res.redirect("/voca/voca_main");
});

router.get("/voca_main", (req, res) => {
  const user = req.user[0];
  db.query(
    `SELECT folder_id FROM voca_folder WHERE user_id=? AND parent_id=0`,
    [user.user_id],
    (err, result) => {
      let fd_id = result[0].folder_id;
      db.query(
        `SELECT * FROM voca_folder WHERE parent_id=?;
      SELECT * FROM voca_file WHERE folder_id=?
      `,
        [fd_id, fd_id],
        (err, result2) => {
          res.render("template", {
            page: "./index",
            content: "./voca/voca_main",
            selected_folder: fd_id,
            pr_id: 0,
            folder: result2[0],
            file: result2[1],
          });
        }
      );
    }
  );
});

router.post("/load_list", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_folder WHERE parent_id=?;
    SELECT * FROM voca_file WHERE folder_id=?;
    SELECT * FROM voca_folder WHERE folder_id=?;
    `,
    [post.fd_id, post.fd_id, post.pr_id],
    (err, result) => {
      if (post.order == 1) {
        newest = result[1].sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });
        console.log(result[1]);
      } else if (post.order == 2) {
        file_list = result[1].sort((a, b) => {
          let x = a.file_name.toLowerCase();
          let y = b.file_name.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
      }
      res.send(result);
    }
  );
});

router.get("/load_fav", (req, res) => {
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_file WHERE user_id=? AND favorites=1;
    SELECT * FROM voca_folder WHERE user_id=? AND favorites=1
  `,
    [user.user_id, user.user_id],
    (err, result) => {
      res.send(result);
    }
  );
});

router.post("/load_fav_file", (req, res) => {
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

router.post("/load_sha_file", (req, res) => {
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

router.get("/get_user", (req, res) => {
  const user = req.user[0];
  db.query(
    `SELECT * FROM localuser WHERE user_id=?
  `,
    [user.user_id],
    (err, result) => {
      res.send(result[0]);
    }
  );
});

module.exports = router;
