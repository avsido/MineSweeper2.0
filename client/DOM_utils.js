// function cleanElement(element) {
//   // empties DOM element of all children

//   while (element.lastElementChild) {
//     element.removeChild(element.lastElementChild);
//   }
// }

function cleanElement(element) {
  for (let i = element.children.length - 1; i >= 0; i--) {
    const child = element.children[i];

    if (child.id !== "clock") {
      element.removeChild(child);
    }
  }
}

function removeElementByQuery(name, element = document.body) {
  // checks if element exists as child in element and if so, removes it (default parent element: docoument.body)
  let selector = name;

  if (!name.startsWith("#") && !name.startsWith(".")) {
    selector = `#${name}`;
  }

  let elementToRemove = element.querySelector(selector);

  if (elementToRemove) {
    elementToRemove.parentNode.removeChild(elementToRemove);
  }
}

function emptyArray(arr) {
  while (arr.length > 0) {
    arr.pop();
  }
}

// takes element id and time factor (ms) and delays the element's load for the time passed to the func
function showDivAfterDelay(elementId, delay) {
  console.log("inside showDivAfterDelay");
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  element.style.display = "none";

  setTimeout(function () {
    element.style.display = "block";
  }, delay);
}
