const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
app.use(express.json());

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: 3306,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "mysql1.0",
};


// Middleware to check session
async function checkSession(req, res, next) {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(401).send({ error: "No session ID" });

  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute("SELECT * FROM sessions WHERE id = ?", [sessionId]);
  await conn.end();
  if (rows.length === 0) return res.status(401).send({ error: "Invalid session" });

  req.userId = rows[0].user_id;
  next();
}

// Transfer money
app.post("/transfer", checkSession, async (req, res) => {
  const { to_user, amount } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [fromUserRow] = await conn.execute("SELECT username FROM users WHERE id = ?", [req.userId]);
  const from_user = fromUserRow[0].username;

  try {
    await conn.beginTransaction();

    // Check balance
    const [[fromAcc]] = await conn.execute("SELECT balance FROM accounts WHERE username = ?", [from_user]);
    if (fromAcc.balance < amount) throw new Error("Insufficient balance");

    // Perform transaction
    await conn.execute("UPDATE accounts SET balance = balance - ? WHERE username = ?", [amount, from_user]);
    await conn.execute("UPDATE accounts SET balance = balance + ? WHERE username = ?", [amount, to_user]);
    await conn.execute("INSERT INTO transactions (from_user, to_user, amount) VALUES (?, ?, ?)", [from_user, to_user, amount]);

    await conn.commit();
    res.send({ message: "Transfer successful" });
  } catch (err) {
    await conn.rollback();
    res.status(400).send({ error: err.message });
  } finally {
    await conn.end();
  }
});


app.listen(3001, () => console.log("Payment running on port 3001"));
