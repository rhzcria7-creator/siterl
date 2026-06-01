import express from "express";
import { Router, Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { config } from "../config/env.js";
import { logger } from "../server.js";
import { db, purchases, eq } from "../services/database.js";
import { sendPurchaseEmail } from "../services/email.js";
import { addSubscriber } from "../services/newsletter.js";
import { createSecureDownloadToken } from "../services/download.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const webhookRouter = Router();

/**
 * POST /webhook/stripe
 * Recebe eventos do Stripe (pagamento confirmado)
 * 
 * Segurança:
 * - Valida assinatura do webhook (anti-spoofing)
 * - Idempotente (processa apenas uma vez)
 * - Log completo de atividade
 */
webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"];

    // 1. Valida assinatura (anti-spoofing)
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      logger.error("Webhook signature verification failed", { error: err.message });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Processa apenas checkout.session.completed (pagamento confirmado)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        // Salva a compra no banco (idempotente via unique constraint)
        const purchase = await db.transaction(async (tx) => {
          const [existing] = await tx.select().from(purchases).where(eq(purchases.stripeSessionId, session.id));
          if (existing) {
            logger.info("Duplicate webhook event - skipping", { sessionId: session.id });
            return existing;
          }

          const [inserted] = await tx.insert(purchases).values({
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            email: session.customer_email!,
            name: session.metadata?.customer_name || "Cliente",
            product: session.metadata?.product || "ebook-colecao-completa",
            amount: session.amount_total ? session.amount_total / 100 : 329.90,
            currency: session.currency || "brl",
            status: "completed",
            paidAt: new Date(),
            metadata: session.metadata,
          }).returning();

          return inserted;
        });

        // 3. Gera token seguro de download (válido por 30 dias)
        const downloadToken = await createSecureDownloadToken(purchase.id, purchase.email);

        // 4. Envia e-mail automático
        await sendPurchaseEmail({
          to: purchase.email,
          name: purchase.name,
          downloadToken,
          purchaseId: purchase.id,
          amount: purchase.amount,
        });

        // 5. Adiciona à newsletter automaticamente
        await addSubscriber({
          email: purchase.email,
          name: purchase.name,
          source: "purchase",
          tags: ["comprador", "colecao-completa"],
        }).catch((err) => {
          logger.warn("Newsletter subscription failed (non-critical)", { error: err.message, email: purchase.email });
        });

        // 6. Log da atividade
        logger.info("Purchase completed and automated", {
          purchaseId: purchase.id,
          email: purchase.email,
          amount: purchase.amount,
          stripeSessionId: session.id,
        });

        return res.json({ received: true });
      } catch (error) {
        logger.error("Failed to process purchase", { error, sessionId: session.id });
        // Retorna 500 para Stripe tentar novamente
        return res.status(500).json({ error: "Processing failed" });
      }
    }

    // Outros eventos (pagamento falhou, reembolso, etc.)
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      logger.info("Checkout expired", { sessionId: session.id });
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      logger.warn("Charge refunded", { chargeId: charge.id });
    }

    res.json({ received: true });
  }
);
