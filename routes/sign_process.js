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
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const mailer = require("../lib/config").mailstore;

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
    successRedirect: "/voca",
    failureRedirect: "/signpage",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/signpage");
  });
});

router.post("/modify_nick_check", (req, res) => {
  const post = req.body;
  const user = req.user[0];
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
      body = mymodule.POST(
        "/voca/voca_main",
        mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
          `
        <input type='hidden' name='successmsg' value='닉네임이 변경되었습니다' />
        `
      );
      res.send(body);
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
        body = mymodule.POST(
          "/voca/voca_main",
          mymodule.HIDDEN(post.fd_id, post.fd_name, post.pr_id) +
            `
        <input type='hidden' name='successmsg' value='비밀번호가 변경되었습니다' />
        `
        );
        res.send(body);
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
        res.redirect("/signpage");
      }
    );
  });
});

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
              var transporter = nodemailer.createTransport(
                smtpTransport({
                  service: "gmail",
                  host: "smtp.gmail.com",
                  auth: {
                    user: mailer.mail,
                    pass: mailer.mailpwd,
                  },
                })
              );

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
                  res.send(`
                  <script>
                    alert('메일을 확인해주세요');
                    window.location.href = '/';
                  </script>
                  `);
                }
              });
            }
          );
        });
      } else {
        res.send(`
        <script>
          alert('가입되지 않은 이메일입니다');
          window.location.href = '/';
        </script>
        `);
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
    successRedirect: "/voca",
    failureRedirect: "/signpage",
  })
);

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successRedirect: "/voca",
    failureRedirect: "/signpage",
  })
);

module.exports = router;
