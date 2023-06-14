import axios from "axios";
import { pool } from "../database/connectdb.js";
const api_key = process.env.API_CHATGPT;
import { Configuration, OpenAIApi } from "openai";

// Crea una instancia del cliente de OpenAI
const client = new OpenAIApi(api_key);

const getEMAData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, close, ema_5, ema_10, ema_50, ema_100, ema_200 FROM web_financial.h_p_ema WHERE ticker = $1 ORDER BY date DESC LIMIT $2 ";
    const values = [ticker, limit];

    let response = await pool.query(query, values);

    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getMACDcortoData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, macd_12, macd_26, histogram_macd FROM web_financial.h_p_macd_cp WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    // Verificar si se proporciona el parámetro de fecha
    /*     if (date) {
      query += " AND date > $2";
      values.push(date);
    } */

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getMACDmedianoData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, macd_21, macd_34, histogram_macd FROM web_financial.h_p_macd_mp WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getMACDlargoData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, macd_34, macd_144, histogram_macd FROM web_financial.h_p_macd_lp WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getROCData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, roc_5, roc_10, roc_50, roc_100, roc_200 FROM web_financial.h_p_roc WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getRSIData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, oscilator_rsi_14 FROM web_financial.h_p_rsi WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getSMAData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, sma_5, sma_10, sma_50, sma_100, sma_200 FROM web_financial.h_p_sma WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getVolumeData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, volume, preassure_daily, _5_days_presion, _10_days_presion, _20_days_presion, _50_days_presion, _100_days_presion, _200_days_presion, _260_days_presion FROM web_financial.h_p_volume WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getEarningsData = async (ticker, limit) => {
  try {
    let query =
      "SELECT date, eps_act, eps_est, quarter, surprise_abs, surprise_percentage, ytd_var_percentage,  qa1_var_percentage, qa2_var_percentage, qa3_var_percentage FROM web_financial.tos_eps WHERE ticker = $1 ORDER BY date DESC LIMIT $2";
    const values = [ticker, limit];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const allDataAlgoritmo = async (ticker) => {
  try {
    let query =
      "SELECT * FROM web_financial.algoritmo_ldms_v1 WHERE ticker = $1 ORDER BY date DESC ";
    const values = [ticker];

    let response = await pool.query(query, values);

    if (!response.rows) throw { code: 11000 };
    return response.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

// Función para analizar los datos
const analyzeData = async (data) => {
  try {
    const prompt = "Analizar datos: " + data;
    const options = {
      model: "gpt-3.5-turbo",
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stop: "\n",
    };

    const response = await client.complete(options);
    console.log("Respuesta de la API:", response); // Agregamos este console.log para ver la respuesta de la API
    const analysis = response.choices[0].text.trim();
    return analysis;
  } catch (error) {
    console.error("Error al analizar los datos:", error);
    throw error;
  }
};

export const getAllData = async (req, res) => {
  try {
    const { ticker, limitGanancias } = req.body;

    const dataAlgoritmo = await allDataAlgoritmo(ticker);
    const earningsData = await getEarningsData(ticker, limitGanancias);

    const allData = {
      other: dataAlgoritmo,
      earnings: earningsData,
    };

    // Obtener el análisis de los datos utilizando la función analyzeData
    //const analysis = await analyzeData(allData);

    analyzeData(allData)
      .then((analysis) => {
        console.log("Análisis:", analysis);
        // Puedes hacer más preguntas o realizar otras acciones con el análisis obtenido
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    // Retornar los datos y el análisis
    /* return {
      analysis: analysis,
    }; */
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

export const getAllDataG = async (req, res) => {
  try {
    const { ticker, limit, limitGanancias } = req.body;

    const emaData = await getEMAData(ticker, limit);
    const macdCortoData = await getMACDcortoData(ticker, limit);
    const macdMedianoData = await getMACDmedianoData(ticker, limit);
    const macdLargoData = await getMACDlargoData(ticker, limit);
    const smaData = await getSMAData(ticker, limit);
    const rsiData = await getRSIData(ticker, limit);
    const rocData = await getROCData(ticker, limit);
    const volumeData = await getVolumeData(ticker, limit);
    const earningsData = await getEarningsData(ticker, limitGanancias);

    const allData = {
      ema: emaData,
      macdCorto: macdCortoData,
      macdMediano: macdMedianoData,
      macdLargo: macdLargoData,
      sma: smaData,
      rsi: rsiData,
      roc: rocData,
      volume: volumeData,
      earnings: earningsData,
    };

    return res.json(allData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

// Exportar las funciones que se utilizarán en otros archivos si es necesario
export {
  getEMAData,
  getMACDcortoData,
  getMACDmedianoData,
  getMACDlargoData,
  getROCData,
  getRSIData,
  getSMAData,
  getVolumeData,
  getEarningsData,
};
