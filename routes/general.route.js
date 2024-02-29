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
  getIncomeStatementA,
  getBalanceSheetA,
  getCashFlowA,
  getKeyMetricsA,
  getRatiosA,
  getAndCallStatements,
  getAndCallStatementsByDates,
  getEstimates,
  getCryptoPrice,
  getCommoditiesPrice,
  getEconomicsData,
  getNominalUsDollarIndex,
  getTickerIndices,
  getFullPrice,
  getErp,
  reportStatements,
} from "../controllers/historical.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
const router = Router();

router.get("/", getHistoricoDiario);
router.get("/tickerSM", getTickerSM);
router.get("/sector", requireToken, getSectores);
router.get("/preassure", getAverage);
router.post("/industrias", requireToken, getIndustrias);
router.post("/subIndustrias", requireToken, getSubIndustrias);
router.get("/tickerIndices", getTickerIndices);
router.get("/erp", getErp);
router.get("/reportStatements", reportStatements);

router.post("/profile", newProfile);
router.post("/AllStatement", getAndCallStatements);
router.post("/AllStatementByDate", getAndCallStatementsByDates);
router.post("/IncomeStatement/:period", getIncomeStatementA);
router.post("/BalanceSheet/:period", getBalanceSheetA);
router.post("/CashFLow/:period", getCashFlowA);
router.post("/KeyMetrics/:period", getKeyMetricsA);
router.post("/Ratios/:period", getRatiosA);
router.post("/Estimates/:period", getEstimates);
router.post("/Crypto", getCryptoPrice);
router.post("/FullPrice", getFullPrice);

router.post("/Commodities", getCommoditiesPrice);
router.post("/Economics", getEconomicsData);
router.post("/EconomicsDollarIndex", getNominalUsDollarIndex);

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
