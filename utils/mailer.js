import nodemailer from "nodemailer";
import "dotenv/config";
import { OAuth2Client } from "google-auth-library";
import opn from "opn";
import readline from "readline";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = "urn:ietf:wg:oauth:2.0:oob";
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

let accessToken = "";
let accessTokenExpiry = null;

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

async function getAccessToken() {
  const response = await oAuth2Client.getAccessToken();
  accessToken = response.token;

  // Establece la fecha de expiración del token (por lo general, es de 3600 segundos)
  accessTokenExpiry = Date.now() + response.expires_in * 1000;

  return accessToken;
}

function isTokenValid() {
  if (!accessToken || !accessTokenExpiry) return false;
  return accessTokenExpiry > Date.now();
}
// Esta función se encargará de generar el token de acceso
async function generateAccessToken() {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://mail.google.com/",
  });

  console.log(`Go to the following url: ${authorizeUrl}`);
  opn(authorizeUrl, { wait: false }).then((cp) => cp.unref());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", function (code) {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      // Aquí podrías guardar el token en tu .env o en otro lugar seguro
      console.log("Token:", JSON.stringify(token));
    });
  });
}

// Descomenta la siguiente línea si necesitas generar un token
//20/03/2024
//generateAccessToken();
///

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

/* transporter.on("token", (token) => {
  console.log("A new access token was generated");
  console.log("User: %s", token.user);
  console.log("Access Token: %s", token.accessToken);
  console.log("Expires: %s", new Date(token.expires));
}); */

export function sendMail(mailOptions) {
  return new Promise(async (resolve, reject) => {
    if (!isTokenValid()) {
      try {
        accessToken = await getAccessToken();
        transporter.set("oauth2.access.token", accessToken);
      } catch (error) {
        return reject(new Error("Error obteniendo el token de acceso"));
      }
    }

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        // Si el error es debido a un token inválido, intenta obtener uno nuevo y reenviar
        if (error.response && error.response.includes("invalid_grant")) {
          console.log("Refrescando token...");

          try {
            accessToken = await getAccessToken();
            transporter.set("oauth2.access.token", accessToken);
            const retryInfo = await sendMail(mailOptions); // Intenta de nuevo
            return resolve(retryInfo);
          } catch (retryError) {
            return reject(retryError);
          }
        }

        return reject(error);
      }

      return resolve(info);
    });
  });
}
