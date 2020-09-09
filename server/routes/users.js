const router = require("express").Router();
const pool = require("../database/dbconfig");
const bcrypt = require("bcrypt");
const createToken = require("../helpers/createToken");
const emailcheck = require("../helpers/emailcheck");
const auth = require("../helpers/auth");

//Register
router.post("/register", emailcheck, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    //does user exist
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
      name,
    ]);
    if (user.rows.length !== 0) {
      return res.status(401).json("User already exists");
    }

    // encyption
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedWord = await bcrypt.hash(password, salt);

    // store to database
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password",
      [name, email, hashedWord]
    );

    // auth token
    const token = createToken(newUser.rows[0].id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/login", emailcheck, async (req, res) => {
  try {
    const { email, password } = req.body;
    // does user exist
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }
    //check password
    const checkPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!checkPassword) {
      return res.status(401).json("Please try again");
    }
    // 4. give them the jwt token
    const token = createToken(user.rows[0].id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/users/authorised", auth, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
