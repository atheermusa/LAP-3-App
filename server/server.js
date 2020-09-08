const express = require("express");
const { pool } = require("./database/dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

// // Middleware
app.use(cors());
app.use(express.json());
// // Parses details from a form
app.use(express.urlencoded({ extended: false }));
// // app.set("view engine", "ejs");

app.use(
  session({
    //     // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    //     // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    //     // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);

// // Funtion inside passport which initializes passport
app.use(passport.initialize());
// // Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
// app.use(flash());

app.get("/", (req, res) => {
  res.send("Express Server Running");
});

// // app.get("/users/register", checkAuthenticated, (req, res) => {
// //   res.render("register.ejs");
// // });

// // app.get("/users/login", checkAuthenticated, (req, res) => {
// //   // flash sets a messages variable. passport sets the error message
// //   // console.log(req.session.flash.error);
// //   res.render("login.ejs");
// // });

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  console.log(req.user.name);
  pool.query(
    `SELECT * from activities where name_id = (SELECT id from users where name = $1)`,
    req.user.name,
    (results) => {
      console.log(results.rows);
    }
  );
  res.send({ user: req.user.name, data: results.rows });
});

// // app.get("/users/logout", (req, res) => {
// //   req.logout();
// //   res.render("index", { message: "You have logged out successfully" });
// // });

app.post("/users/register", async (req, res) => {
  let { name, email, password } = req.body;

  let errors = [];

  console.log({
    name,
    email,
    password,
  });

  hashedPassword = await bcrypt.hash(password, 10);

  console.log(hashedPassword);
  // Validation passed
  pool.query(
    `SELECT * FROM users
        WHERE (email = $1) OR (name = $2)`,
    [email, name],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      
      //Code below checks if  the username or email is already used
      //by querying the db and seeing if anything is returned on those values
      //if so, user isn't addded, otherwise they are
      if (results.rows.length > 0) {
        res.json("Email or Name already used");
      } else {
        pool.query(
          `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, password`,
          [name, email, hashedPassword],
          (err, results) => {
            if (err) {
              throw err;
            }
            console.log(results.rows);
            res.json(`Welcome to TrackerApp ${name}! Please log in`);
            // res.redirect("/users/login");
          }
        );
      }
    }
  );
});

// app.post(
//   "/users/login",
//   passport.authenticate("local", {
//     successRedirect: "/users/dashboard",
//     failureRedirect: "/users/login",
//     failureFlash: true,
//   })
// );

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

app.listen(port, () =>
  console.log(`App listening on http://localhost:${port}/`)
);
