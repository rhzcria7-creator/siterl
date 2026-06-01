import { Request, Response, NextFunction } from "express";
import winston from "winston";

export function errorHandler(logger: winston.Logger) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message, { stack: err.stack });

    // Não expõe detalhes do erro em produção
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    res.status(500).json({ error: err.message, stack: err.stack });
  };
}
