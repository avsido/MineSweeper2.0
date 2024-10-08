class MineField {
  constructor(factor) {
    this.gameOn = { hasStarted: false, gameOver: false, youWin: false };
    this.time = { t: 0, hasStarted: false, startTime: null };
    this.factor = factor;
    this.rows = null;
    this.cols = null;
    this.flags = 0;
    if (factor == 0.85) {
      //easy
      this.rows = 8;
      this.cols = 10;
    } else if (factor == 0.8) {
      //medium
      this.rows = 10;
      this.cols = 10;
    } else if (factor == 0.7) {
      //hard
      this.rows = 12;
      this.cols = 14;
    }

    this.board = [];
    let cellNumber = this.rows * this.cols;
    for (let i = 0; i < cellNumber; i++) {
      this.board.push({
        isMine: 0,
        checked: false,
        flagged: false,
        neighborMineCount: 0,
      });
    }
    this.resetGame();
  }

  startGame(x, y) {
    this.gameOn.hasStarted = true;
    this.time.hasStarted = true;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.abs(i - x) >= 2 || Math.abs(j - y) >= 2) {
          if (Math.random() > this.factor) {
            this.getCell(i, j).isMine = 1;
            this.flags += 1;
          }
        }
      }
    }
  }

  getCell(row, col) {
    return this.board[row * this.cols + col];
  }

  resetGame() {
    let cellNumber = this.rows * this.cols;
    for (let i = 0; i < cellNumber; i++) {
      this.board[i].isMine = 0;
      this.board[i].checked = false;
      this.board[i].flagged = false;
      this.board[i].neighborMineCount = 0;
    }
  }

  getMineCount(i, j) {
    // counts neighbor mines to be stored in mineField.getCell(i, j - 1).neighborMineCount.
    let mines = 0;
    let rows = this.rows;
    let cols = this.cols;

    if (j > 0) mines += this.getCell(i, j - 1).isMine; // middle left
    if (j < cols - 1) mines += this.getCell(i, j + 1).isMine; // middle right
    if (i > 0) mines += this.getCell(i - 1, j).isMine; // middle top
    if (i < rows - 1) mines += this.getCell(i + 1, j).isMine; // middle bottom
    if (i > 0 && j > 0) mines += this.getCell(i - 1, j - 1).isMine; // top left
    if (i < rows - 1 && j < cols - 1)
      mines += this.getCell(i + 1, j + 1).isMine; // bottom right
    if (i > 0 && j < cols - 1) mines += this.getCell(i - 1, j + 1).isMine; // top right
    if (j > 0 && i < rows - 1) mines += this.getCell(i + 1, j - 1).isMine; // bottom left
    return mines;
  }

  revealMinesAroundMe(mineField, i, j) {
    let rows = mineField.rows;
    let cols = mineField.cols;
    if (mineField.getCell(i, j).checked) return;
    if (!mineField.getCell(i, j).flagged)
      mineField.getCell(i, j).checked = true;
    if (
      mineField.getCell(i, j).neighborMineCount > 0 ||
      !mineField.shouldBeRevealed(mineField, i, j)
    )
      return;
    if (i > 0 && j > 0) mineField.revealMinesAroundMe(mineField, i - 1, j - 1);
    if (i > 0) mineField.revealMinesAroundMe(mineField, i - 1, j);
    if (i > 0 && j < cols - 1)
      mineField.revealMinesAroundMe(mineField, i - 1, j + 1);
    if (j < cols - 1) mineField.revealMinesAroundMe(mineField, i, j + 1);
    if (i < rows - 1 && j < cols - 1)
      mineField.revealMinesAroundMe(mineField, i + 1, j + 1);
    if (i < rows - 1) mineField.revealMinesAroundMe(mineField, i + 1, j);
    if (j > 0) mineField.revealMinesAroundMe(mineField, i, j - 1);
    if (i < rows - 1 && j > 0)
      mineField.revealMinesAroundMe(mineField, i + 1, j - 1);
  }

  shouldBeRevealed(mineField, i, j) {
    let rows = mineField.rows;
    let cols = mineField.cols;

    // decides how much further cells to reveal.
    if (
      i > 0 &&
      j > 0 &&
      mineField.getCell(i - 1, j - 1).neighborMineCount == 0
    )
      return true;
    if (i > 0 && mineField.getCell(i - 1, j).neighborMineCount == 0)
      return true;
    if (
      i > 0 &&
      j < cols - 1 &&
      mineField.getCell(i - 1, j + 1).neighborMineCount == 0
    )
      return true;
    if (j < cols - 1 && mineField.getCell(i, j + 1).neighborMineCount == 0)
      return true;
    if (
      i < rows - 1 &&
      j < cols - 1 &&
      mineField.getCell(i + 1, j + 1).neighborMineCount == 0
    )
      return true;
    if (i < rows - 1 && mineField.getCell(i + 1, j).neighborMineCount == 0)
      return true;
    if (j > 0 && mineField.getCell(i, j - 1).neighborMineCount == 0)
      return true;
    if (
      i < rows - 1 &&
      j > 0 &&
      mineField.getCell(i + 1, j - 1).neighborMineCount == 0
    )
      return true;
  }

  placeFlag(mineField, i, j) {
    if (mineField.getCell(i, j).flagged) {
      // remove flag

      mineField.getCell(i, j).flagged = false;
      mineField.flags += 1;
    } else {
      //add flag
      if (mineField.flags == 0 || mineField.getCell(i, j).checked) return;

      mineField.getCell(i, j).flagged = true;
      mineField.flags -= 1;
    }
  }

  checkWin() {
    for (let square of this.board) {
      if (square.isMine === 1 && !square.flagged) {
        return false;
      }
      if (square.isMine === 0 && !square.checked) {
        return false;
      }
    }
    return true;
  }
}

module.exports = MineField;
