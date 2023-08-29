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
