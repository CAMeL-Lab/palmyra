const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const port = 3000;

if (process.env.NODE_ENV === "development") {
  const CLIENT_ORIGIN = "http://localhost:1234"; 
}
else {
  const CLIENT_ORIGIN = "https://camel-lab.github.io/"; 
}

// enable CORS for client origin
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
