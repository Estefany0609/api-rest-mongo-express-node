import jwt from "jsonwebtoken";
import { tokenVerificationErrors } from "../utils/tokenManager.js";

/* export const requireTokenAnterior = (req, res, next) => {
    try {
        let token = req.headers?.authorization;

        if (!token) throw new Error("No Bearer")
        
        token = token.split(" ")[1];
        const { uid} = jwt.verify(token, process.env.JWT_SECRET)
        
        req.uid = uid;
        next();

    } catch (error) {
        console.log(error);
        
        const tokenVerificationErrors = {
            "invalid signature": "la firma del JWT no es valida",
            "jwt expired": "JWT expirado",
            "invalid token": "Token no valido",
            "No Bearer": "Utiliza el formato Bearer",
            "jwt malformed" : "JWT formato no valido"
        };
        return res
            .status(401)
            .send({error: tokenVerificationErrors[error.message] })
        
        //return res.status(401).json({error: error.message})
    }

} */

export const requireToken = (req, res, next) => {
    try {
        let token = req.headers?.authorization;

        if (!token) throw new Error("No Bearer")
        
        token = token.split(" ")[1];
        
        const { uid } = jwt.verify(token, process.env.JWT_SECRET)
        req.uid = uid;

        next();

    } catch (error) {
        console.log(error);
        return res
            .status(401)
            .send({error: tokenVerificationErrors[error.message] })
        
        //return res.status(401).json({error: error.message})
    }

}

export const logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ok: true})
}