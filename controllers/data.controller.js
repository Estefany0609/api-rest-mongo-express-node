import axios from "axios";
import { pool } from "../database/connectdb.js";
import openai from "../utils/openaiClient.js";

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

const getEarningsData = async (req, res) => {
  const { ticker } = req.body;
  try {
    let query =
      "SELECT date, quarter, ytd_var_percentage, qa1_var_percentage, qa2_var_percentage, qa3_var_percentage, correlation FROM web_financial.tos_eps WHERE ticker = $1 AND date is not null order by date desc limit $2";
    const values = [ticker, 8];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const getFases = async (req, res) => {
  const { ticker } = req.body;
  try {
    let query =
      "select date, acumulacion_cp Acumulación , avance_cp Avance, distribucion_cp Distribución, correccion_cp Corrección FROM web_financial.fases_mercado WHERE ticker = $1 order by date desc limit $2 ";
    const values = [ticker, 15];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
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

const getAlgoritmoData = async (req, res) => {
  const { ticker } = req.body;
  try {
    let query =
      "SELECT h.date, h.ticker, h.volume, signal_cp, alert_cp, signal_mp, alert_mp, signal_lp, alert_lp, signal_alert_cp, fuerza_compra_venta_cp, signal_alert_mp, fuerza_compra_venta_mp, signal_alert_lp, fuerza_compra_venta_lp, h.close, change_percentage, fases.fase_principal_cp, fases.fase_subyacente_cp, fases.fase_subyacente2_cp, fases.fase_subyacente3_cp,cast (preassure_daily*0.3+_5_days_presion*0.25+_10_days_presion*0.2+_20_days_presion*0.15+_50_days_presion*0.05+_100_days_presion*0.03+_200_days_presion*0.015+_260_days_presion*0.005 as decimal (10,2)) presion_volumen_corto, cast (preassure_daily*0.05+_5_days_presion*0.1+_10_days_presion*0.15+_20_days_presion*0.25+_50_days_presion*0.25+_100_days_presion*0.1+_200_days_presion*0.07+_260_days_presion*0.03 as decimal (10,2)) presion_volumen_mediano, cast (preassure_daily*0.01+_5_days_presion*0.02+_10_days_presion*0.03+_20_days_presion*0.04+_50_days_presion*0.1+_100_days_presion*0.2+_200_days_presion*0.3+_260_days_presion*0.3 as decimal (10,2)) presion_volumen_largo, oscilator_rsi_14 rsi_index, alfa_corto, alfa_largo, alfa_mediano FROM web_financial.listado_historico_general as h LEFT OUTER JOIN web_financial.fases_mercado fases ON fases.ticker =h.ticker AND fases.date= h.date LEFT OUTER JOIN web_financial.h_p_rsi rsi ON rsi.ticker =h.ticker AND rsi.date= h.date LEFT OUTER JOIN  web_financial.alfa_acciones alfa ON alfa.ticker = h.ticker AND alfa.date = cast(h.date as date) WHERE h.ticker = $1 order by date desc limit $2; ";

    const values = [ticker, 15];

    let response = await pool.query(query, values);
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
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

const getHistoricalPrice = async (req, res) => {
  try {
    const { ticker } = req.body;

    let query =
      "SELECT date, open, high, low, close FROM web_financial.tos_h_p_general_consolidado WHERE TICKER = $1 ORDER BY date ASC  ";
    const values = [ticker];

    let response = await pool.query(query, values);

    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

// Función para obtener los datos de los MACD
const getMacdData = async (req, res) => {
  const { ticker } = req.body;
  try {
    // Realiza las tres consultas SQL de manera secuencial
    /* const resultCorto = await pool.query(
      `
      SELECT date, macd_5 linea_corta, macd_10 linea_larga, histogram_macd, signal_alert
      FROM web_financial.h_p_macd_cp
      WHERE ticker = $1
      ORDER BY date ASC
    `,
      [ticker]
    ); */

    const resultMediano = await pool.query(
      `
      SELECT date,  macd_20 linea_corta, macd_50 linea_larga, histogram_macd, signal_alert
      FROM web_financial.h_p_macd_mp
      WHERE ticker = $1
      ORDER BY date ASC
    `,
      [ticker]
    );

    /* const resultLargo = await pool.query(
      `
      SELECT date, macd_100 linea_corta, macd_200 linea_larga, histogram_macd, signal_alert
      FROM web_financial.h_p_macd_lp
      WHERE ticker = $1
      ORDER BY date ASC
    `,
      [ticker]
    );
 */
    // Devuelve los resultados en un objeto
    return res.json({
      /* corto: resultCorto.rows, */
      mediano: resultMediano.rows,
      /* largo: resultLargo.rows, */
    });
  } catch (error) {
    throw error;
  }
};

const getInformes = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT report_date, report FROM web_financial.market_sentiment_reports order by report_date desc"
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

const getFasesDetallada = async (req, res) => {
  try {
    const response = await pool.query(
      ` SELECT sector, industry, sub_industry, 
    SUM(acumulacion_cp) AS Acumulacion,
    SUM(avance_cp) AS Avance,
    SUM(distribucion_cp) AS Distribucion,
    SUM(correccion_cp) AS Correccion,
    SUM(acumulacion_cp) + SUM(avance_cp) + SUM(distribucion_cp) + SUM(correccion_cp) AS Total,
    CAST((SUM(acumulacion_cp) / (SUM(acumulacion_cp) + SUM(avance_cp) + SUM(distribucion_cp) + SUM(correccion_cp)) * 100) AS DECIMAL(10,2)) AS Porcentaje_Acumulacion,
    CAST((SUM(avance_cp) / (SUM(acumulacion_cp) + SUM(avance_cp) + SUM(distribucion_cp) + SUM(correccion_cp)) * 100) AS DECIMAL(10,2)) AS Porcentaje_Avance,
    CAST((SUM(distribucion_cp) / (SUM(acumulacion_cp) + SUM(avance_cp) + SUM(distribucion_cp) + SUM(correccion_cp)) * 100) AS DECIMAL(10,2)) AS Porcentaje_Distribucion,
    CAST((SUM(correccion_cp) / (SUM(acumulacion_cp) + SUM(avance_cp) + SUM(distribucion_cp) + SUM(correccion_cp)) * 100) AS DECIMAL(10,2)) AS Porcentaje_Correccion
FROM  web_financial.fases_del_mercado
WHERE date >= (SELECT MAX(date) from web_financial.fases_del_mercado)
GROUP BY sector, industry, sub_industry`
    );

    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

const getRocDetallados = async (req, res) => {
  try {
    const response = await pool.query(
      ` SELECT * FROM web_financial.sector_industry_analysis_roc WHERE date = (select max(date) from web_financial.sector_industry_analysis_roc ) ORDER BY sector, industry, sub_industry;`
    );

    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

const getPressionLastDay = async (req, res) => {
  try {
    const response = await pool.query(
      ` SELECT
    SUM(buy_volume) AS total_buy_transactions,
    SUM(sales_volume) AS total_sales_transactions,
   CAST(  (SUM(buy_volume) - SUM(sales_volume)) / (SUM(buy_volume) + SUM(sales_volume)) * 100 AS decimal (10,2)) AS net_pressure_pct
FROM web_financial.presion_volumen
WHERE date = (select max(date)FROM web_financial.presion_volumen) `
    );

    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

const getReportFasesLastDay = async (req, res) => {
  try {
    const response = await pool.query(
      ` SELECT * FROM web_financial.market_analysis_reports_fases ORDER BY report_date DESC LIMIT 1`
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

const getCurrentDateFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript comienzan en 0
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const yourFunction = async (req, res) => {
  try {
    const marketSummary = await pool.query(
      ` SELECT
      SUM(buy_volume) AS total_buy_transactions,
      SUM(sales_volume) AS total_sales_transactions,
      CAST((SUM(buy_volume) - SUM(sales_volume)) / (SUM(buy_volume) + SUM(sales_volume)) * 100 AS decimal (10,2)) AS net_pressure_pct
    FROM web_financial.presion_volumen
    WHERE date = (SELECT MAX(date) FROM web_financial.presion_volumen) `
    );

    const detailedDataResults = await pool.query(
      ` WITH RankedSectors AS (
    SELECT
        sector,
        industry,
        sub_industry,
        SUM(buy_volume) - SUM(sales_volume) AS net_sector_volume,
        CAST((SUM(buy_volume) - SUM(sales_volume)) / NULLIF(SUM(buy_volume) + SUM(sales_volume), 0) * 100 AS DECIMAL (10,2)) AS net_sector_pressure_pct,
        CAST(AVG(rsi) AS DECIMAL (10,2)) AS average_rsi,
        CAST((AVG(_5_days_presion) + AVG(_10_days_presion) + AVG(_20_days_presion)) / 3  AS DECIMAL (10,2)) AS short_term_pressure_avg,
        CAST((AVG(_50_days_presion) + AVG(_100_days_presion)) / 2  AS DECIMAL (10,2)) AS medium_term_pressure_avg,
        CAST((AVG(_200_days_presion) + AVG(_260_days_presion)) / 2  AS DECIMAL (10,2)) AS long_term_pressure_avg,
        CASE
            WHEN AVG(rsi) < 30 THEN 'Sobrevendida'
            WHEN AVG(rsi) BETWEEN 30 AND 40 THEN 'Recuperación Moderada'
            WHEN AVG(rsi) BETWEEN 40 AND 50 THEN 'Equilibrio Tentativo'
            WHEN AVG(rsi) BETWEEN 50 AND 60 THEN 'Fortaleza Moderada'
            WHEN AVG(rsi) BETWEEN 60 AND 70 THEN 'Demanda Fuerte'
            WHEN AVG(rsi) BETWEEN 70 AND 80 THEN 'Sobrecompra Moderada'
            WHEN AVG(rsi) BETWEEN 80 AND 90 THEN 'Sobrecompra Fuerte'
            ELSE 'Sobrecompra Extrema'
        END AS rsi_interpretation
    FROM
        web_financial.presion_volumen
    WHERE
       date = (select max(date)FROM web_financial.presion_volumen)
        AND TRIM(sector) <> ''
        AND TRIM(industry) <> ''
        AND TRIM(sub_industry) <> ''
		AND preassure_daily IS NOT NULL
    GROUP BY
        sector, industry, sub_industry
),
TopSectors AS (
    SELECT *
    FROM RankedSectors
    ORDER BY net_sector_pressure_pct DESC
    LIMIT 5
),
BottomSectors AS (
    SELECT *
    FROM RankedSectors
    ORDER BY net_sector_pressure_pct
    LIMIT 5
)
SELECT * FROM TopSectors
UNION ALL
SELECT * FROM BottomSectors; `
    );

    console.log(marketSummary.rows[0]);
    const formatMarketSummary = (marketSummary) => {
      return `-Total de transacciones de compra: ${marketSummary.total_buy_transactions}
-Total de transacciones de venta: ${marketSummary.total_sales_transactions}
-Porcentaje de presión neta: ${marketSummary.net_pressure_pct}`;
    };

    const formatDetailedData = (detailedDataResults) => {
      return detailedDataResults
        .map((row) => {
          return `Sector: ${row.sector}
Industria: ${row.industry}
Subindustria: ${row.sub_industry}
Volumen neto del sector: ${row.net_sector_volume}
Porcentaje de presión neta del sector: ${row.net_sector_pressure_pct}
RSI promedio: ${row.average_rsi}
Promedio de presión a corto plazo: ${row.short_term_pressure_avg}
Promedio de presión a medio plazo: ${row.medium_term_pressure_avg}
Promedio de presión a largo plazo: ${row.long_term_pressure_avg}
Interpretación del RSI: ${row.rsi_interpretation}`;
        })
        .join("\n\n");
    };

    const marketSummaryFormatted = formatMarketSummary(marketSummary.rows[0]);
    const detailedDataFormatted = formatDetailedData(detailedDataResults.rows);

    const currentDate = getCurrentDateFormatted();

    const prompt = `

Generar un analisis holistico del sentimiento del mercado accionario para la fecha '${currentDate}', interrelacionando los siguientes datos:

1. Introducción:

Aquí queremos que el lector lea un resumen de los análisis y conclusiones que se van a encontrar más adelante.

2. Resumen General del Mercado:

- Mostrar estos datos uno debajo del otro en el informe:
${marketSummaryFormatted}

Adicionalmente realizar analisis cortos, puntuales y sencillos para reforzar la idea basica del reporte acerca de la presion del volumen.

3. Conclusiones y Consideraciones Finales:

(Replicar esta estructura para el anilisis de cada sector, con los datos que se muestran uno debajo del otro

Sector (Industry, Sub-Industry):

-Presión Neta del Sector: xxx
-RSI Promedio: xx
-Presión a Corto, Mediano y Largo Plazo: xx.xx, xx.xx, xx.xx
Conclusion y analisis)

Basándome en el análisis de los datos proporcionados, incluir conclusiones y consideraciones finales acerca del sentimiento del mercado, tendencias observadas y cualquier otro aspecto destacable. 

Incluir una mención estrategica que permita proyectar la fortaleza o debilidad del sector, industria o subindustria con base en la presion del volumen neto para cada periodo de tiempo, Corto Mediano y Largo Plazo.

Datos:  
${detailedDataFormatted}
`;

    console.log(prompt);

    //generateOpenAIReport(prompt);

    /* const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: "cuentame un chiste" }],
    });

    console.log(completion.data.choices[0].message.content); */

    //res.status(200).json({ message: completion.data.choices }); // Asegúrate de que accedes a la propiedad correcta
  } catch (error) {
    console.error("Error al llamar a la API de OpenAI:", error);
    //res.status(500).json({ error: error.message });
  }
};

//yourFunction();

const generateOpenAIReport = async (prompt) => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000, // Ajusta según la necesidad
    });

    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al llamar a la API de OpenAI:", error);
    throw error;
  }
};

const reportDailyFases = async (req, res) => {
  try {
    const reportDate = new Date().toISOString().slice(0, 10);

    // Ejecuta la consulta SQL para obtener las fases históricas
    const historicoFases = await pool.query(
      ` SELECT 
  date,
  SUM(CASE WHEN fase_principal_cp = 'acumulacion' THEN conteo ELSE 0 END) AS Acumulacion,
  SUM(CASE WHEN fase_principal_cp = 'avance' THEN conteo ELSE 0 END) AS Avance,
  SUM(CASE WHEN fase_principal_cp = 'correccion' THEN conteo ELSE 0 END) AS Correccion,
  SUM(CASE WHEN fase_principal_cp = 'distribucion' THEN conteo ELSE 0 END) AS Distribucion
FROM
  ( SELECT date, fase_principal_cp, COUNT(*) AS conteo
    FROM web_financial.fases_mercado f
    JOIN web_financial.company_profile cp ON f.ticker = cp.ticker
    WHERE cp.exchange != 'Other OTC' AND cp.isetf = 'false' AND cast(date as date) >= (SELECT CURRENT_DATE - 25)
    GROUP BY date, fase_principal_cp
  ) AS subquery
GROUP BY date order by date desc limit 15 `
    );

    // Verifica si la última fecha obtenida es igual a la fecha actual
    if (historicoFases.rows.length > 0) {
      const lastDate = historicoFases.rows[0].date;
      if (lastDate === reportDate) {
        const formatDataForPrompt = (rows) => {
          // Transforma cada objeto de datos en una cadena de texto
          return rows
            .map((row) => {
              return `{Fecha: ${row.date}, Acumulación: ${row.acumulacion}, Avance: ${row.avance}, Corrección: ${row.correccion}, Distribución: ${row.distribucion}}`;
            })
            .join(", ");
        };

        // Formateamos los datos para el prompt
        const formattedData = formatDataForPrompt(historicoFases.rows);
        // Crear el prompt para la API
        const prompt = `
Título: Resumen de Tendencias del Mercado en 15 Días

Descripción: Con base en datos de las fases del mercado de valores de los últimos 15 días, proporciona un resumen claro y conciso. Estos datos reflejan el conteo diario de acciones clasificadas por fase del mercado (Acumulación, Avance, Corrección, Distribución), derivados de una consulta SQL. Se busca identificar patrones clave y obtener insights relevantes para la toma de decisiones de inversión.

Entrada de Datos:
${formattedData}

Tareas:
1. Resumir las tendencias dominantes observadas en las fases del mercado.
2. Destacar cualquier patrón significativo en la transición entre fases.
3. Comentar brevemente sobre el balance entre las fases y qué indica sobre el estado actual del mercado.
4. Proveer insights concisos sobre las implicaciones de las fases de Acumulación y Distribución para las estrategias de inversión.
5. Utilizar el Indicador RSI para apoyar la interpretación de los patrones de las fases.

Resultado esperado: Proporciona un abstract de maximo 100 palabras que sintetice las tendencias del mercado, los patrones entre las fases, y cómo estos pueden influir en las decisiones de inversión. Enfócate en ser puntual, claro, directo, holistico que lleve una facil comprensión del estado actual del mercado y posibles acciones a seguir.
`;

        const analysis = await generateOpenAIReport(prompt);

        // Si la función generateOpenAIReport devuelve una respuesta, inserta en la base de datos
        if (analysis) {
          const insertResult = await pool.query(
            `INSERT INTO web_financial.market_analysis_reports_fases (report_date, report)
             VALUES ($1, $2)
             RETURNING *`,
            [reportDate, analysis]
          );

          // Envía una respuesta al cliente con el análisis almacenado
          res.status(200).json({
            message: "Análisis almacenado correctamente",
            /* data: insertResult.rows[0], */
          });
        } else {
          // Manejar el caso en que no se obtuvo un análisis
          res.status(500).json({ message: "No se pudo generar el análisis." });
        }
      } else {
        // Si la fecha no coincide, enviar un mensaje de error
        res.status(400).json({
          message:
            "La fecha más reciente de los datos no coincide con la fecha actual.",
        });
      }
    } else {
      // Manejar el caso en que no se obtuvieron filas en la consulta SQL
      res.status(404).json({
        message:
          "No se encontraron datos históricos para las fases del mercado.",
      });
    }
  } catch (error) {
    console.error("Error al realizar la operación:", error);
    res.status(500).json({ error: error.message });
  }
};

//generateOpenAIReport(prompt);

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
  getFases,
  getAlgoritmoData,
  getHistoricalPrice,
  getMacdData,
  getInformes,
  getFasesDetallada,
  getRocDetallados,
  getPressionLastDay,
  yourFunction,
  getReportFasesLastDay,
  reportDailyFases,
};
