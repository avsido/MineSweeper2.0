function drawBoldBorder(cell, board, i, j, rows, cols) {
  const borderColor = "#6c1c1c";
  let boxShadow = "";

  // Top
  if (i > 0 && !board[(i - 1) * cols + j].checked) {
    boxShadow += "0px -3px 0px 0px " + borderColor + ",";
  }

  // Bottom
  if (i < rows - 1 && !board[(i + 1) * cols + j].checked) {
    boxShadow += "0px 3px 0px 0px " + borderColor + ",";
  }

  // Left
  if (j > 0 && !board[i * cols + (j - 1)].checked) {
    boxShadow += "-3px 0px 0px 0px " + borderColor + ",";
  }

  // Right
  if (j < cols - 1 && !board[i * cols + (j + 1)].checked) {
    boxShadow += "3px 0px 0px 0px " + borderColor + ",";
  }

  cell.style.boxShadow = boxShadow.slice(0, -1);
}

function cleanElement(element) {
  for (let i = element.children.length - 1; i >= 0; i--) {
    const child = element.children[i];

    if (child.id !== "clock") {
      element.removeChild(child);
    }
  }
}
