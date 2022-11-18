const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();
const mymodule = require("../lib/mymodule");
// const pollyObj = require("../lib/config").polly;
// const AWS = require("aws-sdk");
// const Stream = require("stream");
// const Speaker = require("speaker");
// const Polly = new AWS.Polly(pollyObj);

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/voca_load", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.fl_id, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_load",
        loadlist: result[0],
        fl_id: post.fl_id,
        fd_id: post.fd_id,
        fd_name: post.fd_name,
        pr_id: post.pr_id,
        errmsg: post.errmsg,
      });
    }
  );
});

router.post("/voca_study", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE file_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.fl_id, user.user_id],
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_study",
        fl_id: post.fl_id,
        fd_id: post.fd_id,
        fd_name: post.fd_name,
        pr_id: post.pr_id,
        loadlist: result[0],
      });
    }
  );
});

// tts서비스 잠정중단
// router.post("/voca_audio", (req, res) => {
//   const post = req.body;
//   const Player = new Speaker({
//     channels: 1,
//     bitDepth: 16,
//     sampleRate: 16000,
//   });
//   const params = {
//     Text: post.body,
//     OutputFormat: "pcm",
//     VoiceId: "Matthew",
//   };
//   Polly.synthesizeSpeech(params, (err, data) => {
//     if (err) {
//       console.log(err.code);
//     } else if (data) {
//       if (data.AudioStream instanceof Buffer) {
//         // Initiate the source
//         let bufferStream = new Stream.PassThrough();
//         // convert AudioStream into a readable stream
//         bufferStream.end(data.AudioStream);
//         // Pipe into Player
//         bufferStream.pipe(Player);
//       }
//     }
//   });
// });

router.post("/search", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_data WHERE voca REGEXP ? AND voca_data.user_id=? OR voca_mean REGEXP ? AND voca_data.user_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.voca, user.user_id, post.voca, user.user_id, user.user_id],
    (err, result) => {
      if (!result[0][0]) {
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
        <input type='hidden' name='errmsg' value='검색 결과가 없습니다' />
          `
        );
        res.send(body);
      } else {
        res.render("template", {
          page: "./index",
          content: "./voca/voca_search",
          fl_id: post.fl_id,
          fd_id: post.fd_id,
          fd_name: post.fd_name,
          pr_id: post.pr_id,
          loadlist: result[0],
        });
      }
    }
  );
});

router.get("/shared_page", (req, res) => {
  const user = req.user[0];
  db.query(
    `SELECT * FROM voca_folder WHERE shared=1;
  SELECT * FROM voca_file WHERE shared=1;
  `,
    (err, result) => {
      res.render("template", {
        page: "./index",
        content: "./voca/voca_shared",
        folder: result[0],
        file: result[1],
      });
    }
  );
});

module.exports = router;
