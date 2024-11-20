import express from "express";

const notFoundRouter = (req: express.Request, res: express.Response) => {
    res.status(404).json({
        error: 404,
        message: "Route not found."
    });
};

export default notFoundRouter;
