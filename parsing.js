
function initCloseModalButton() {
    closeButton = document.getElementById("parse-close-btn");
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
      document.getElementById('parse-modal').classList.add("hidden");
      document.getElementById('parse-overlay').classList.add("hidden");
    });
  }

function parseFile(fileData) {
    console.log(fileData);
    fetch("http://localhost:8000/camel_tools_parser/", {method: 'POST', body: fileData})
    .then(res => {
        x = res.json()
        console.log(x)
    });

    document.getElementById('parse-modal').classList.remove("hidden");
    document.getElementById('parse-overlay').classList.remove("hidden");
    initCloseModalButton();
        // .then(res => res.json())
        // .then(data => {
        //     console.log(data);
        // });
}