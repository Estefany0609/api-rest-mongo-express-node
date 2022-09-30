import { Router } from "express";
import { createLink, getLink, getLinks, removeLink, updateLink } from "../controllers/link.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
import { bodyLinkValidator, paramLinkValidator } from "../middlewares/validatorManager.js";
const router = Router();

//GET              /api/v1/links         ALL LINKS
//GET              /api/v1/links/:id     SINGLE LINK
//POST            /api/v1/links          CREATE LINK
//PATCH/PUT       /api/v1/links/:id      Update
//DELETE          /api/v1/links/:id      Delete

router.get("/", requireToken, getLinks)
//router.get("/:id", requireToken, getLink)
router.get("/:nanoLink", getLink)
router.post("/", requireToken, bodyLinkValidator, createLink)
router.delete("/:id", requireToken, paramLinkValidator, removeLink)
router.patch("/:id", requireToken, paramLinkValidator, bodyLinkValidator, updateLink)


export default router;