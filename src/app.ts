import express, { NextFunction, Request, Response } from "express";
import routers from "./modules/routers";
import { IError } from "./utilis/errors/types";

const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "salamtak-backend"
    });
});

app.use("/api/v1", routers);

app.use((err: IError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({
        msg: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        status: err.statusCode || 500
    });
});

export default app;
