let divMain;
let userData = {};
let currentGameId;

function logUser() {
  divMain = document.getElementById("divMain");
  divMain.className = "divMain";
  cleanElement(divMain);
  divMain.style.flexDirection = "column";

  const divInput = createDivInput();
  const divButts = createDivButts();

  divMain.append(divInput, divButts);
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

  const signinButt = document.createElement("button");
  signinButt.innerHTML = "SIGN IN";
  signinButt.onclick = signInUser;

  divButts.append(registerButt, signinButt);
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
        alert("Invalid info: " + res.message);
        logUser();
      } else {
        greet();
        alert("Hello " + userData.username);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred");
    });
}

function signInUser() {
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
        greet();
        alert("Hello " + userData.username);
        if (res.gameResults && res.gameResults.length > 0) {
          console.log(res.gameResults);
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred");
    });
}

function startGame(text) {
  cleanElement(divMain);
  const url = "/api/start_game?text=" + text;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((res) => {
      currentGameId = res.gameId;
      console.log(res);
      render(res);
    })
    .catch((error) => {
      alert("An error occurred: " + error);
    });
}

function greet() {
  cleanElement(divMain);

  const easyButton = createLevelButton("easy"); // 0.85
  const mediumButton = createLevelButton("medium"); // 0.8
  const hardButton = createLevelButton("hard"); // 0.7

  divMain.append(easyButton, mediumButton, hardButton);
}

function createLevelButton(text) {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.onclick = () => requestToStartGame(text);
  return button;
}

function requestToStartGame(text) {
  startGame(text);
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
      console.log(res);
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
