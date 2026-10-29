const { google } = require("googleapis");

function getGoogleCalendar() {
  const required = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
    "CALENDAR_ID"
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Falta la variable ${key}`);
    }
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client
  });
}

module.exports = { getGoogleCalendar };