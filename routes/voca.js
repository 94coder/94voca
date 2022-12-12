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
const mymodule = require("../lib/mymodule");
const AWS = require("aws-sdk");

const aws_info = require("../lib/config").aws;

const Polly = new AWS.Polly({
  accessKeyId: aws_info.accessKeyId,
  secretAccessKey: aws_info.secretAccessKey,
  signatureVersion: aws_info.signatureVersion,
  region: aws_info.region,
});

router.get("*", (req, res, next) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
  } else {
    next();
  }
});

router.post("*", (req, res, next) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
  } else {
    next();
  }
});

router.get("/folder", (req, res) => {
  const user = req.user[0];
  db.query(
    `SELECT folder_id FROM voca_folder WHERE user_id=? AND parent_id=0
  `,
    [user.user_id],
    (err, result) => {
      body = mymodule.POST(
        "/voca/folder",
        mymodule.HIDDEN(result[0].folder_id)
      );
      res.send(body);
    }
  );
});

router.post("/folder", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  let toast;
  if (post.toast) {
    toast = post.toast;
  } else {
    toast = null;
  }
  db.query(
    `SELECT * FROM voca_folder WHERE parent_id=?;
  SELECT * FROM voca_file WHERE folder_id=?;
  SELECT * FROM voca_folder WHERE folder_id=?;
  SELECT * FROM voca_folder WHERE user_id=? AND favorites=1;
  SELECT folder_id FROM voca_folder WHERE user_id=? AND parent_id=0;
  `,
    [post.fd_id, post.fd_id, post.fd_id, user.user_id, user.user_id],
    (err, result) => {
      if (result[2][0].parent_id == 0) {
        is_root = "0";
      } else {
        is_root = "1";
      }
      if (!post.order || post.order == 0) {
        order = 0;
        newest = result[1].sort((a, b) => {
          return new Date(a.created) - new Date(b.created);
        });
      } else if (post.order == 1) {
        order = 1;
        newest = result[1].sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });
      } else if (post.order == 2) {
        order = 2;
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
      res.render("template", {
        page: "./index",
        content: "./voca/folder",
        folder: result[0],
        file: result[1],
        fd_name: result[2][0].folder_name,
        is_root: is_root,
        fd_id: post.fd_id,
        fav_folder: result[3],
        toast: toast,
        fav: result[2][0].favorites,
        sha: result[2][0].shared,
        order: order,
        pr_id: result[2][0].parent_id,
        root: result[4].folder_id,
      });
    }
  );
});

router.post("/get_parent", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT parent_id FROM voca_folder WHERE folder_id=?`,
    [post.fd_id],
    (err, result) => {
      res.send(`${result[0].parent_id}`);
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

router.post("/tts", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT voca,exam FROM voca_data WHERE data_id=?
  `,
    [post.id],
    (err, result) => {
      let ttstext = "";
      if (post.text == "voca") {
        ttstext = result[0].voca;
      } else if (post.text == "exam") {
        ttstext = result[0].exam;
      }
      const params = {
        Text: ttstext,
        OutputFormat: "mp3",
        VoiceId: "Matthew",
      };
      Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
          console.log(err.code);
        } else if (data) {
          if (data.AudioStream instanceof Buffer) {
            res.send(data.AudioStream);
          }
        }
      });
    }
  );
});

router.post("/load_move_folder", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT * FROM voca_folder WHERE parent_id=?;
    SELECT * FROM voca_folder WHERE folder_id=?`,
    [post.pr_id, post.pr_id],
    (err, result) => {
      res.send(result);
    }
  );
});

module.exports = router;
