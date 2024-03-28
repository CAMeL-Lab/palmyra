let isAuthenticated = false;

function logout() {
  // remove access token from session storage
  sessionStorage.removeItem("GCP_access_token");
  // remove access token from gapi client
  gapi.client.setToken(null);
  // disable browse button
  $("#browse_btn").hide();
  // if logged out successfully, hide logout button && show authentication button
  $(".toolbar [id='logout_btn']").hide();
  $(".toolbar [id='auth_btn']").show();
}

function onAuthenticated() {
  // set access token in gapi client for future requests
  const accessToken = getTokenFromSessionStorage();
  gapi.client.setToken({ access_token: accessToken});
  if (accessToken) {
    isAuthenticated = true;
    // alert("Authenticated with Google Drive successfully!");
    // enable browse button
    enableBrowseButton();
    // if authenticated successfully, hide authentication button && show logout button
    $(".toolbar [id='auth_btn']").hide();
    $(".toolbar [id='logout_btn']").show();
  }
}

function authenticate() {
  // callbackafter access token is retrieved
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    // get client token from backend
    axios({method: 'get', url:`${SERVER_ORIGIN}/authenticate_user`})
    .then((rsp) => {
      let credentials = rsp.data;
      console.log("credentials");
      console.log(credentials);
      // setTokenInSessionStorage(credentials.client_token);
      setTokenInSessionStorage(gapi.client.getToken().access_token);
      onAuthenticated();
    });
  };
  // need to add a check for when the token expires
  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  }
}

function setTokenInSessionStorage(token) {
  sessionStorage.setItem("GCP_access_token", token);
}

function getTokenFromSessionStorage() {
  return sessionStorage.getItem("GCP_access_token");
}

// retrieve access token from session storage when page is loaded
window.onload = function () {
  if (getTokenFromSessionStorage()) {
    onAuthenticated();
  }
};
