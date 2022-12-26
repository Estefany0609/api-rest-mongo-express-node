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