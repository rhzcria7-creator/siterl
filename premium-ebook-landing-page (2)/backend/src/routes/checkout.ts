import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import Stripe from "stripe";
import { config } from "../config/env.js";
import { logger } from "../server.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const checkoutRouter = Router();

/**
 * POST /checkout/session
 * Cria uma sessão de checkout Stripe
 * 
 * Validação:
 * - Email válido e obrigatório
 * - Honeypot vazio (anti-bot)
 * - Rate limiting por IP
 */
checkoutRouter.post(
  "/session",
  [
    body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
    body("name").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Nome inválido"),
    body("hp_name").optional().isEmpty().withMessage("Campo inválido"), // honeypot
    body("hp_email").optional().isEmpty().withMessage("Campo inválido"), // honeypot
    body("hp_website").optional().isEmpty().withMessage("Campo inválido"), // honeypot
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Validation failed", { errors: errors.array(), ip: req.ip });
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() });
      }

      const { email, name } = req.body;

      // Cria sessão Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "boleto", "pix"],
        mode: "payment",
        success_url: `${config.ALLOWED_ORIGINS}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.ALLOWED_ORIGINS}/?cancel=1`,
        customer_email: email,
        metadata: {
          customer_name: name || "Não informado",
          product: "ebook-colecao-completa",
          source: "dozeroaomilhao.com",
        },
        line_items: [
          {
            price: config.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        // Coleta dados para entrega automática
        invoice_creation: { enabled: true },
        // Permite salvar cliente para futuras campanhas
        allow_promotion_codes: true,
      });

      logger.info("Checkout session created", {
        sessionId: session.id,
        email,
        ip: req.ip,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      logger.error("Checkout error", { error, ip: req.ip });
      next(error);
    }
  }
);
