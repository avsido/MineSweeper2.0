function render(gameState) {
  // console.log(gameState.mineField);
  cleanElement(divMain);
  console.log(gameState);
  let currentGameId = gameState.gameId;
  let gameOver = gameState.gameOn.gameOver;
  let youWin = gameState.gameOn.youWin;
  let cols = gameState.cols;
  let rows = gameState.rows;
  let flags = gameState.flags;
  let board = gameState.board;

  let divHeader = document.createElement("div");
  divHeader.className = "header";
  divHeader.id = "divHeader";
  let clock = document.createElement("p");
  clock.style.minWidth = "80px";
  clock.id = "clock";

  let smileyFace = document.createElement("img");
  smileyFace.src = "images/happy.png";
  let pFlags = document.createElement("p");
  pFlags.innerHTML = "flags: " + flags;
  divHeader.append(clock, smileyFace, pFlags);
  divMain.appendChild(divHeader);

  let divBoard = document.createElement("div");
  divBoard.className = "divBoard";
  for (let i = 0; i < rows; i++) {
    let divRow = document.createElement("div");
    divBoard.appendChild(divRow);
    divRow.className = "divRow";
    for (let j = 0; j < cols; j++) {
      let currentCell = board[i * cols + j];
      let cell = document.createElement("div");
      cell.className = "cell";
      cell.innerHTML =
        currentCell.isMine == 0 && currentCell.neighborMineCount > 0
          ? currentCell.neighborMineCount + ""
          : "";
      switch (currentCell.neighborMineCount) {
        case 1:
          cell.style.color = "blue";
          break;
        case 2:
          cell.style.color = "green";
          break;
        case 3:
          cell.style.color = "red";
          break;
        case 4:
          cell.style.color = "gold";
          break;
        case 5:
          cell.style.color = "orange";
          break;
        case 6:
          cell.style.color = "black";
          break;
        case 7:
          cell.style.color = "white";
          break;
      }
      divRow.appendChild(cell);

      if (currentCell.checked) {
        cell.style.backgroundColor =
          i == j || (i + j) % 2 == 0 ? "beige" : "lightgreen";
      } else {
        cell.style.backgroundColor =
          i == j || (i + j) % 2 == 0 ? "pink" : "coral";
        cell.onmouseover = (ev) => {
          ev.target.style.backgroundColor = "#96ca51";
        };
        cell.onmouseout = (ev) => {
          ev.target.style.backgroundColor =
            i == j || (i + j) % 2 == 0 ? "pink" : "coral";
        };
      }
      if (!gameOver && !currentCell.flagged) {
        cell.classList.add(); //////////////////////////////////////////////////////////////////////////////
      }
      if (currentCell.flagged) {
        let imgFlag = document.createElement("img");
        imgFlag.src = "images/flag.png";
        cell.appendChild(imgFlag);
      }

      if (
        gameOver &&
        !youWin &&
        currentCell.isMine == 1 &&
        !currentCell.flagged
      ) {
        let imgMine = document.createElement("img");
        imgMine.src = "images/bomb.png";
        cell.appendChild(imgMine);
      }

      if (!gameOver) {
        cell.onclick = (ev) => {
          tapSquare(currentGameId, i, j);
          ev.target.style.pointerEvents = "none";

          setTimeout(() => {
            ev.target.style.pointerEvents = "auto";
          }, 10);
        };
        cell.oncontextmenu = (ev) => {
          ev.preventDefault();
          placeFlag(currentGameId, i, j);
          ev.target.style.pointerEvents = "none";

          setTimeout(() => {
            ev.target.style.pointerEvents = "auto";
          }, 10);
        };
      }
    }
  }
  if (gameOver) {
    let cells = divBoard.getElementsByClassName("cell");
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.pointerEvents = "none";
    }
    //console.log(cells);
    smileyFace.src = "images/sad.png";
    let divConclude = document.createElement("div");
    divConclude.className = "divConclude";
    let pMessage = document.createElement("p");
    pMessage.innerHTML = gameState.message;
    //let pTime = document.createElement("p");
    //pTime.innerHTML = "Your time is: " + t;
    let buttReturn = document.createElement("button");
    buttReturn.innerHTML = "RETURN";
    buttReturn.className = "buttReturn";
    buttReturn.onclick = () => {
      greet("Hello " + userData.username);
    };
    divConclude.append(pMessage, buttReturn);
    divMain.appendChild(divConclude);
  }
  divMain.appendChild(divBoard);
}
