class MineField {
  constructor(factor) {
    // console.log(typeof factor);
    // console.log(factor);
    this.factor = factor;
    this.rows = null;
    this.cols = null;
    if (factor == 0.85) {
      this.rows = 8;
      this.cols = 10;
    } else if (factor == 0.8) {
      this.rows = 14;
      this.cols = 18;
    } else if (factor == 0.7) {
      this.rows = 20;
      this.cols = 44;
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.getCell(i, j).isMine = Math.random() > this.factor ? 1 : 0;
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
