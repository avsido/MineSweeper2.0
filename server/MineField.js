class MineField {
  constructor(factor) {
    this.gameOn = false;
    this.factor = factor;
    this.rows = null;
    this.cols = null;
    if (factor == 0.85) {
      this.rows = 8;
      this.cols = 10;
      this.flags = 10;
    } else if (factor == 0.8) {
      this.rows = 14;
      this.cols = 18;
      this.flags = 44;
    } else if (factor == 0.7) {
      this.rows = 20;
      this.cols = 44;
      this.flags = 90;
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
    //this.startGame();
  }

  startGame() {
    this.gameOn = true;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.abs(i - x) >= 2 || Math.abs(j - y) >= 2) {
          this.getCell(i, j).isMine =
            Math.random() > this.factor ? true : false;
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
}

module.exports = MineField;
