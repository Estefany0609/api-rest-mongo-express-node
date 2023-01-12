import { pool } from "../database/connectdb.js";

export const getHistoricoDiario = async (req, res) => {
    try {
        const response = await pool.query('SELECT DISTINCT ON (ticker) * FROM web_financial.listado_historico_general ORDER BY ticker, date DESC ');
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

/* export const getTicker = async (req, res) => {
    try {
        const { ticker } = req.body;

        let response = await pool.query('SELECT * FROM web_financial.tos_sector_matrix where ticker like $1 or company_name like $1 ', ["%"+ticker+"%"]);
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
}

export const getPrice = async (req, res) => {
    try {
        const { ticker } = req.body;

        let response = await pool.query('SELECT DISTINCT ON (ticker) close FROM web_financial.listado_historico_general where ticker = $1 ORDER BY ticker, date DESC  ', [ticker]);
        if (!response.rows) throw ({ code: 11000 })
        return res.json(response.rows)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de servidor" })
    }
} */