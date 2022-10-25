module.exports = function () {
  const express = require("express");
  const app = express();
  const passport = require("passport"),
    Localstrategy = require("passport-local").Strategy;
  const mysql = require("mysql");
  const db = mysql.createConnection(require("../lib/config").user);
  db.connect();
  const cookieParser = require("cookie-parser");
  const bcrypt = require("bcrypt");

  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());

  const flash = require("connect-flash");
  app.use(flash());

  passport.serializeUser(function (user, done) {
    done(null, user.user_id);
  });

  passport.deserializeUser(function (id, done) {
    db.query(
      `SELECT email, user_id, nickname FROM localuser WHERE user_id=?`,
      [id],
      (err, results) => {
        done(null, results);
      }
    );
  });

  passport.use(
    new Localstrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      function (email, password, done) {
        db.query(
          `SELECT user_id,email,password FROM localuser WHERE email=?`,
          [email],
          (err, topics) => {
            if (topics[0]) {
              bcrypt.compare(password, topics[0].password, (err, result) => {
                if (result) {
                  return done(null, topics[0]);
                } else {
                  return done(null, false, {
                    message: "패스워드를 확인하세요",
                  });
                }
              });
            } else {
              return done(null, false, { message: "이메일을 확인하세요" });
            }
          }
        );
      }
    )
  );
  return passport;
};
