const fs = require("fs");
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "credencial.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events"
];

async function authorize() {
  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf8")
  );

  const config = credentials.installed;

  if (!config) {
    throw new Error("Se requieren credenciales OAuth de escritorio.");
  }

  const client = new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    "http://localhost"
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(
      fs.readFileSync(TOKEN_PATH, "utf8")
    );
    client.setCredentials(token);
    return client;
  }

  const authorizedClient = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  });

  fs.writeFileSync(
    TOKEN_PATH,
    JSON.stringify(authorizedClient.credentials, null, 2),
    { mode: 0o600 }
  );

  return authorizedClient;
}

module.exports = { authorize };