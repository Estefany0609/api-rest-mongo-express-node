import "dotenv/config";
import "./database/connectdb.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import simulatorRouter from "./routes/simulator.route.js";
import generalRouter from "./routes/general.route.js";
import dataRouter from "./routes/data.route.js";

const app = express();

const whiteList = [
  /^https?:\/\/localhost(:\d+)?$/, // Coincide con cualquier puerto en localhost
  "api-rest-mongo-express-node-production.up.railway.app",
];

const checkWhiteList = (origin) => {
  return whiteList.some((allowedOrigin) => {
    if (typeof allowedOrigin === "string") {
      return origin === allowedOrigin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return false;
  });
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || checkWhiteList(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error("Error de CORS origin: " + origin + " No autorizado")
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/position", simulatorRouter);
app.use("/api/v1/general", generalRouter);
app.use("/api/v1/data", dataRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🔥🔥🔥🔥 http://localhost:" + PORT));
