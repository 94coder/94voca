const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const db = mysql.createConnection(require("../lib/config").user);
db.connect();
const auth = require("../lib/logonStatus");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mymodule = require("../lib/mymodule");
const nodemailer = require("nodemailer");
const mailer = require("../lib/config").mailstore;

const passport = require("../lib/passport")();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

router.get("/personal_policy", (req, res) => {
  res.render("personal_policy");
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post("/modify_nick_check", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT nickname FROM localuser
  `,
    (err, result) => {
      const checked = result.find((nickname) => {
        return nickname.nickname === post.nickname;
      });

      if (checked) {
        res.send("1");
      } else {
        res.send("0");
      }
    }
  );
});

router.post("/modify_nickname", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `UPDATE localuser SET nickname=? WHERE user_id=?
  `,
    [post.nickname, user.user_id],
    (err, result) => {
      res.send("0");
    }
  );
});

router.post("/password_check", (req, res) => {
  const post = req.body;
  const user = req.user[0];
  db.query(
    `SELECT password FROM localuser WHERE user_id=?
  `,
    [user.user_id],
    (err, result) => {
      bcrypt.compare(post.password, result[0].password, (err, results) => {
        if (results) {
          res.send("1");
        } else {
          res.send("0");
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
        res.send("0");
      }
    );
  });
});

router.post("/delete_member", (req, res) => {
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
        res.redirect("/");
      }
    );
  });
});

router.get("*", (req, res, next) => {
  if (auth.IsOwner(req, res)) {
    res.redirect("/");
  } else {
    next();
  }
});

router.post("*", (req, res, next) => {
  if (auth.IsOwner(req, res)) {
    res.redirect("/");
  } else {
    next();
  }
});

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
                "/signpage/login_process",
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
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true,
  })
);

router.post("/pwdmail", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT email FROM localuser WHERE email=?
  `,
    [post.email],
    (err, result) => {
      if (result[0]) {
        const newpwd = Math.random().toString(36).slice(2);
        bcrypt.hash(newpwd, 10, (err, hash) => {
          db.query(
            `
              UPDATE localuser SET password=? WHERE email=?
              `,
            [hash, post.email],
            (err, result) => {
              let transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                auth: {
                  user: mailer.mail,
                  pass: mailer.mailpwd,
                },
              });

              var mailOptions = {
                from: mailer.mail,
                to: post.email,
                subject: "94voca 에서의 새 비밀번호를 확인해주세요",
                text: `
                새로 발급된 임시비밀번호 : ' ${newpwd} '
                로그인 후 비밀번호를 꼭 변경해주세요.
                `,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  res.send("1");
                }
              });
            }
          );
        });
      } else {
        res.send("2");
      }
    }
  );
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.post("/check_info", (req, res) => {
  const post = req.body;
  db.query(
    `SELECT email,nickname FROM localuser
  `,
    (err, result) => {
      const mail = result.filter((it) => it.email.includes(post.email));
      const nick = result.filter((it) => it.nickname.includes(post.nickname));
      if (mail[0]) {
        res.send("1");
      } else if (nick[0]) {
        res.send("2");
      } else {
        res.send("3");
      }
    }
  );
});

module.exports = router;
