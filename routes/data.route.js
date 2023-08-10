import { Router } from "express";
import {
  getAllData,
  getEMAData,
  getMACDcortoData,
  getMACDmedianoData,
  getMACDlargoData,
  getSMAData,
  getRSIData,
  getROCData,
  getVolumeData,
  getEarningsData,
  getFases,
  getAlgoritmoData,
} from "../controllers/data.controller.js";

const router = Router();

router.post("/", getAllData);
router.post("/ema", getEMAData);
router.post("/sma", getSMAData);
router.post("/rsi", getRSIData);
router.post("/macdCp", getMACDcortoData);
router.post("/macdMp", getMACDmedianoData);
router.post("/macdLp", getMACDlargoData);
router.post("/roc", getROCData);
router.post("/volume", getVolumeData);
router.post("/earnings", getEarningsData);
router.post("/fases", getFases);
router.post("/algoritmo", getAlgoritmoData);

export default router;