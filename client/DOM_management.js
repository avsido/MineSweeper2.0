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
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred");
    });
}

function startGame(factor) {
  cleanElement(divMain);
  const url = `/api/start_game?factor=${encodeURIComponent(factor)}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((res) => {
      currentGameId = res.gameId; // Store the gameId
      render(res);
    })
    .catch((error) => {
      alert("An error occurred: " + error);
    });
}

function greet() {
  cleanElement(divMain);

  const easyButton = createLevelButton("EASY", 0.85);
  const mediumButton = createLevelButton("MEDIUM", 0.8);
  const hardButton = createLevelButton("HARD", 0.7);

  divMain.append(easyButton, mediumButton, hardButton);
}

function createLevelButton(text, factor) {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.onclick = () => requestToStartGame(factor);
  return button;
}

function requestToStartGame(factor) {
  startGame(factor);
}

function tapSquare(x, y) {
  if (!currentGameId) {
    alert("No active game!");
    return;
  }

  const url = `/api/tap_square?gameId=${currentGameId}&x=${x}&y=${y}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((res) => {
      // Handle the result (update UI, etc.)
      console.log(res);
    })
    .catch((error) => {
      alert("An error occurred: " + error);
    });
}

// Add this function if it's not already defined elsewhere
function cleanElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Add this function if it's not already defined elsewhere
function render(gameState) {
  // Implement this function to render the game state
  console.log("Rendering game state:", gameState);
  // You'll need to create the game board UI here based on the gameState
}
