import { pool } from "../database/connectdb.js";
import fetch from 'node-fetch'; 

const endpointBase = 'https://financialmodelingprep.com/api/v3/company/profile/';
const api_key = process.env.API_FINANCIAL;

export const getHistoricoDiario = async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM web_financial.listado_historico_general where date = (select max(date) from web_financial.listado_historico_general ) ORDER BY ticker ');
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const getSectores = async (req, res) => {
    try {
        const response = await pool.query('SELECT sector FROM web_financial.tos_sector_matrix where sector !=  $1 group by sector order by sector ', [""]);
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const getIndustrias = async (req, res) => {
    try {
        const { sector } = req.body;

        let response = await pool.query('SELECT industry FROM web_financial.tos_sector_matrix where sector = $1 group by industry order by industry', [sector]);
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const getSubIndustrias = async (req, res) => {
    try {
        const { industry } = req.body;

        let response = await pool.query('SELECT sub_industry FROM web_financial.tos_sector_matrix where industry = $1 group by sub_industry order by sub_industry', [industry]);
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const getAverage = async (req, res) => {
    try {
        let response = await pool.query(
            'SELECT count(web_financial.h_p_volume.ticker) count_ticker, sector, industry, sub_industry, cast (AVG (preassure_daily) as decimal (10,2)) calculo_1_day, ' +
            'cast(AVG(_5_days_presion) as decimal (10, 2)) calculo_5_days, cast(AVG(_10_days_presion) as decimal (10, 2)) calculo_10_days, cast(AVG(_20_days_presion) as decimal (10, 2)) calculo_20_days, ' +
            ' cast (AVG (_50_days_presion) as decimal (10,2)) calculo_50_days, cast (AVG (_100_days_presion) as decimal (10,2)) calculo_100_days, cast (AVG (_200_days_presion) as decimal (10,2)) calculo_200_days, ' +
            'cast (AVG (_260_days_presion) as decimal (10,2)) calculo_260_days FROM web_financial.h_p_volume LEFT OUTER JOIN web_financial.tos_sector_matrix on web_financial.h_p_volume.ticker = web_financial.tos_sector_matrix.ticker ' +
            ' where category = $1 and date = (select max(date) from web_financial.listado_historico_general ) group by sector, industry, sub_industry',  ['stock'] );
        if (!response.rows) throw ({ code: 11000 }) 
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const getTickerSM = async (req, res) => {
    try {
        const response = await pool.query('select distinct(ticker) from web_financial.tos_sector_matrix');
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const newProfile = async (req, res) => {
    try {
        const { symbols } = req.body;
        console.log(symbols)
        console.log("INICIO DEL FOR"); 

        let count = 0;
        let success = 0;
        let failure = 0;

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); // Función para hacer una pausa entre llamados

        for (let i = 0; i < symbols.length; i++) {
            const ticker = symbols[i].ticker;
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
                await pool.query('INSERT INTO web_financial.company_profile (isactivelytrading, address, beta, ceo, cik, city, companyname, country, currency, cusip, description, exchange, exchangeshortname, fulltimeemployees, image, industry, ipodate, isadr, isetf, isfund, isin, phone, range, record_date, sector, state, ticker, website, zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)',
                    [data.profile.isActivelyTrading,
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
                    data.profile.zip]);

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
    
        
        return res.json({ success: true, message: "Perfiles guardados exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Ha ocurrido un error al guardar los perfiles" });
    }
}


//Alternativa buscando por ticker
       /*  let byTicker = await pool.query('SELECT * FROM web_financial.company_profile WHERE ticker = $1 ', [ticker]);
        if (byTicker.rows[0]) throw ({ code: 11000 }) */