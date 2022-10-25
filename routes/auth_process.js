const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mymodule = require("../lib/mymodule");

const passport = require("../lib/passport")();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

router.post("/signup_process", (req, res) => {
  const post = req.body;
  bcrypt.hash(post.password, 10, (err, hash) => {
    db.query(
      `INSERT INTO localuser(email, password, nickname) VALUES(?,?,?);
          SELECT user_id FROM localuser WHERE email=?
          `,
      [post.email, hash, post.nickname, post.email],
      (err, topics) => {
        const uid = topics[1][0].user_id;
        db.query(
          `
              INSERT INTO voca_folder(user_id,folder_name,parent_id) VALUES(?,'Home',0);
              `,
          [uid],
          (err, result) => {
            req.login(post, (err) => {
              body = mymodule.POST(
                "/auth/login_process",
                `
              <input type='hidden' name='email' value='${post.email}' />
              <input type='hidden' name='password' value='${post.password}' />
              `
              );
              return res.send(body);
            });
          }
        );
      }
    );
  });
});

router.post(
  "/login_process",
  passport.authenticate("local", {
    successRedirect: "/voca",
    failureRedirect: "/auth",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.send(`
  <script>window.location.href = '/auth';</script>
  `);
  });
});

router.post("/modify_nickname", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT nickname from localuser WHERE user_id=?
  `,
    [user.user_id],
    (err, result) => {
      if (result.find((x) => x.nickname === post.nickname)) {
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
      <input type='hidden' name='errmsg' value='이미 존재하는 닉네임입니다' />
      `
        );
        res.send(body);
      } else {
        db.query(
          `UPDATE localuser SET nickname=? WHERE user_id=?
      `,
          [post.nickname, user.user_id],
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

router.post("/modify_password_check", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT password FROM localuser WHERE user_id=?
  `,
    [user.user_id],
    (err, result) => {
      bcrypt.compare(post.password, result[0].password, (err, results) => {
        if (results) {
          body = mymodule.POST(
            "/voca/voca_main",
            mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
              `
        <input type='hidden' name='modal' value='${post.modal}' />
        `
          );
          res.send(body);
        } else {
          body = mymodule.POST(
            "/voca/voca_main",
            mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
              `
        <input type='hidden' name='errmsg' value='비밀번호를 확인하세요' />
        `
          );
          res.send(body);
        }
      });
    }
  );
});

router.post("/modify_password", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  bcrypt.hash(post.password, 10, (err, hash) => {
    db.query(
      `
        UPDATE localuser SET password=? WHERE user_id=?
        `,
      [hash, user.user_id],
      (err, result) => {
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id)
        );
        res.send(body);
      }
    );
  });
});

router.post("/delete_auth", (req, res) => {
  const user = req.user[0];
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    db.query(
      `
    DELETE FROM voca_data WHERE user_id=?;
    DELETE FROM voca_file WHERE user_id=?;
    DELETE FROM voca_folder WHERE user_id=?;
    DELETE FROM localuser WHERE user_id=?;
    `,
      [user.user_id, user.user_id, user.user_id, user.user_id],
      (err, result) => {
        res.send(`
  <script>window.location.href = '/auth';</script>
  `);
      }
    );
  });
});

module.exports = router;
