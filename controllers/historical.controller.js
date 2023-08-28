import { pool } from "../database/connectdb.js";
import fetch from "node-fetch";

import fs from "fs";
import { google } from "googleapis";
import * as xlsx from "xlsx";
import XLSX from "xlsx";
import { GoogleAuth } from "google-auth-library";
import { ConfidentialClientApplication } from "@azure/msal-node";

import { file } from "googleapis/build/src/apis/file/index.js";
import { Client } from "@microsoft/microsoft-graph-client";
import graph from "@microsoft/microsoft-graph-client";
import axios from "axios";

const endpointBase =
  "https://financialmodelingprep.com/api/v3/company/profile/";
const api_key = process.env.API_FINANCIAL;

const getAccessToken = async () => {
  const clientId = process.env.CLIENT_ID;
  const tenantId = process.env.TENANT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const data = `client_id=${clientId}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=${encodeURIComponent(
    clientSecret
  )}&grant_type=client_credentials`;
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axios.post(url, data, config);
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

const getDrive = async (accessToken, driveId) => {
  const graphClient = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const drive = await graphClient
      .api(`/drives/${driveId}`)
      .version("v1.0")
      .get();

    return drive;
  } catch (error) {
    console.error("Error getting drive:", error);
    return null;
  }
};

const getFolder = async (accessToken, driveId, folderId) => {
  const graphClient = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const folder = await graphClient
      .api(`/drives/${driveId}/items/${folderId}`)
      .version("v1.0")
      .get();

    return folder;
  } catch (error) {
    console.error("Error getting folder:", error);
    return null;
  }
};

const getFilesInFolder = async (accessToken, driveId, folderId) => {
  const graphClient = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const files = await graphClient
      .api(`/drives/${driveId}/items/${folderId}/children`)
      .version("v1.0")
      .get();

    return files.value;
  } catch (error) {
    console.error("Error getting files in folder:", error);
    return null;
  }
};

const findExcelFile = (files, excelFileName) => {
  return files.find((file) => file.name === excelFileName);
};

const getDriveId = async (accessToken, userEmail) => {
  const graphClient = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const drive = await graphClient
      .api(`/users/${encodeURIComponent(userEmail)}/drive`)
      .version("v1.0")
      .get();

    return drive.id;
  } catch (error) {
    console.error("Error getting drive ID:", error);
    return null;
  }
};

const accessToken = (async function () {
  try {
    return await getAccessToken();
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
})();

const readExcelFile = async (accessToken, driveId, fileId, sheetName) => {
  const graphClient = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const data = await graphClient
      .api(
        `/drives/${driveId}/items/${fileId}/workbook/worksheets('${sheetName}')/usedRange`
      )
      .version("v1.0")
      .select("values")
      .get();

    return data.values;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return null;
  }
};

const readExcel = async (accessToken, driveId, fileId) => {
  // Obtener el archivo de Excel de OneDrive
  const excelFileBuffer = await getExcelFile(accessToken, driveId, fileId);

  // Convertir el archivo de Excel en un array y devolverlo
  return excelToArray(excelFileBuffer);
};

async function getExcelFile(accessToken, driveId, fileId) {
  const graphClient = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  try {
    const response = await graphClient
      .api(`/drives/${driveId}/items/${fileId}/content`)
      .responseType("arraybuffer")
      .get();
    return response;
  } catch (error) {
    console.error("Error getting Excel file:", error);
    return null;
  }
}

function excelToArray(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Cambia 'Sheet1' por el nombre de la hoja que deseas leer, si es diferente
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonArray = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  return jsonArray;
}

/* 
export const readSheetGoogleDrive = async (req, res) => {
  const spreadsheetId = req.query.spreadsheetId;
  const sheetName = req.query.sheetName;
  const range = req.query.range;

  if (!spreadsheetId || !sheetName || !range) {
    res.status(400).json({ error: 'Se requieren los parámetros spreadsheetId, sheetName y range' });
    return;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      res.json({ data: rows });
    } else {
      res.status(404).json({ error: 'No se encontraron datos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos de Google Sheets' });
  }
}; */

export const readSheet = async (req, res) => {
  const fileId = req.query.spreadsheetId;
  const sheetName = req.query.sheetName;
  const range = req.query.range;

  if (!fileId || !sheetName || !range) {
    res
      .status(400)
      .json({ error: "Se requieren los parámetros fileId, sheetName y range" });
    return;
  }

  try {
    const googleAuth = new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const authClient = await googleAuth.getClient();

    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: "name, mimeType",
    });

    if (
      !fileMetadata.data.mimeType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      res.status(400).json({ error: "El archivo no es un archivo de Excel" });
      return;
    }

    const excelFile = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );

    const workbook = xlsx.read(excelFile.data, { type: "buffer" });

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      res.status(404).json({ error: "No se encontró la hoja especificada" });
      return;
    }

    const jsonData = xlsx.utils.sheet_to_json(worksheet, { range });

    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos de Google Drive" });
  }
};

export const readSheetFilter = async (req, res) => {
  const fileId = req.query.spreadsheetId;
  const sheetName = req.query.sheetName;
  const range = req.query.range;
  const filterColumn = req.query.filterColumn;
  const filterValue = req.query.filterValue;

  if (!fileId || !sheetName || !range || !filterColumn || !filterValue) {
    res.status(400).json({
      error:
        "Se requieren los parámetros fileId, sheetName, range, filterColumn y filterValue ",
    });
    return;
  }

  try {
    const googleAuth = new GoogleAuth({
      keyFile: "./controllers/google-credentials.json", // Reemplaza con la ruta al archivo de credenciales JSON
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const authClient = await googleAuth.getClient();

    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: "name, mimeType",
    });

    if (
      !fileMetadata.data.mimeType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      res.status(400).json({ error: "El archivo no es un archivo de Excel" });
      return;
    }

    const excelFile = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );

    const workbook = xlsx.read(excelFile.data, { type: "buffer" });

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      res.status(404).json({ error: "No se encontró la hoja especificada" });
      return;
    }

    const jsonData = xlsx.utils.sheet_to_json(worksheet, { range });

    let filteredData = jsonData;

    if (filterColumn && filterValue !== undefined) {
      filteredData = jsonData.filter(
        (row) => row[filterColumn] === filterValue
      );
    }

    res.json(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos de Google Drive" });
  }
};

export const getHistoricoDiario = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT h.id, h.date, h.ticker, total_stock_grade, h.sector, h.industry, h.sub_industry, h.volume, preassure_daily, _5_days_presion, _10_days_presion, _20_days_presion, _50_days_presion, _100_days_presion, _200_days_presion, eps_date, quarter, surprise_percentage, ytd_var_percentage, var_price_high, h.close, category, change_percentage, _260_days_presion, bearish_preassure_score, bulish_preassure_score, qa1_var_percentage, qa2_var_percentage, qa3_var_percentage, roc_5, roc_10, roc_20, roc_50, roc_100, roc_200, roc_260, divergencia, var_price_low, correlation, rsi.oscilator_rsi_14 rsi_index,fase_principal_cp, fase_subyacente_cp, signal_alert_cp, fuerza_compra_venta_cp, signal_alert_mp, fuerza_compra_venta_mp, signal_alert_lp, fuerza_compra_venta_lp, market_capitalization FROM web_financial.listado_historico_general h LEFT OUTER JOIN web_financial.tos_market_capitalization mkp ON mkp.ticker = h.ticker AND cast(h.date as date)  = mkp.date LEFT OUTER JOIN web_financial.h_p_rsi rsi ON rsi.ticker = h.ticker AND rsi.date =h.date LEFT OUTER JOIN web_financial.fases_mercado fases ON fases.ticker = h.ticker AND fases.date =h.date LEFT OUTER JOIN web_financial.company_profile ON web_financial.company_profile.ticker = h.ticker where h.date = (select max(date) from web_financial.listado_historico_general) and isetf != $1 and exchange != $2 order by ticker",

      ["true", "Other OTC"]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getSectores = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT sector FROM web_financial.tos_sector_matrix where sector !=  $1 group by sector order by sector ",
      [""]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getIndustrias = async (req, res) => {
  try {
    const { sector } = req.body;

    let response = await pool.query(
      "SELECT industry FROM web_financial.tos_sector_matrix where sector = $1 group by industry order by industry",
      [sector]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getSubIndustrias = async (req, res) => {
  try {
    const { industry } = req.body;

    let response = await pool.query(
      "SELECT sub_industry FROM web_financial.tos_sector_matrix where industry = $1 group by sub_industry order by sub_industry",
      [industry]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getAverage = async (req, res) => {
  try {
    let response = await pool.query(
      "SELECT count(web_financial.h_p_volume.ticker) count_ticker, web_financial.tos_sector_matrix.sector, web_financial.tos_sector_matrix.industry, web_financial.tos_sector_matrix.sub_industry, cast (AVG (preassure_daily) as decimal (10,2)) calculo_1_day, " +
        "cast(AVG(_5_days_presion) as decimal (10, 2)) calculo_5_days, cast(AVG(_10_days_presion) as decimal (10, 2)) calculo_10_days, cast(AVG(_20_days_presion) as decimal (10, 2)) calculo_20_days, " +
        " cast (AVG (_50_days_presion) as decimal (10,2)) calculo_50_days, cast (AVG (_100_days_presion) as decimal (10,2)) calculo_100_days, cast (AVG (_200_days_presion) as decimal (10,2)) calculo_200_days, " +
        "cast (AVG (_260_days_presion) as decimal (10,2)) calculo_260_days FROM web_financial.h_p_volume LEFT OUTER JOIN web_financial.tos_sector_matrix on web_financial.h_p_volume.ticker = web_financial.tos_sector_matrix.ticker LEFT OUTER JOIN web_financial.company_profile ON web_financial.company_profile.ticker = web_financial.h_p_volume.ticker" +
        " where isetf != $1 and exchange != $2 and web_financial.tos_sector_matrix.sector != $3  and date = (select max(date) from web_financial.listado_historico_general ) group by web_financial.tos_sector_matrix.sector, web_financial.tos_sector_matrix.industry, web_financial.tos_sector_matrix.sub_industry",
      ["true", "Other OTC", ""]
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const getTickerSM = async (req, res) => {
  try {
    /*  const response = await pool.query(
      "select distinct(ticker) from web_financial.tos_sector_matrix"
    ); */
    const response = await pool.query(
      "SELECT DISTINCT tsm.ticker FROM web_financial.tos_historical_prices AS tsm WHERE tsm.date > '2023-06-01' AND NOT EXISTS (   SELECT 1 FROM web_financial.company_profile AS thp  WHERE tsm.ticker = thp.ticker );"
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

export const newProfile = async (req, res) => {
  try {
    const { symbols } = req.body;
    console.log(symbols);
    console.log("INICIO DEL FOR");

    let count = 0;
    let success = 0;
    let failure = 0;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Función para hacer una pausa entre llamados

    for (let i = 0; i < symbols.length; i++) {
      const ticker = symbols[i].ticker;
      /* const ticker = symbols[i]; */
      const endpoint = `${endpointBase}${ticker}?apikey=${api_key}`;

      try {
        // Realizar la solicitud HTTP a la API
        const response = await fetch(endpoint);

        if (!response.ok) {
          // Si la respuesta no es exitosa, aumentar el contador de fallos y continuar con la siguiente iteración del ciclo for
          failure++;
          continue;
        }

        /// Si la respuesta es exitosa, obtener los datos y agregarlos al array profiles
        const data = await response.json();
        if (Array.isArray(data) && data.length === 0) {
          // Si la respuesta es un array vacío, aumentar el contador de fallos y continuar con la siguiente iteración del ciclo for
          failure++;
          continue;
        }

        // Insertar el perfil en la base de datos
        await pool.query(
          "INSERT INTO web_financial.company_profile (isactivelytrading, address, beta, ceo, cik, city, companyname, country, currency, cusip, description, exchange, exchangeshortname, fulltimeemployees, image, industry, ipodate, isadr, isetf, isfund, isin, phone, range, record_date, sector, state, ticker, website, zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)",
          [
            data.profile.isActivelyTrading,
            data.profile.address,
            data.profile.beta,
            data.profile.ceo,
            data.profile.cik,
            data.profile.city,
            data.profile.companyName,
            data.profile.country,
            data.profile.currency,
            data.profile.cusip,
            data.profile.description,
            data.profile.exchange,
            data.profile.exchangeShortName,
            data.profile.fullTimeEmployees,
            data.profile.image,
            data.profile.industry,
            data.profile.ipoDate,
            data.profile.isAdr,
            data.profile.isEtf,
            data.profile.isFund,
            data.profile.isin,
            data.profile.phone,
            data.profile.range,
            new Date().toLocaleDateString(),
            data.profile.sector,
            data.profile.state,
            data.symbol,
            data.profile.website,
            data.profile.zip,
          ]
        );

        success++;
      } catch (error) {
        // Si ocurre un error, aumentar el contador de fallos y continuar con la siguiente iteración del ciclo for
        console.error(error);
        failure++;
        continue;
      }

      // Hacer una pausa de 4 segundos entre cada llamado a la API
      count++;
      if (count % 1500 === 0) {
        console.log(
          `Límite de llamados alcanzado. Haciendo una pausa de 1 minuto.`
        );
        await delay(120000);
      } else {
        await delay(4000);
      }
    }
    console.log("FIN DEL FOR");
    console.log(`Perfiles exitosos: ${success}, Perfiles fallidos: ${failure}`);

    return res.json({
      success: true,
      message: `Perfiles exitosos: ${success}, Perfiles fallidos: ${failure}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Ha ocurrido un error al guardar los perfiles",
    });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT ticker, companyname, description, exchangeshortname, image, website	FROM web_financial.company_profile;"
    );
    if (!response.rows) throw { code: 11000 };
    return res.json(response.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error de servidor" });
  }
};

//Alternativa buscando por ticker
/*  let byTicker = await pool.query('SELECT * FROM web_financial.company_profile WHERE ticker = $1 ', [ticker]);
        if (byTicker.rows[0]) throw ({ code: 11000 }) */
