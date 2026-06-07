import { Router, Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import { config } from "../config/env.js";
import { logger } from "../server.js";
import { verifyDownloadToken, recordDownload } from "../services/download.js";

export const downloadRouter = Router();

/**
 * GET /download/:token
 * Entrega o arquivo PDF apenas se o token for válido
 * 
 * Segurança:
 * - Token criptográfico (256 bits)
 * - Expira em 30 dias
 * - Rate limiting
 * - Registro de download
 */
downloadRouter.get(
  "/:token",
  [
    param("token").isString().isLength({ min: 40, max: 256 }).withMessage("Token inválido"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Token inválido" });
      }

      const { token } = req.params;

      // Valida token
      const valid = await verifyDownloadToken(token);
      if (!valid) {
        logger.warn("Invalid download token attempt", { token: token.substring(0, 10) + "...", ip: req.ip });
        return res.status(403).json({ error: "Token inválido ou expirado" });
      }

      // Registra download
      await recordDownload(valid.purchaseId, req.ip, req.headers["user-agent"] || "unknown");

      // Redirect para URL segura do arquivo (ex: AWS S3, Google Cloud Storage)
      const fileUrl = `${config.DOWNLOAD_URL}/${valid.purchaseId}/${config.DOWNLOAD_SECRET}/${token}.zip`;

      logger.info("Download served", { purchaseId: valid.purchaseId, ip: req.ip });

      res.redirect(302, fileUrl);
    } catch (error) {
      logger.error("Download error", { error, ip: req.ip });
      next(error);
    }
  }
);
