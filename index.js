import "dotenv/config";
import "./database/connectdb.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import simulatorRouter from "./routes/simulator.route.js";
import generalRouter from "./routes/general.route.js";
import dataRouter from "./routes/data.route.js";
//import redirectRouter from "./routes/redirect.route.js";

const app = express();

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whiteList.includes(origin)) {
        return callback(null, true);
      }
      return callback("Error de CORS origin: " + origin + " No autorizado");
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

//Ejemplo BackRedirect (opcional)
//app.use("/", redirectRouter)

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/position", simulatorRouter);
app.use("/api/v1/general", generalRouter);
app.use("/api/v1/data", dataRouter);

// Solo para el ejemplo de login y token
//app.use(express.static("public"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🔥🔥🔥🔥 http://localhost:" + PORT));
