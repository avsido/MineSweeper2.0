let divMain;
let userData = {};
let currentGameId;
let intervalId;

function logUser() {
  divMain = document.getElementById("divMain");
  divMain.className = "divMain";
  cleanElement(divMain);
  divMain.style.flexDirection = "column";
  let hello = document.createElement("h1");
  hello.className = "hello";
  hello.innerHTML = "Hello Guest!";
  let divInputsNButts = document.createElement("div");
  divInputsNButts.className = "divInputsNButts";
  const divInput = createDivInput();
  divInput.className = "input";
  const divButts = createDivButts();
  divButts.className = "input";
  divInputsNButts.append(hello, divInput, divButts);
  divMain.appendChild(divInputsNButts);
}

function createDivInput() {
  const divInput = document.createElement("div");
  divInput.className = "divInput";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "Username";
  usernameInput.onchange = () => (userData.username = usernameInput.value);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "Password";
  passwordInput.onchange = () => (userData.password = passwordInput.value);

  divInput.append(usernameInput, passwordInput);
  return divInput;
}

function createDivButts() {
  const divButts = document.createElement("div");
  divButts.className = "divButts";

  const registerButt = document.createElement("button");
  registerButt.innerHTML = "REGISTER";
  registerButt.onclick = registerUser;

  const or = document.createElement("p");
  or.className = "or";
  or.innerHTML = " OR ";

  const signinButt = document.createElement("button");
  signinButt.innerHTML = "SIGN IN";
  signinButt.onclick = signInUser;

  divButts.append(registerButt, or, signinButt);
  return divButts;
}

function registerUser() {
  fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.message !== "Registration successful") {
        //alert("Invalid info: " + res.message);
        logUser();
      } else {
        userData.userId = res.userId;
        greet(userData);
      }
    })
    .catch((error) => {
      // console.error("Error:", error);
      alert("An error occurred: " + error);
    });
}

function signInUser() {
  //console.log(userData);
  fetch("/api/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.message !== "success") {
        alert(res.message);
        logUser();
      } else {
        userData.userId = res.userId;
        greet(userData);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred");
    });
}

function greet(user) {
  cleanElement(divMain);
  requestPastGames(user.userId);
  let hello = document.createElement("h2");
  hello.innerHTML = "Hello " + user.username;
  let pSelect = document.createElement("p");
  pSelect.innerHTML = "SELECT DIFFICULTY: ";
  const easyButton = createLevelButton("EASY", user.userId); // 0.85
  const mediumButton = createLevelButton("MEDIUM", user.userId); // 0.8
  const hardButton = createLevelButton("HARD", user.userId); // 0.7

  const divButtonsDifficulty = document.createElement("div");
  divButtonsDifficulty.className = "divInputsNButts";
  divButtonsDifficulty.append(
    hello,
    pSelect,
    easyButton,
    mediumButton,
    hardButton
  );
  divMain.append(divButtonsDifficulty);
}

function createLevelButton(diff, userId) {
  const button = document.createElement("button");
  button.innerHTML = diff;
  button.onclick = () => startGame(diff, userId);
  return button;
}

function requestPastGames(userId) {
  const url = `/api/get_past_games?userId=${encodeURIComponent(userId)}`;

  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((res) => {
      if (res.message !== "success") {
        alert(res.message);
        logUser();
      } else if (res.gameResults.length > 0) showPastGames(res.gameResults);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred");
    });
}

function startGame(diff, userId) {
  cleanElement(divMain);

  const url = "/api/start_game?diff=" + diff + "&userId=" + userId;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((res) => {
      render(res);
      //console.log(res);
      let t = res.t;
      runTime(t);
      intervalId = setInterval(() => {
        t += 1;
        runTime(t);
      }, 1000);
    })
    .catch((error) => {
      alert("An error occurred: " + error);
    });
}

function tapSquare(currentGameId, i, j) {
  if (!currentGameId) {
    alert("No active game!");
    return;
  }
  const url = `/api/tap_square?gameId=${currentGameId}&i=${i}&j=${j}`;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((res) => {
      //console.log(res);
      render(res);
    })
    .catch((error) => {
      alert("An error occurred: " + error);
    });
}

function placeFlag(currentGameId, i, j) {
  if (!currentGameId) {
    alert("No active game!");
    return;
  }
  const url = `/api/place_flag?gameId=${currentGameId}&i=${i}&j=${j}`;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((res) => {
      //console.log(res);
      render(res);
    })
    .catch((error) => {
      alert("An error occurred: " + error);
    });
}

function runTime(t) {
  let clock = document.getElementById("clock");
  if (clock) {
    clock.innerHTML = "time: " + t + "s";
  }
}

function showPastGames(gamesInfo) {
  const divPastGames = document.getElementById("divPastGames");
  cleanElement(divPastGames);
  const header = document.createElement("h4");
  header.innerHTML = "YOUR GAMES HISTORY: ";
  let tableGames = document.createElement("table");
  let columns = [
    { title: "#" },
    { field: "date_of_occurrence", title: "Date & Time" },
    { field: "diff", title: "Difficulty" },
    { field: "duration", title: "Duration" },
    { field: "result", title: "Result" },
  ];
  let tr = document.createElement("tr");
  for (let i = 0; i < columns.length; i++) {
    let th = document.createElement("th");
    th.innerHTML = columns[i].title;
    tr.appendChild(th);
  }
  tableGames.appendChild(tr);
  for (let i = 0; i < gamesInfo.length; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < columns.length; j++) {
      let dataBit = gamesInfo[i][columns[j].field];
      let td = document.createElement("td");
      if (j == 0) {
        td.innerHTML = gamesInfo.length - i;
      } else if (j == 1) {
        dataBit = formatDateTime(dataBit);
        td.innerHTML = dataBit + "";
      } else if (j == 2) {
        switch (dataBit) {
          case "0.85":
            td.innerHTML = "Easy";
            break;
          case "0.8":
            td.innerHTML = "Medium";
            break;
          case "0.7":
            td.innerHTML = "Hard";
            break;
          default:
            td.innerHTML = " ";
        }
      } else if (j == 3) {
        dataBit = formatTime(dataBit);
        td.innerHTML = dataBit;
      } else if (j == 4) {
        let img = document.createElement("img");
        img.src = dataBit ? "images/won.png" : "images/lost.png";
        td.appendChild(img);
      }

      tr.appendChild(td);
    }
    tableGames.appendChild(tr);
  }
  divPastGames.append(header, tableGames);
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? String(hours).padStart(2, "0") + ":" : "";
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Determine the time unit (hours or minutes)
  const unit = hours > 0 ? "h" : "m";

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}${unit}`;
}
