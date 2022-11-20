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
router.get("/", (req, res, next) => {
  res.redirect("/voca/voca_main");
});

// router.get("/voca_main", (req, res) => {
//   res.redirect("/");
// });

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
// router.post("/voca_main", (req, res, next) => {
//   const user = req.user[0];
//   const post = req.body;
//   if (post.modal == "change") {
//     modal = "change";
//   } else if (post.modal == "delete") {
//     modal = "delete";
//   } else {
//     modal = "";
//   }
//   if (post.toast == 0) {
//     toast = 0;
//   } else if (post.toast == 1) {
//     toast = 1;
//   } else if (post.toast == 2) {
//     toast = 2;
//   } else if (post.toast == 3) {
//     toast = 3;
//   } else if (post.toast == null) {
//     toast = 4;
//   }

//   db.query(
//     `SELECT * FROM voca_folder WHERE parent_id=?;
//     SELECT * FROM voca_file WHERE folder_id=?;
//     SELECT * FROM voca_folder WHERE folder_id=?;
//     SELECT * FROM voca_folder WHERE folder_id=?
//   `,
//     [post.fd_id, post.fd_id, post.pr_id, post.fd_id],
//     (err, result) => {
//       const objRender = (result, post, modal, gpri, gprn) => {
//         return {
//           page: "./index",
//           content: "./voca/voca_main",
//           folder: result[0],
//           file: result[1],
//           fd_id: post.fd_id,
//           fd_name: post.fd_name,
//           errmsg: post.errmsg,
//           successmsg: post.successmsg,
//           pr_id: post.pr_id,
//           gpr_id: gpri,
//           gpr_name: gprn,
//           modal: modal,
//           toast: toast,
//           fd_fav: result[3][0].favorites,
//           fd_sh: result[3][0].shared,
//         };
//       };

//       if (result[2][0]) {
//         res.render(
//           "template",
//           objRender(
//             result,
//             post,
//             modal,
//             result[2][0].parent_id,
//             result[2][0].folder_name
//           )
//         );
//       } else {
//         res.render("template", objRender(result, post, modal, "", ""));
//       }
//     }
//   );
// });

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
