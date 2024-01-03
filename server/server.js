const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const port = 3000;

CLIENT_TOKEN = process.env.CLIENT_TOKEN

var clientOrigin;
if (process.env.NODE_ENV === "development") {
  clientOrigin = "http://localhost:1234"; 
}
else {
  clientOrigin = "https://camel-lab.github.io/"; 
}

// enable CORS for client origin
app.use(cors({
    origin: clientOrigin,
}));

app.get("/gapi_credentials", (req, res) => {
  res.json({
    apiKey: process.env.GCP_API_KEY,
    discoveryDocs: [process.env.GCP_DISCOVERY_DOC],
  });
})

app.get("/gis_credentials", (req, res) => {
  res.json({
    client_id: process.env.GCP_CLIENT_ID,
    scope: process.env.GCP_API_SCOPES,
  });
})

app.get("/get_client_token", (req, res) => {
  res.json({
    client_token: CLIENT_TOKEN
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
