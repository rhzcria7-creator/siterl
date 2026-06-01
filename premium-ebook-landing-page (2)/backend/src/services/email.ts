import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { logger } from "../server.js";

interface PurchaseEmail {
  to: string;
  name: string;
  downloadToken: string;
  purchaseId: number;
  amount: number;
}

function getTransporter() {
  if (config.EMAIL_PROVIDER === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: config.SENDGRID_API_KEY!,
      },
    });
  }

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
}

export async function sendPurchaseEmail(data: PurchaseEmail) {
  const transporter = getTransporter();
  const downloadUrl = `${config.ALLOWED_ORIGINS}/download/${data.downloadToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: #0A0A0A; border-radius: 16px; padding: 40px; border: 1px solid rgba(245, 197, 66, 0.2); }
        .logo { color: #F5C542; font-size: 24px; font-weight: 600; letter-spacing: 0.15em; margin-bottom: 30px; }
        h1 { color: #fff; font-size: 28px; margin: 0 0 20px; }
        p { color: #B3B3B3; line-height: 1.6; margin: 16px 0; }
        .btn { display: inline-block; background: #F5C542; color: #000; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .social { margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
        .social a { color: #F5C542; text-decoration: none; margin-right: 16px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">DO ZERO AO MILHÃO</div>
        <h1>Obrigado pela compra, ${data.name}!</h1>
        <p>Sua compra foi confirmada e seu material já está liberado.</p>
        <p><strong>Valor pago:</strong> R$ ${data.amount.toFixed(2)}</p>
        <p><strong>ID da compra:</strong> #${data.purchaseId}</p>
        <a href="${downloadUrl}" class="btn">Baixar Ebooks Agora</a>
        <p>O link expira em 30 dias. Guarde este e-mail.</p>
        
        <div class="social">
          <p>📱 Me acompanhe nas redes:</p>
          <a href="https://instagram.com">Instagram</a>
          <a href="https://twitter.com">Twitter</a>
          <a href="https://youtube.com">YouTube</a>
        </div>
        
        <div class="footer">
          <p>Este é um e-mail automático. Se você não fez esta compra, ignore este e-mail.</p>
          <p>© ${new Date().getFullYear()} Do Zero ao Milhão</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
      to: data.to,
      subject: "✓ Compra confirmada — Do Zero ao Milhão",
      html,
      text: `Obrigado pela compra, ${data.name}! Seu material: ${downloadUrl}`,
    });

    logger.info("Purchase email sent", { to: data.to, purchaseId: data.purchaseId });
  } catch (error) {
    logger.error("Failed to send purchase email", { error, to: data.to });
    throw error;
  }
}
