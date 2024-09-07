const MineField = require("./MineField.js");
const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const router = express.Router();
let games = {};

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "outPut1!",
  database: "user_auth",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

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

    const userId = await query(
      "SELECT id FROM users WHERE username = ? AND password = ?",
      [username, hashedPassword]
    );
    //console.log(typeof userId[0].id); //////////// access to user ID

    res
      .status(201)
      .json({ message: "Registration successful", userId: userId[0].id });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

    if (users.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      //console.log(user.id); //////////// access to user ID
      //await fetchUserGames(res, user.id);
      res.status(200).json({ message: "success", userId: user.id });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get_past_games", async (req, res) => {
  const userId = parseInt(req.query.userId);
  fetchUserGames(res, userId);
});

router.get("/start_game", async (req, res) => {
  const diff = req.query.diff;

  const userId = parseInt(req.query.userId);
  if (typeof diff != "string") {
    return console.log("invalid diffic");
  }
  if (!Number.isInteger(userId)) {
    return res.status(401).json({ message: "Invalid credentials" });
  } else {
    try {
      const [results] = await query(
        "SELECT COUNT(*) AS count FROM users WHERE id = ?",
        [userId]
      );
      const isValidUserId = results.count > 0;

      if (!isValidUserId) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      return console.error("Error querying the database:", error.message);
    }
  }

  let factor;
  // ADD SECURITYYYS
  if (diff == "EASY") {
    factor = 0.85;
  } else if (diff == "MEDIUM") {
    factor = 0.8;
  } else if (diff == "HARD") {
    factor = 0.7;
  } else {
    return "invalid";
  }

  try {
    const gameId = Date.now().toString();
    let mineField = new MineField(factor);
    mineField.id.user = userId;
    games[gameId] = mineField;
    mineField.id.game = gameId;

    res.status(200).json({
      message: `Game started with difficulty factor: ${factor}`,
      gameId: gameId,
      board: mineField.board,
      gameOn: mineField.gameOn,
      rows: mineField.rows,
      cols: mineField.cols,
      flags: mineField.flags,
      hasStarted: mineField.time.hasStarted,
      t: mineField.time.t,
    });
    mineField.time.startTime = new Date().getTime();
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/tap_square", async (req, res) => {
  let { gameId, i, j } = req.query;

  if (!gameId || !games[gameId]) {
    return res.status(400).json({ message: "Invalid game ID" });
  }

  i = parseInt(i);
  j = parseInt(j);

  if (!validateIorJ(i) || !validateIorJ(j)) {
    // console.log(i);
    // console.log(j);
    return res.status(200).json({ message: "invalid i or j" });
  }

  const mineField = games[gameId];

  if (!mineField.gameOn.hasStarted) {
    mineField.startGame(i, j);
    for (let k = 0; k < mineField.rows; k++) {
      for (let l = 0; l < mineField.cols; l++) {
        mineField.getCell(k, l).neighborMineCount = mineField.getMineCount(
          k,
          l
        );
      }
    }
  }

  if (mineField.getCell(i, j).isMine == 1) {
    mineField.gameOn.gameOver = true;
    const currentTime = new Date().getTime();
    const t = Math.floor((currentTime - mineField.time.startTime) / 1000);
    mineField.time.t = t;
    // HERE I will handle filling the DB in case of LOSS //
    res.status(200).json({
      message: `GAME OVER!`,
      gameId: gameId,
      gameOver: mineField.gameOn.gameOver,
      youWin: mineField.gameOn.youWin,
      board: mineField.board,
      gameOn: mineField.gameOn,
      rows: mineField.rows,
      cols: mineField.cols,
      flags: mineField.flags,
      t: mineField.time.t,
    });
    let gameDate = getCurrentDateTime();
    insertUserGame(
      mineField.id.game,
      mineField.id.user,
      gameDate,
      mineField.factor,
      mineField.time.t,
      mineField.gameOn.youWin,
      (err, results) => {
        if (err) {
          console.error("Failed to insert user game:", err);
        } else {
          console.log("Insert successful:", results);
        }
      }
    );

    return;
  }
  if (mineField.getCell(i, j).flagged) {
    return;
  }

  if (mineField.checkWin()) {
    mineField.gameOn.gameOver = true;
    mineField.gameOn.youWin = true;
    // HERE I will handle filling the DB in case of WIN //
    res.status(200).json({
      message: `YOU WIN!`,
      gameId: gameId,
      gameOver: mineField.gameOn.gameOver,
      youWin: mineField.gameOn.youWin,
      board: mineField.board,
      rows: mineField.rows,
      cols: mineField.cols,
      flags: mineField.flags,
      t: mineField.time.t,
    });
    let gameDate = getCurrentDateTime();
    insertUserGame(
      mineField.id.game,
      mineField.id.user,
      gameDate,
      mineField.factor,
      mineField.time.t,
      mineField.gameOn.youWin,
      (err, results) => {
        if (err) {
          console.error("Failed to insert user game:", err);
        } else {
          console.log("Insert successful:", results);
        }
      }
    );
    return;
  }

  mineField.revealMinesAroundMe(mineField, i, j);

  let pseudoBoard = pseudoizeBoard(mineField.board);

  res.status(200).json({
    message: `tapped square`,
    gameId: gameId,
    board: pseudoBoard,
    gameOn: mineField.gameOn,
    rows: mineField.rows,
    cols: mineField.cols,
    flags: mineField.flags,
    t: mineField.time.t,
  });
});

router.get("/place_flag", async (req, res) => {
  let { gameId, i, j } = req.query;
  i = parseInt(i);
  j = parseInt(j);
  if (!gameId || !games[gameId]) {
    return res.status(400).json({ message: "Invalid Game ID" });
  }

  const mineField = games[gameId];
  if (!mineField.gameOn.hasStarted) {
    mineField.startGame(i, j);
    for (let k = 0; k < mineField.rows; k++) {
      for (let l = 0; l < mineField.cols; l++) {
        mineField.getCell(k, l).neighborMineCount = mineField.getMineCount(
          k,
          l
        );
      }
    }
  }
  let message = " ";

  if (!mineField.getCell(i, j).flagged) {
    message = "placed flag";
  } else {
    message = "removed flag";
  }

  mineField.placeFlag(mineField, i, j);

  let pseudoBoard = pseudoizeBoard(mineField.board);

  res.status(200).json({
    message: message,
    gameId: gameId,
    board: pseudoBoard,
    gameOn: mineField.gameOn,
    rows: mineField.rows,
    cols: mineField.cols,
    flags: mineField.flags,
    t: mineField.time.t,
  });
});

async function fetchUserGames(res, userId) {
  try {
    const gameResults = await query(
      "SELECT date_of_occurrence, diff, duration, result FROM user_games WHERE user_id = ? ORDER BY date_of_occurrence DESC",
      [userId]
    );
    //console.log(gameResults);
    res.status(200).json({ message: "success", gameResults: gameResults });
  } catch (error) {
    console.error("Error fetching user games:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function validateIorJ(IorJ) {
  if (isNaN(IorJ)) {
    return false;
  }
  if (typeof IorJ != "number") {
    return false;
  }
  if (!Number.isInteger(IorJ)) {
    return false;
  }
  return true;
}

function pseudoizeBoard(board) {
  // console.log(board);
  let pseudoBoard = JSON.parse(JSON.stringify(board));

  for (let i = 0; i < board.length; i++) {
    if (!pseudoBoard[i].checked) {
      pseudoBoard[i].isMine = 0;
      pseudoBoard[i].neighborMineCount = 0;
    }
  }
  // console.log(pseudoBoard);

  return pseudoBoard;
}

function insertUserGame(
  gameId,
  userId,
  dateOfOccurrence,
  diff,
  duration,
  result,
  callback
) {
  const query = `
    INSERT INTO user_games (game_id, user_id, date_of_occurrence, diff, duration, result)
    VALUES (?, ?, ?, ?, ?, ?)`;

  pool.query(
    query,
    [gameId, userId, dateOfOccurrence, diff, duration, result],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        if (callback) callback(err, null);
        return;
      }
      console.log("Insert successful:", results);
      if (callback) callback(null, results);
    }
  );
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}`;
  return dateTimeString;
}

module.exports = router;
