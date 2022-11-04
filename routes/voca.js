const express = require("express");
const app = express();
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();
const mymodule = require("../lib/mymodule");
const fs = require("fs");
const fsExtra = require("fs-extra");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const auth = require("../lib/logonStatus");

// router.all("*", (req, res, next) => {
//   fs.readdir("./public", (err, filelist) => {
//     if (filelist.includes("theVoice")) {
//       fsExtra.emptyDirSync("./public/theVoice");
//       fs.rmdirSync("./public/theVoice");
//       next();
//     } else {
//       next();
//     }
//   });
// });

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
router.get("/", function (req, res, next) {
  const user = req.user[0];
  db.query(
    `SELECT folder_id, folder_name FROM voca_folder WHERE user_id=? AND parent_id=?
  `,
    [user.user_id, "0"],
    (err, result) => {
      body = mymodule.POST(
        "/voca/voca_main",
        mymodule.HIDDEN(result[0].folder_id, "Home", "0")
      );
      res.send(body);
    }
  );
});

router.post("/voca_main", function (req, res, next) {
  const user = req.user[0];
  const post = req.body;
  if (post.modal == "change") {
    modal = "change";
  } else if (post.modal == "delete") {
    modal = "delete";
  } else {
    modal = "";
  }
  db.query(
    `SELECT * FROM voca_folder WHERE parent_id=?;
    SELECT * FROM voca_file WHERE folder_id=?;
    SELECT * FROM voca_folder WHERE folder_id=?;
    SELECT * FROM localuser WHERE user_id=?
  `,
    [post.fd_id, post.fd_id, post.pr_id, user.user_id],
    (err, result) => {
      const objRender = (result, post, modal, gpri, gprn) => {
        return {
          page: "./index",
          content: "./voca/voca_main",
          folder: result[0],
          file: result[1],
          fd_id: post.fd_id,
          fd_name: post.fd_name,
          errmsg: post.errmsg,
          successmsg: post.successmsg,
          pr_id: post.pr_id,
          gpr_id: gpri,
          gpr_name: gprn,
          email: result[3][0].email,
          nickname: result[3][0].nickname,
          date: result[3][0].registered,
          modal: modal,
        };
      };

      if (result[2][0]) {
        res.render(
          "template",
          objRender(
            result,
            post,
            modal,
            result[2][0].parent_id,
            result[2][0].folder_name
          )
        );
      } else {
        res.render("template", objRender(result, post, modal, "", ""));
      }
    }
  );
});

module.exports = router;
