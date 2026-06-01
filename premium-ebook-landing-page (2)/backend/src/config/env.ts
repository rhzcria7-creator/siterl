import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  TRUST_PROXY: z.boolean().default(false),

  // Domínios permitidos (CORS)
  ALLOWED_ORIGINS: z.string().default("https://dozeroaomilhao.com"),

  // Cookie secret (CSRF + sessão)
  COOKIE_SECRET: z.string().min(32),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PRICE_ID: z.string().startsWith("price_"),

  // Database (PostgreSQL)
  DATABASE_URL: z.string().startsWith("postgresql://"),

  // Email
  EMAIL_PROVIDER: z.enum(["sendgrid", "nodemailer"]).default("sendgrid"),
  SENDGRID_API_KEY: z.string().startsWith("SG.").optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string().default("Do Zero ao Milhão"),

  // Download seguro
  DOWNLOAD_SECRET: z.string().min(32),
  DOWNLOAD_URL: z.string().url(),

  // Newsletter
  MAILCHIMP_API_KEY: z.string().optional(),
  MAILCHIMP_LIST_ID: z.string().optional(),

  // Log
  LOG_LEVEL: z.string().default("info"),
});

type Env = z.infer<typeof envSchema>;

function loadConfig(): Env {
  // Carrega .env em desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    try {
      import("dotenv").then((dotenv) => dotenv.config());
    } catch {
      // dotenv não instalado - assume variáveis no ambiente
    }
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Configuração inválida:", result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
