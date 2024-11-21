import { Request, Response } from "express";

const notFoundRouter = (req: Request, res: Response) => {
    res.status(404).json({
        error: 404,
        message: "Route not found."
    });
};

export default notFoundRouter;
