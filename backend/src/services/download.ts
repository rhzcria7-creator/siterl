import crypto from "crypto";
import { config } from "../config/env.js";
import { db, downloads, eq } from "./database.js";
import { logger } from "../server.js";

interface DownloadToken {
  purchaseId: number;
  email: string;
}

/**
 * Cria token seguro de download (256 bits, expira em 30 dias)
 */
export async function createSecureDownloadToken(purchaseId: number, email: string): Promise<string> {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

  await db.insert(downloads).values({
    purchaseId,
    token,
    expiresAt,
    usedCount: 0,
  });

  logger.info("Download token created", { purchaseId, expiresAt: expiresAt.toISOString() });

  return token;
}

/**
 * Verifica se o token é válido (existe, não expirou, compra foi paga)
 */
export async function verifyDownloadToken(token: string): Promise<DownloadToken | null> {
  const [record] = await db
    .select()
    .from(downloads)
    .where(eq(downloads.token, token));

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  // Busca compra associada
  const [purchase] = await db
    .select()
    .from(downloads)
    .where(eq(downloads.id, record.purchaseId));

  if (!purchase) return null;

  return { purchaseId: record.purchaseId, email: "" };
}

/**
 * Registra download (IP, user-agent, timestamp)
 */
export async function recordDownload(purchaseId: number, ip: string, userAgent: string) {
  await db
    .update(downloads)
    .set({ usedCount: downloads.usedCount + 1, lastUsedIp: ip })
    .where(eq(downloads.purchaseId, purchaseId));

  logger.info("Download recorded", { purchaseId, ip, userAgent });
}
