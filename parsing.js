
function initParseModalButton() {
    document.getElementById('parse-modal').classList.remove("hidden");
    document.getElementById('parse-overlay').classList.remove("hidden");
}

function initGetParsedModalButton(parse_data_id) {
    // hides the parse-modal
    document.getElementById('parse-modal').classList.add("hidden");
    document.getElementById('parse-overlay').classList.add("hidden");

    // show the update tree modal
    document.getElementById('get-parsed-modal').classList.remove("hidden");
    document.getElementById('get-parsed-overlay').classList.remove("hidden");

    // set up button that sends a request to the backend to get the new trees
    closeButton = document.getElementById("get-parsed-btn");
    closeButton.textContent = 'View trees';
    closeButton.addEventListener('click', () => {
      document.getElementById('get-parsed-modal').classList.add("hidden");
      document.getElementById('get-parsed-overlay').classList.add("hidden");
      getParsedData(parse_data_id)
    });
}

function parseFile() {
    let textSentences = $("#treedata2").val();
    let parserType = $("#select-parser").val();

    if(parserType === "") {
        alert("Please select a parser");
        return;
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({"sentences": textSentences.split("\n"), "parserType": parserType});

    let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    fetch("https://mra9407.pythonanywhere.com/parse_data", requestOptions)
    .then(res => res.text())
    .then(data => {
        initGetParsedModalButton(data)
    })
    .catch(error => console.log('error', error));
    initParseModalButton();
}

// var readConfigFileForParsedSentences = async function () {
//     await readConfigFile();
// }

function getParsedData(parse_data_id) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`https://mra9407.pythonanywhere.com/get_parsed_data?data_id=${parse_data_id}`, requestOptions)
        .then(response => response.text())
        .then(data => {
            readConfigFile();
            // readConfigFileForParsedSentences();
            treesArray = convertToJSON(data);
            
            currentTreeIndex = 0;
            UndoRedoHelperOnTreePageSetUp();
            
            view([$(".upload")], hideComponents);
            addFilenameToHtmlElements('Untitled.conllx');
            getTree(treesArray[0]);

            isConlluLocal = true;

        })
        .catch(error => console.log('error', error));
    
    
    // fetch(`https://mra9407.pythonanywhere.com/get_parsed_data/?parsed_conll_file_id=${parse_data_id}`, {method: 'GET'})
    // .then(res => res.json())
    // .then(data => {
    //     file_data = data[0]['parsed_data'];
    //     treesArray = convertToJSON(file_data);
    //     // reinitialize trees
    //     // setupPageZero(file_data);
    //     // UndoRedoHelperOnTreePageSetUp();
    // // hide upload window
    //     view([$(".upload")], hideComponents);
    //     getTree(treesArray[0]);

        
    //     // sessionStorage.removeItem("treeData");
    //     // saveTree();
    //     // d3.select("body").select("svg").remove();
    //     // getTree(json_data);
    //     // update(root);
    //     // selectRoot();
    //     // showSelection();
    //     // // reset focusWindow
    //     // focusWindow = "";
    // });
    // // initParseModalButton();
}
