function render(gameState) {
  let gameOver = gameState.gameOn.gameOver;
  let cols = gameState.cols;
  let rows = gameState.rows;
  let flags = gameState.flags;
  let board = gameState.board;
  let youWin = gameState.gameOn.youWin;
  let t = gameState.t;

  let divHeader = document.createElement("div");
  divHeader.className = "header";
  divHeader.id = "divHeader";
  let clock = document.createElement("p");
  clock.style.minWidth = "80px";
  clock.style.zIndex = 1;
  clock.id = "clock";

  let smileyFace = document.createElement("img");
  smileyFace.id = "smileyFace";
  smileyFace.src = "images/happy.png";
  let pFlags = document.createElement("p");
  pFlags.id = "pFlags";
  if (!gameState.gameOn.hasStarted) {
    divHeader.append(clock, smileyFace, pFlags);
    divMain.appendChild(divHeader);
  }
  document.getElementById("pFlags").innerHTML = "flags: " + flags;
  let divBoard = document.createElement("div");

  divBoard.className = "divBoard";
  divBoard.id = "board";
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
          i == j || (i + j) % 2 == 0
            ? "rgba(255, 192, 203, 0.5)"
            : "rgba(255, 127, 80, 0.5)";
        cell.onmouseover = (ev) => {
          if (!currentCell.flagged) {
            ev.target.style.backgroundColor = "red";
          }
        };
        cell.onmouseout = (ev) => {
          ev.target.style.backgroundColor =
            i == j || (i + j) % 2 == 0
              ? "rgba(255, 192, 203, 0.5)"
              : "rgba(255, 127, 80, 0.5)";
        };
      }

      if (!gameOver) {
        cell.onclick = (ev) => {
          tapSquare(i, j);
          ev.target.style.pointerEvents = "none";

          setTimeout(() => {
            ev.target.style.pointerEvents = "auto";
          }, 10);
        };
        cell.oncontextmenu = (ev) => {
          ev.preventDefault();
          placeFlag(i, j);
          ev.target.style.pointerEvents = "none";

          setTimeout(() => {
            ev.target.style.pointerEvents = "auto";
          }, 10);
        };
      }
      if (currentCell.flagged) {
        let imgFlag = document.createElement("img");
        imgFlag.src = "images/flag3.png";
        imgFlag.style.backgroundColor = "";
        imgFlag.style.zIndex = -1;
        cell.appendChild(imgFlag);
        cell.onclick = () => {};
      } else {
        if (currentCell.isMine == 1) {
          let imgMine = document.createElement("img");
          imgMine.src = "images/bomb.png";
          cell.appendChild(imgMine);
        }
      }
    }
  }
  if (gameOver) {
    clearInterval(intervalId);
    let cells = divBoard.getElementsByClassName("cell");
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.pointerEvents = "none";
      cells[i].onclick = () => {};
      cells[i].oncontextmenu = () => {};
    }
    document.getElementById("smileyFace").src = youWin
      ? "images/happy.png"
      : "images/sad.png";
    let tempTime = document.getElementById("clock").innerHTML;
    document.getElementById("clock").innerHTML = tempTime;
    let divConclude = document.createElement("div");
    divConclude.className = "divConclude";
    let pMessage = document.createElement("p");
    pMessage.innerHTML = gameState.message;
    let pTime = document.createElement("p");
    pTime.innerHTML = "Your time is: " + t + "s";
    let buttReturn = document.createElement("button");
    buttReturn.innerHTML = "RETURN";
    buttReturn.className = "buttReturn";
    buttReturn.onclick = () => {
      greet(userData.username);
    };
    divConclude.append(pMessage, pTime, buttReturn);
    divMain.appendChild(divConclude);
  }

  const existingBoard = document.getElementById("board");
  if (existingBoard && divMain.contains(existingBoard)) {
    divMain.removeChild(existingBoard);
  }

  let quitButt = document.createElement("button");
  quitButt.innerHTML = "QUIT";
  quitButt.id = "quitButt";
  quitButt.className = "gameButt";
  quitButt.onclick = () => {
    userQuit();
    return;
  };
  divMain.appendChild(divBoard);

  const existingQuitButt = document.getElementById("quitButt");
  if (existingQuitButt && divMain.contains(existingQuitButt)) {
    divMain.removeChild(existingQuitButt);
  }
  divMain.appendChild(quitButt);
}
