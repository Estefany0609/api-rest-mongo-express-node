import { Router } from "express";
import { infoUser, login, register, refreshToken, getUsers, } from "../controllers/auth.controller.js";
import {  logout, requireToken } from "../middlewares/requireToken.js";
import { requireRefreshToken } from "../middlewares/requireRefreshToken.js";
import { bodyLoginValidator, bodyRegisterValidator } from "../middlewares/validatorManager.js";
import { getTicker } from "../controllers/simulator.controller.js";

const router = Router();

router.post("/register",bodyRegisterValidator,register);
router.post("/login", bodyLoginValidator, login);
router.get("/user", getUsers);

router.get("/protected", requireToken, infoUser)
router.get("/refresh", requireRefreshToken, refreshToken)
router.get("/logout", logout)

export default router;


