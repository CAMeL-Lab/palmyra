let isAuthenticated = false;

function logout() {
  // remove access token from session storage
  sessionStorage.removeItem("GCP_access_token");
  // remove access token from gapi client
  // gapi.client.setToken(null);
  // disable browse button
  // $("#browse_btn").hide();
  // if logged out successfully, hide logout button && show authentication button
  $(".toolbar [id='logout_btn']").hide();
  $("[id='upload1']").hide();
  $(".toolbar [id='auth_btn']").show();
}

function onAuthenticated() {
  console.log("onAuthenticated");
  // set access token in gapi client for future requests
  // gapi.client.setToken({ access_token: getTokenFromSessionStorage() });
  const accessToken = getTokenFromSessionStorage();
  if (accessToken) {
    isAuthenticated = true;
    // alert("Authenticated with Google Drive successfully!");
    // enable browse button
    enableBrowseButton(accessToken);
    // if authenticated successfully, hide authentication button && show logout button
    $(".toolbar [id='auth_btn']").hide();
    $(".toolbar [id='logout_btn']").show();
    $("[id='upload1']").show();

  }
}

function authenticate() {
  window.onbeforeunload = function () {};
  window.open("https://mra9407.pythonanywhere.com/authorize", "_self", "popup");
  // // callbackafter access token is retrieved
  // tokenClient.callback = async (resp) => {
  //   if (resp.error !== undefined) {
  //     throw resp;
  //   }
  //   setTokenInSessionStorage(gapi.client.getToken().access_token);
  //   onAuthenticated();
  // };
  // // need to add a check for when the token expires
  // if (gapi.client.getToken() === null) {
  //   // Prompt the user to select a Google Account and ask for consent to share their data
  //   // when establishing a new session.
  //   tokenClient.requestAccessToken({ prompt: "consent" });
  // }
}

function setTokenInSessionStorage(token, ak) {
  sessionStorage.setItem("GCP_access_token", token);
  sessionStorage.setItem("ak", ak);
}

function getTokenFromSessionStorage() {
  return sessionStorage.getItem("GCP_access_token");
}

function getAkFromSessionStorage() {
  return sessionStorage.getItem("ak");
}

// retrieve access token from session storage when page is loaded
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);

  const sessionToken = urlParams.get('token');
  const ak = urlParams.get('ak');
  if (sessionToken) {
    setTokenInSessionStorage(sessionToken, ak);
  }
  
  if (getTokenFromSessionStorage()) {
    onAuthenticated();
  }
};
