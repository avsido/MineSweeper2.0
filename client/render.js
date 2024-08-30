function render(gameState) {
  // console.log(gameState.mineField);
  cleanElement(divMain);
  // console.log(gameState);
  // console.log("gameOn:", gameState.mineField?.gameOn);
  // let gameOn = gameState.gameOn;
  let cols = gameState.cols;
  let rows = gameState.rows;
  let flags = gameState.flags;
  let board = gameState.board;

  let divHeader = document.createElement("div");
  divHeader.className = "header";
  let pTime = document.createElement("p");
  pTime.innerHTML = 0;
  let smileyFace = document.createElement("img");
  smileyFace.src = "images/happy.png";
  let pFlags = document.createElement("p");
  pFlags.innerHTML = flags + " ";
  divHeader.append(pTime, smileyFace, pFlags);
  divMain.appendChild(divHeader);

  let divBoard = document.createElement("div");
  divBoard.className = "divBoard";
  for (let i = 0; i < rows; i++) {
    let divRow = document.createElement("div");
    divRow.className = "divRow";
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("div");

      //cell.innerHTML = board[i * cols + j].isMine;
      cell.className = "cell";

      if (board[i * cols + j].isMine == 0 && board[i * cols + j].checked) {
        cell.style.backgroundColor =
          i == j || (i + j) % 2 == 0 ? "beige" : "lightgreen";
        cell.innerHTML = board[i * cols + j].neighborMineCount + "";
      } else {
        cell.style.backgroundColor =
          i == j || (i + j) % 2 == 0 ? "pink" : "coral";
      }
      cell.onclick = (ev) => {
        tapSquare(currentGameId, i, j);
      };
      cell.oncontextmenu = (ev) => {
        ev.preventDefault();
        placeFlag(currentGameId, i, j);
      };
      if (board[i * cols + j].flagged) {
        let imgFlag = document.createElement("img");
        imgFlag.src = "images/flag.png";
        cell.appendChild(imgFlag);
      }

      divRow.appendChild(cell);
      divBoard.appendChild(divRow);
    }
  }
  divMain.appendChild(divBoard);
}
