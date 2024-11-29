import express from "express";
import { homeGet } from "../controllers/index.controller";

const router = express.Router();

/* GET home page. */
router.get("/", homeGet);

export default router;
