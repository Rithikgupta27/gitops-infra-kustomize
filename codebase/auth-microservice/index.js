const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const dbConfig = {
  host: "localhost",
  port: 3301,
  user: "root",
  password: "pass",
  database: "mysql1.0",
};

// Signup
app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;

  const conn = await mysql.createConnection(dbConfig);
  try {
    // Insert into users table
    await conn.execute(
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
      [email, username, password]
    );

    // Insert into accounts table with default balance
    await conn.execute(
      "INSERT INTO accounts (email, username, balance) VALUES (?, ?, ?)",
      [email, username, 1000]
    );

    res.send({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err); // Logs full error to help debugging
    res.status(400).send({ error: "Email or username already exists" });
  } finally {
    await conn.end();
  }
});


// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
  if (rows.length === 0) return res.status(401).send({ error: "Invalid credentials" });

  const sessionId = crypto.randomUUID();
  const userId = rows[0].id;
  await conn.execute("INSERT INTO sessions (id, user_id, token) VALUES (?, ?, ?)", [sessionId, userId, sessionId]);
  await conn.end();

  res.send({ sessionId });
});

// Add balance to user's account using ID
app.post("/add-balance", async (req, res) => {
  const { user_id, amount } = req.body;

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).send({ error: "Invalid user_id or amount" });
  }

  const conn = await mysql.createConnection(dbConfig);
  try {
    // Get username using user_id
    const [rows] = await conn.execute("SELECT username FROM users WHERE id = ?", [user_id]);
    if (rows.length === 0) return res.status(404).send({ error: "User not found" });

    const username = rows[0].username;

    await conn.execute(
      "UPDATE accounts SET balance = balance + ? WHERE username = ?",
      [amount, username]
    );

    res.send({ message: `Added ₹${amount} to ${username}'s account` });
  } catch (err) {
    res.status(500).send({ error: "Database error" });
  } finally {
    await conn.end();
  }
});


app.listen(3000, () => console.log("Auth running on port 3000"));
