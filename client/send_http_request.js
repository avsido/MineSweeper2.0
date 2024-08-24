// GET request as taught in school
function sendHttpGETReq(url, callback) {
  let httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        callback(this.responseText);
      }
    }
  };
  httpRequest.open("GET", url, true);
  httpRequest.send();
}
