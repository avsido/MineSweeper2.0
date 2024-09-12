const MineField = require("./MineField.js");
const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const router = express.Router();
const games = {};
const loggedInUsers = {};

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
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password?" });
    return;
  }

  try {
    const users = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length > 0) {
      res.status(400).json({ message: "Username already taken" });
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
    if (loggedInUsers[userId[0].id]) {
      res.status(400).json({ message: "User already logged in" });
      return;
    }
    loggedInUsers[userId[0].id] = true;
    req.session.userId = userId[0].id;
    req.session.loggedIn = true;
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password?" });
    return;
  }

  try {
    const users = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length == 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // console.log(loggedInUsers);

    const user = users[0];
    if (loggedInUsers[user.id]) {
      res.status(400).json({ message: "User already signed in" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      loggedInUsers[user.id] = true;
      req.session.userId = user.id;
      req.session.loggedIn = true;

      res.status(200).json({ message: "success" });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.get("/get_past_games", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }
  fetchUserGames(res, req);
});

router.get("/start_game", async (req, res) => {
  const diff = req.query.diff;
  const userId = req.session.userId;

  if (!userId) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }
  if (typeof diff != "string") {
    console.log("invalid diffic");
    return;
  }

  let factor;

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
    games[gameId] = mineField;
    req.session.gameId = gameId;

    res.status(200).json({
      message: `Game started with difficulty factor: ${factor}`,
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
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.get("/tap_square", async (req, res) => {
  let { i, j } = req.query;
  const gameId = req.session.gameId;
  const userId = req.session.userId;

  if (!gameId || !games[gameId]) {
    res.status(400).json({ message: "Invalid game" });
    return;
  }

  i = parseInt(i);
  j = parseInt(j);

  if (!validateIorJ(i) || !validateIorJ(j)) {
    res.status(200).json({ message: "invalid cell row or column" });

    return;
  }

  const mineField = games[gameId];

  if (mineField.getCell(i, j).isMine == 1) {
    setLose(res, req, mineField);
    return;
  }
  if (mineField.getCell(i, j).flagged) {
    return;
  }

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

  mineField.revealMinesAroundMe(mineField, i, j);

  if (mineField.checkWin()) {
    setWin(res, req, mineField);
    return;
  }

  let pseudoBoard = pseudoizeBoard(mineField.board);

  res.status(200).json({
    message: `tapped square`,
    board: pseudoBoard,
    gameOn: mineField.gameOn,
    rows: mineField.rows,
    cols: mineField.cols,
    flags: mineField.flags,
    t: mineField.time.t,
  });
});

router.get("/place_flag", async (req, res) => {
  let { i, j } = req.query;
  const gameId = req.session.gameId;

  i = parseInt(i);
  j = parseInt(j);

  if (!gameId || !games[gameId]) {
    res.status(400).json({ message: "Invalid Game" });
    return;
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

  if (mineField.checkWin()) {
    setWin(res, req, mineField);
    return;
  }

  let pseudoBoard = pseudoizeBoard(mineField.board);

  res.status(200).json({
    message: message,
    board: pseudoBoard,
    gameOn: mineField.gameOn,
    rows: mineField.rows,
    cols: mineField.cols,
    flags: mineField.flags,
    t: mineField.time.t,
  });
});

router.post("/user_quit_game", async (req, res) => {
  try {
    const gameId = req.session.gameId;
    const userId = req.session.userId;
    if (!gameId || !games[gameId]) {
      res.status(400).json({ message: "Invalid game" });
      return;
    }

    const mineField = games[gameId];
    mineField.gameOn.gameOver = true;
    const currentTime = new Date().getTime();
    const t = Math.floor((currentTime - mineField.time.startTime) / 1000);
    mineField.time.t = t;

    if (mineField.gameOn.hasStarted) {
      await new Promise((resolve, reject) => {
        insertUserGame(
          gameId,
          userId,
          getCurrentDateTime(),
          mineField.factor,
          mineField.time.t,
          mineField.gameOn.youWin,
          (err, results) => {
            if (err) {
              console.log("Failed to insert user game:", err);
              reject(err);
            } else {
              console.log("Insert successful:", results);
              resolve(results);
            }
          }
        );
      });
    }
    deleteGame(gameId);
    res.status(200).json({
      message: `quit`,
    });
  } catch (error) {
    //console.log("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.post("/user_left_game_lost", async (req, res) => {
  try {
    const gameId = req.session.gameId;
    const userId = req.session.userId;

    if (!gameId || !games[gameId]) {
      res.status(400).json({ message: "Invalid game" });
      return;
    }
    const mineField = games[gameId];
    mineField.gameOn.gameOver = true;

    const currentTime = new Date().getTime();
    const t = Math.floor((currentTime - mineField.time.startTime) / 1000);
    mineField.time.t = t;

    if (mineField.gameOn.hasStarted) {
      await new Promise((resolve, reject) => {
        insertUserGame(
          gameId,
          userId,
          getCurrentDateTime(),
          mineField.factor,
          mineField.time.t,
          mineField.gameOn.youWin,
          (err, results) => {
            if (err) {
              console.log("Failed to insert user game:", err);
              reject(err);
            } else {
              console.log("Insert successful:", results);
              resolve(results);
            }
          }
        );
      });
    }

    deleteGame(gameId);
    deleteUser(userId);

    const gameOverResponse = {
      message: `GAME OVER!`,
      gameOver: mineField.gameOn.gameOver,
      youWin: mineField.gameOn.youWin,
      board: mineField.board,
      gameOn: mineField.gameOn,
      rows: mineField.rows,
      cols: mineField.cols,
      flags: mineField.flags,
      t: mineField.time.t,
    };

    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Log out failed" });
        return;
      }

      res.status(200).json({
        ...gameOverResponse,
        message: `GAME OVER! Logout successful.`,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  const gameId = req.session.gameId;
  const userId = req.session.userId;
  console.log("gameId (logout)", typeof gameId);
  console.log("userId (logout)", typeof userId);

  try {
    const mineField = games[gameId];
    //console.log("MineField object:", mineField);

    if (mineField) {
      if (mineField.gameOn.hasStarted && !mineField.gameOn.gameOver) {
        setLose(res, req, mineField);
        return;
      }
    }

    console.log("Before deleting game and user:", loggedInUsers);
    deleteGame(gameId);
    deleteUser(userId);
    console.log("After deleting game and user:", loggedInUsers);

    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
        res.status(500).json({ message: "Log out failed" });
        return;
      }

      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.log("Catch block error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

//benine:
async function fetchUserGames(res, req) {
  const userId = req.session.userId;
  try {
    const gameResults = await query(
      "SELECT date_of_occurrence, diff, duration, result FROM user_games WHERE user_id = ? ORDER BY date_of_occurrence DESC",
      [userId]
    );
    res.status(200).json({ message: "success", gameResults: gameResults });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
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
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    date_of_occurrence = VALUES(date_of_occurrence),
    diff = VALUES(diff),
    duration = VALUES(duration),
    result = VALUES(result)`;

  pool.query(
    query,
    [gameId, userId, dateOfOccurrence, diff, duration, result],
    (err, results) => {
      if (err) {
        if (callback) callback(err, null);
        return;
      }
      if (callback) callback(null, results);
    }
  );
}

function setWin(res, req, mineField) {
  const gameId = req.session.gameId;
  const userId = req.session.userId;
  const currentTime = new Date().getTime();
  const t = Math.floor((currentTime - mineField.time.startTime) / 1000);
  mineField.time.t = t;
  mineField.gameOn.gameOver = true;
  mineField.gameOn.youWin = true;
  res.status(200).json({
    message: `YOU WIN!`,
    gameOn: mineField.gameOn,
    board: mineField.board,
    rows: mineField.rows,
    cols: mineField.cols,
    flags: mineField.flags,
    t: mineField.time.t,
  });
  let gameDate = getCurrentDateTime();
  insertUserGame(
    gameId,
    userId,
    gameDate,
    mineField.factor,
    mineField.time.t,
    mineField.gameOn.youWin,
    (err, results) => {
      if (err) {
        console.error("Failed to insert user game:", err);
      } else {
        //console.log("Insert successfullll:", results);
        console.log("Insert successfullll");
      }
    }
  );
  deleteGame(gameId);
}

function setLose(res, req, mineField) {
  const gameId = req.session.gameId;
  const userId = req.session.userId;
  const currentTime = new Date().getTime();
  const t = Math.floor((currentTime - mineField.time.startTime) / 1000);
  mineField.time.t = t;
  mineField.gameOn.gameOver = true;
  res.status(200).json({
    message: `GAME OVER!`,
    gameOn: mineField.gameOn,
    board: mineField.board,
    rows: mineField.rows,
    cols: mineField.cols,
    flags: mineField.flags,
    t: mineField.time.t,
  });
  let gameDate = getCurrentDateTime();
  insertUserGame(
    gameId,
    userId,
    gameDate,
    mineField.factor,
    mineField.time.t,
    mineField.gameOn.youWin,
    (err, results) => {
      if (err) {
        console.error("Failed to insert user game:", err);
      } else {
        //console.log("Insert successfullll:", results);
        console.log("Insert successfullll");
      }
    }
  );
  deleteGame(gameId);
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

function pseudoizeBoard(board) {
  let pseudoBoard = JSON.parse(JSON.stringify(board));

  for (let i = 0; i < board.length; i++) {
    if (!pseudoBoard[i].checked) {
      pseudoBoard[i].isMine = 0;
      pseudoBoard[i].neighborMineCount = 0;
    }
  }

  return pseudoBoard;
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

function deleteGame(gameId) {
  if (games.hasOwnProperty(gameId)) {
    delete games[gameId];
    console.log("deleted game: " + gameId);
  }
}

function deleteUser(userId) {
  if (loggedInUsers.hasOwnProperty(userId)) {
    delete loggedInUsers[userId];
    console.log("deleted user: " + userId);
  }
}

module.exports = router;
