import { Request, Response, NextFunction } from "express";
import winston from "winston";
export declare function errorHandler(logger: winston.Logger): (err: Error, _req: Request, res: Response, _next: NextFunction) => any;
//# sourceMappingURL=error-handler.d.ts.map