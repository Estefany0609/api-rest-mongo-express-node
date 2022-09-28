import { Router } from "express";
import { infoUser, login, register, refreshToken } from "../controllers/auth.controller.js";
import { body } from "express-validator";
import { validationResultExpress } from "../middlewares/validationResultExpress.js";
import {  logout, requireToken } from "../middlewares/requireToken.js";

const router = Router();

router.post("/register", [
    body("email", "Formato de Email incorrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "Minimo 6 caracteres")
        .trim()
        .isLength({ min: 6 }),
    body("password", "formato de password incorrecta")
        .custom((value, { req }) => {
            if (value !== req.body.repassword) {
                throw new Error("No coinciden las contraseñas")
            }
            return value
        })   
],
    validationResultExpress,
    register);

router.post("/login", [
    body("email", "Formato de Email incorrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "Minimo 6 caracteres")
        .trim()
        .isLength({ min: 6 }),
],
    validationResultExpress,    
    login);


router.get("/protected", requireToken, infoUser)
router.get("/refresh", refreshToken)
router.get("/logout", logout)

export default router;

