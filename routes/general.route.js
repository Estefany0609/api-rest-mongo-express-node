import { Router } from "express";
import {
  getAverage,
  newProfile,
  readSheetFilter,
  readSheet,
  getTickerSM,
  getHistoricoDiario,
  getIndustrias,
  getSectores,
  getSubIndustrias,
  getCompanyProfile,
} from "../controllers/historical.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
const router = Router();

router.get("/", getHistoricoDiario);
router.get("/tickerSM", getTickerSM);
router.get("/sector", requireToken, getSectores);
router.get("/preassure", getAverage);
router.post("/industrias", requireToken, getIndustrias);
router.post("/subIndustrias", requireToken, getSubIndustrias);

router.post("/profile", newProfile);

router.get("/fileGoogle", readSheet);
router.get("/fileGoogleFilter", requireToken, readSheetFilter);
router.get("/fileGoogleFilterH", readSheetFilter);
router.get("/companyProfile", getCompanyProfile);
/* router.post("/ticker", getTicker)
router.post("/price", getPrice)

//router.get("/:id", requireToken, getLink)
//router.get("/:nanoLink", getLink)
router.post("/", requireToken, createPosition)
router.delete("/:id", requireToken, removePosition)
router.patch("/:id", requireToken, updatePosition) */

export default router;
