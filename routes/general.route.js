import { Router } from "express";
import { getAverage, newProfile, getTickerSM, getHistoricoDiario, getIndustrias, getSectores, getSubIndustrias } from "../controllers/historical.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
const router = Router();

router.get("/", requireToken, getHistoricoDiario)
router.get("/tickerSM", getTickerSM)
router.get("/sector", requireToken, getSectores)
router.get("/preassure", requireToken, getAverage)
router.post("/industrias", requireToken, getIndustrias)
router.post("/subIndustrias", requireToken, getSubIndustrias)

router.post("/profile", newProfile);

/* router.post("/ticker", getTicker)
router.post("/price", getPrice)

//router.get("/:id", requireToken, getLink)
//router.get("/:nanoLink", getLink)
router.post("/", requireToken, createPosition)
router.delete("/:id", requireToken, removePosition)
router.patch("/:id", requireToken, updatePosition) */


export default router;