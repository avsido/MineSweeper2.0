let divMain;
let userData = {};
let currentGameId;

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
        greet("Hello " + userData.username);
        //alert("Hello " + userData.username);
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

function greet(helloMessage) {
  cleanElement(divMain);
  let hello = document.createElement("h2");
  hello.innerHTML = helloMessage;
  let pSelect = document.createElement("p");
  pSelect.innerHTML = "SELECT DIFFICULTY: ";
  const easyButton = createLevelButton("EASY"); // 0.85
  const mediumButton = createLevelButton("MEDIUM"); // 0.8
  const hardButton = createLevelButton("HARD"); // 0.7

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

function createLevelButton(text) {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.onclick = () => startGame(text);
  return button;
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
      // console.log(res);
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
