function render(gameState) {
  console.log(gameState.mineField);
  cleanElement(divMain);
  let gameOn = gameState.mineField.gameOn;
  let cols = gameState.mineField.cols;
  let rows = gameState.mineField.rows;
  let flags = gameState.mineField.flags;
  let divHeader = document.createElement("div");
  divHeader.className = "header";
  let pTime = document.createElement("p");
  pTime.innerHTML = 0;
  let smileyFace = document.createElement("img");
  smileyFace.src = "images/happy.png";
  let pFlags = document.createElement("p");
  pFlags.innerHTML = flags;
  divHeader.append(pTime, smileyFace, pFlags);
  divMain.appendChild(divHeader);

  let divBoard = document.createElement("div");
  divBoard.className = "divBoard";
  for (let i = 0; i < rows; i++) {
    let divRow = document.createElement("div");
    divRow.className = "divRow";
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      cell.style.backgroundColor =
        i == j || (i + j) % 2 == 0
          ? "rgb(180, 225, 205)"
          : "rgb(225, 225, 160)";
      cell.onclick = (ev) => {
        tapSquare(currentGameId, i, j);
      };
      cell.oncontextmenu = (ev) => {
        ev.preventDefault();
      };
      divRow.appendChild(cell);
      divBoard.appendChild(divRow);
    }
  }
  divMain.appendChild(divBoard);
}
