let gapiPickerInited = false;
let gapiClientInited = false;
let gisInited = false;
// set this to the right server origin when pushed to Github
const SERVER_ORIGIN = "https://camel-parser.abudhabi.nyu.edu/api";
let tokenClient;
let pickedFile;
let fileId;

/**
 * Callback after api script is loaded.
 */
function gapiLoaded(libraryName, callback) {
  gapi.load(libraryName, callback);
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  axios
    .get(`${SERVER_ORIGIN}/get_gis_credentials`)
    .then((rsp) => {
      let credentials = rsp.data;
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: credentials.client_id,
        scope: credentials.scope.join(' '),
        callback: "", // defined later
      });
      gisInited = true;
      maybeEnableAuthButton();
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * Callback after the API client is loaded.
 */
function initializeGapiClient() {
  axios
    .get(`${SERVER_ORIGIN}/get_gapi_credentials`)
    .then((rsp) => {
      let credentials = rsp.data;
      gapi.client
        .init({
          apiKey: credentials.apiKey,
          discoveryDocs: credentials.discoveryDocs,
        })
        .then(() => {
          gapiClientInited = true;
          maybeEnableAuthButton();
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

function initializeGapiPicker() {
  gapiPickerInited = true;
}

function showPicker(accessToken, callback) {
  axios
    .get(`${SERVER_ORIGIN}/get_gapi_credentials`)
    .then((rsp) => {
      let credentials = rsp.data;
      let view = new google.picker.DocsView(google.picker.ViewId.DOCS).setParent('root').setIncludeFolders(true);
      // view.setMimeTypes("text/plain");
      view.setMode(google.picker.DocsViewMode.LIST);
      
      let picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(credentials.apiKey)
        .setCallback(callback)
        .setAppId((credentials.clientId).split('-')[0])
        .build();
      picker.setVisible(true);
    })
    .catch((err) => {
      console.log(err);
    });
}

function showSaveAsPicker(accessToken, callback) {
  axios
    .get(`${SERVER_ORIGIN}/get_gapi_credentials`)
    .then((rsp) => {
      let credentials = rsp.data;
      let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setParent('root')
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);
      view.setMimeTypes('application/vnd.google-apps.folder');
      view.setMode(google.picker.DocsViewMode.LIST);
      
      let picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(credentials.apiKey)
        .setCallback(callback)
        .setAppId((credentials.clientId).split('-')[0])
        .build();
      picker.setVisible(true);
    })
    .catch((err) => {
      console.log(err);
    });
}

function pickerCallback(data) {
  // if the user picked a file
  // need to check if the file is a conllu file
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    let doc = data[google.picker.Response.DOCUMENTS][0];
    let fileNameParts = doc.name.split(".");
    if (
      fileNameParts[fileNameParts.length - 1] !== "conllu" &&
      fileNameParts[fileNameParts.length - 1] !== "conllx"
    ) {
      alert(
        "File does not end with the .conllu/conllx extension, please upload a ConllU/X file."
      );
      return;
    }
    // need to add extension for conllx files as well
    let url =
      "https://www.googleapis.com/drive/v3/files/" + doc.id + "?alt=media";
    axios
      .get(url, {
        headers: {
          Authorization: "Bearer " + gapi.client.getToken().access_token,
        },
      })
      .then((rsp) => {
        // show name of picked file
        // set global pickedFile variable
        document.getElementById("picked_filename").innerHTML = doc.name;
        pickedFile = new File([rsp.data], doc.name, { type: doc.mimeType });
        fileId = doc.id;
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to retrieve file!");
      });
  }
}

function saveAsPickerCallback(data) {
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    let doc = data[google.picker.Response.DOCUMENTS][0];
    saveTreeRemote(remoteLocation=doc.id, saveType="saveAs")
  }
}

function enableBrowseButton() {
  let browseBtn = document.getElementById("browse_btn");
  browseBtn.style.display = "inline-block";
  browseBtn.onclick = () => {
    showPicker(gapi.client.getToken().access_token, pickerCallback);
  };
}

function saveAsPicker() {
  let browseBtn = document.getElementById("save_as_option");
  browseBtn.onclick = () => {
    showSaveAsPicker(gapi.client.getToken().access_token, saveAsPickerCallback);
  };
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableAuthButton() {
  if (gapiClientInited && gapiPickerInited && gisInited && !isAuthenticated) {
    $(".toolbar [id='auth_btn']").show();
  }
}

function maybeEnableSaveRemoteButton() {
  if (gapiClientInited && gisInited) {
    $("#save_remote").show();
  }
}