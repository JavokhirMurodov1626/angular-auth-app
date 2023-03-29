const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool, sessionSecret } = require("./dbConfig");

const app = express();

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

//home
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
//starting server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

app.post("/users/register", async (req, res) => {
    const { name, email, password } = req.body;
  // Check if email is already registered
  const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ])
  if (emailCheck.rowCount > 0) {
    return res.status(400).send("Email is already registered");
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user into database
  const registrationTime = new Date().toISOString();
  const status = "active";

  const user = await pool.query(
    "INSERT INTO users (name, email, password, registration_time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, hashedPassword, registrationTime, status]
  );

  // Create session
  req.session.userId = user.rows[0].id;
  res.send(user.rows[0]);
});


// *******************************User login********************************************
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if email is registered
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (user.rowCount === 0) {
    return res.status(400).send("Invalid email or password");
  }

  // Check password
  const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!passwordMatch) {
    return res.status(400).send("Invalid email or password");
  }

  // Update last login time
  const lastLoginTime = new Date().toISOString();
  await pool.query("UPDATE users SET last_login = $1 WHERE id = $2", [
    lastLoginTime,
    user.rows[0].id,
  ]);

  // Create session
  req.session.userId = user.rows[0].id;
  res.send(user.rows[0]);
});

// User logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.send("Logged out successfully");
    }
  });
});

// Check session
app.get("/session", (req, res) => {
  if (req.session.userId) {
    res.send({ userId: req.session.userId });
  } else {
    res.status(401).send("Not logged in");
  }
});

// Get all users
app.get("/users", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Not logged in");
  }

  if (req.session.userId !== 1) {
    return res.status(403).send("Not authorized");
  }

  const users = await pool.query("SELECT * FROM users");
  res.send(users.rows);
});

// Update user status
app.patch("/users/status", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Not logged in");
  }

  if (req.session.userId !== 1) {
    return res.status(403).send("Not authorized");
  }

  const { userIds, status } = req.body;

  // Convert userIds array to integer array
  const userIdsInt = userIds.map((id) => parseInt(id));

  // Update user status in database
  await pool.query("UPDATE users SET status = $1 WHERE id = ANY($2)", [
    status,
    userIdsInt,
  ]);

  res.send("User status updated successfully");
});

// Delete users
app.delete("/users", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Not logged in");
  }

  if (req.session.userId !== 1) {
    return res.status(403).send("Not authorized");
  }

  const { userIds } = req.body;

  // Convert userIds array to integer array
  const userIdsInt = userIds.map((id) => parseInt(id));

  // Delete users from database
  await pool.query("DELETE FROM users WHERE id = ANY($1)", [userIdsInt]);

  res.send("Users deleted successfully");
});

