import nodemailer from "nodemailer";
import "dotenv/config";
import { OAuth2Client } from "google-auth-library";
import opn from "opn";
import readline from "readline";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = "urn:ietf:wg:oauth:2.0:oob";
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

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
//generateAccessToken();
//

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: process.env.GMAIL_ACCESS_TOKEN, // es opcional, puede ser útil para tokens que ya se han generado
  },
});

export default transporter;
