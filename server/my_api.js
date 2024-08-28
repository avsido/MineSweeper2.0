const MineField = require("./MineField.js");
const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const router = express.Router();
let games = {};

// Create MySQL pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "outPut1!",
  database: "user_auth",
});

// Promisify the query method for async/await
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// Middleware for authentication
router.use(async (req, res, next) => {
  const token = req.headers["authorization"];
  const jwtSecret = process.env.JWT_SECRET;
  if (token) {
    try {
      const decoded = jwt.verify(token, jwtSecret); // Replace with your secret key
      req.userId = decoded.id; // Set user ID on the request object
    } catch (error) {
      console.error("Invalid token:", error);
      res.status(401).json({ message: "Invalid token" });
      return;
    }
  }
  next();
});

// Register endpoint
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const users = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length > 0) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sign-in endpoint
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const users = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      await fetchUserGames(res, user.id);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/tap_square", async (req, res) => {
  let { gameId, i, j } = req.query;
  i = parseInt(i);
  j = parseInt(j);
  if (!gameId || !games[gameId]) {
    return res.status(400).json({ message: "Invalid game ID" });
  }
  const mineField = games[gameId];
  if (!mineField.gameOn) mineField.startGame(i, j);
  console.log(mineField.getCell(i, j));
  // try {
  //   const result = game.tapSquare(parseInt(i), parseInt(j));
  //   res.status(200).json(result);
  // } catch (error) {
  //   console.error("Error tapping square:", error);
  //   res.status(500).json({ message: "Internal server error" });
  // }
});

// Start game endpoint
router.get("/start_game", async (req, res) => {
  const text = req.query.text;
  let factor;
  if (text == "easy") {
    factor = 0.85;
  } else if (text == "medium") {
    factor = 0.8;
  } else if (text == "hard") {
    factor = 0.7;
  } else {
    return "invalid";
  }

  try {
    const gameId = Date.now().toString(); // Use a timestamp as a simple unique identifier
    let mineField = new MineField(factor);
    games[gameId] = mineField; // Store the game object

    res.status(200).json({
      message: `Game started with difficulty factor: ${factor}`,
      gameId: gameId,
      mineField: mineField,
    });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

async function fetchUserGames(res, userId) {
  try {
    const gameResults = await query(
      "SELECT date_of_occurrence, duration, result FROM user_games WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({ message: "success", gameResults: gameResults });
  } catch (error) {
    console.error("Error fetching user games:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = router;
