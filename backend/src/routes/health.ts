import { Router } from "express";

export const healthRouter = Router();

/**
 * GET /health
 * Verificação de saúde do servidor (para monitoramento)
 */
healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
