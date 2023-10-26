const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

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

app.get("/status", (req, res) => {
  const status = {
     "Status": "Running"
  };
  console.log("server at sattus/");
  res.send(status);
});

app.listen(PORT, () => {
  // console.log(`Server listening on port ${PORT}`);
  console.log(`Running on http://${HOST}:${PORT}`);
});

