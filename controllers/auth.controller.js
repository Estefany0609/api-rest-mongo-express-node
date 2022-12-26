import { pool } from "../database/connectdb.js";
import { generateRefreshToken, generateToken } from "../utils/tokenManager.js";
import bcryptjs from "bcryptjs";

export const register = async(req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        //Alternativa buscando por email
        let userByEmail = await pool.query('SELECT * FROM web_financial.users WHERE email = $1 ', [email]);
        if (userByEmail.rows[0]) throw ({ code: 11000 })
        
        const salt = await bcryptjs.genSalt(10);
        const passwordBcrypt = await bcryptjs.hash(password, salt);
        
        pool.query('INSERT INTO web_financial.users (email, password) VALUES ($1, $2)',
            [email, passwordBcrypt])
                    
        const user = await pool.query('SELECT * FROM web_financial.users WHERE email = $1 ', [email]);
        //Generar el token
        const { token, expiresIn } = generateToken(user.rows[0].id)
        generateRefreshToken(user.rows[0].id, res);

        return res.status(201).json({ id: user.rows[0].id, token, expiresIn})
    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya existe este usuario" });
        }
        return res.status(500).json({ error: "Error de servidor" });
    }
}

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        
        let user = await pool.query('SELECT * FROM web_financial.users WHERE email = $1 ', [email]);
        if (!user.rows[0]) return res.status(403).json({ error: "No existe este usuario" });
 
        const respuestaPassword = await bcryptjs.compare(password,user.rows[0].password )
        
        if(!respuestaPassword) return res.status(403).json({ error: "Contraseña incorrecta" });
        
        //Generar el token
        const { token, expiresIn } = generateToken(user.rows[0].id)
        
        generateRefreshToken(user.rows[0].id, res);

        return res.json({id: user.rows[0].id,token,  expiresIn });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error de servidor" });
    }
}

export const infoUser = async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM web_financial.users WHERE id = $1 ',
            [req.uid]);
        return res.json({ email: user.rows[0].password, uid: user.rows[0].id });
    } catch (error) {
        return res.status(500).json({error: "Error de server"})
    }
}

export const getUsers = async (req, res) => {
    const response = await pool.query("SELECT * FROM web_financial.users")
    res.status(200).json(response.rows)
}

export const refreshToken = (req, res) => {
    try {
        const { token, expiresIn } = generateToken(req.uid);
        return res.json({ token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "error de servidor" })
    }
}