import { Router } from "express";
import {
  createPosition,
  getDate,
  getPrice,
  getSimulator,
  getTicker,
  removePosition,
  updatePosition,
  createPortafolio,
  getPortafolios,
  deletePortafolio,
  updateAcciones,
  updateNombreLista,
  getAlertasPortafolios,
} from "../controllers/simulator.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
import cron from "node-cron";
import moment from "moment-timezone";
//import { bodyLinkValidator, paramLinkValidator } from "../middlewares/validatorManager.js";
const router = Router();

//GET              /api/v1/links         ALL LINKS
//GET              /api/v1/links/:id     SINGLE LINK
//POST            /api/v1/links          CREATE LINK
//PATCH/PUT       /api/v1/links/:id      Update
//DELETE          /api/v1/links/:id      Delete

router.get("/");
/* router.get("/", getSimulator); */
router.post("/ticker", getTicker);
router.post("/price", getPrice);
router.post("/date", getDate);

//router.get("/:id", requireToken, getLink)
//router.get("/:nanoLink", getLink)
router.post("/", requireToken, createPosition);
/* router.delete("/:id", requireToken, removePosition); */
router.patch("/:id", requireToken, updatePosition);

router.post("/listas", createPortafolio);
router.get("/listas", getPortafolios);
router.get("/listas/:date?", getAlertasPortafolios);
router.delete("/listas", deletePortafolio);
router.put("/listas/:id/acciones", updateAcciones);
router.put("/listas/:id/nombre", updateNombreLista);

export default router;

// Aquí configuras tu tarea programada.
const task = cron.schedule(
  "0 18 * * *",
  function () {
    // Verifica si es 7:00 PM en la zona horaria de Nueva York (Eastern Time)
    const is6PMNY = moment().tz("America/New_York").format("HH") === "18";

    if (is6PMNY) {
      console.log(
        "Ejecutando tarea programada: getAlertasPortafolios a las 7:00 PM de Nueva York."
      );

      // Llama tu función usando un request y response simulados (si es necesario)
      const mockReq = {
        params: { date: new Date().toISOString().split("T")[0] }, // Usando la fecha actual
      };
      const mockRes = {
        json: (data) => console.log(data),
        status: (statusCode) => ({
          json: (data) => console.log(`Status ${statusCode}:`, data),
        }),
      };
      getAlertasPortafolios(mockReq, mockRes);
    }
  },
  {
    scheduled: true,
    timezone: "America/New_York",
  }
);

// Inicia la tarea
task.start();
