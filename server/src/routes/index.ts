import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", (req: express.Request, res: express.Response) => {
    res.json({ message: "Welcome to Offering Bowl!" });
});

export default router;
