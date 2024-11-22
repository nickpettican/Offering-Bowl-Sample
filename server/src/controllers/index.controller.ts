import { Request, Response } from "express";

/* GET home page. */
export const homeGet = (req: Request, res: Response) => {
    res.json({ message: "Welcome to Offering Bowl!" });
};

