# 🚀 Do Zero ao Milhão - Sistema Completo

Landing page premium + Backend automatizado para vendas de ebooks.

## 📦 Estrutura do Projeto

```
do-zero-ao-milhao/
├── frontend/                    # Landing page React + Vite
│   ├── src/
│   │   ├── App.tsx             # Componente principal
│   │   ├── pages/
│   │   │   └── SuccessPage.tsx # Página de sucesso
│   │   └── ...
│   ├── public/
│   │   ├── _headers            # Netlify headers de segurança
│   │   └── _redirects          # Netlify redirects
│   ├── index.html              # HTML com CSP e security headers
│   └── package.json
│
├── backend/                     # API Node.js + Express
│   ├── src/
│   │   ├── server.ts           # Servidor principal
│   │   ├── config/
│   │   │   └── env.ts          # Validação de variáveis (Zod)
│   │   ├── routes/
│   │   │   ├── checkout.ts     # Cria sessão Stripe
│   │   │   ├── webhook.ts      # Recebe eventos Stripe
│   │   │   ├── download.ts     # Entrega arquivo
│   │   │   ├── newsletter.ts   # Newsletter API
│   │   │   └── health.ts       # Health check
│   │   ├── services/
│   │   │   ├── database.ts     # PostgreSQL + Drizzle ORM
│   │   │   ├── email.ts        # Nodemailer + SendGrid
│   │   │   ├── newsletter.ts   # Mailchimp API
│   │   │   └── download.ts     # Tokens seguros
│   │   └── middleware/
│   │       └── error-handler.ts
│   ├── database.sql            # Schema do banco
│   ├── .env.example            # Template de variáveis
│   └── package.json
│
└── README.md                   # Este arquivo
```

## ✨ Funcionalidades

### 🎨 Frontend (Landing Page)
- ✅ Design premium inspirado em Apple
- ✅ Animações suaves (scroll reveal, parallax, hover effects)
- ✅ 100% responsivo (mobile, tablet, desktop)
- ✅ Performance otimizada (Lighthouse 95+)
- ✅ SEO completo (meta tags, Open Graph, Schema.org)
- ✅ Conversão otimizada (copywriting, CTAs estratégicos)

### 🔒 Segurança
- ✅ Proteção XSS (sanitização de inputs)
- ✅ Proteção CSRF (tokens + cookies seguros)
- ✅ SQL Injection protection (queries parametrizadas)
- ✅ Rate Limiting (100 req/15min global, 5 req/hora checkout)
- ✅ Validação de todos os formulários (Zod + express-validator)
- ✅ Anti-spam (honeypot fields)
- ✅ Anti-bots (rate limiting + honeypot)
- ✅ Secure Headers (Helmet.js, CSP, HSTS)
- ✅ Logs de erros e atividades (Winston)
- ✅ Preparado para Cloudflare (TRUST_PROXY)
- ✅ Apenas HTTPS (redirect automático)

### 🤖 Automação Completa
1. **Cliente realiza pagamento** → Stripe Checkout
2. **Stripe confirma** → Webhook recebido e validado
3. **Sistema processa** → Salva no PostgreSQL
4. **Envia e-mail automático** → Nodemailer + SendGrid
5. **Adiciona à newsletter** → Mailchimp API
6. **Gera token de download** → 256 bits, expira em 30 dias
7. **Página de sucesso** → Exibe confirmação ao cliente
8. **Registro de atividade** → Logs completos para análise

## 🛠️ Stack Tecnológica

### Frontend
- React 19 + TypeScript
- Vite 7 (build ultra-rápido)
- Tailwind CSS 4 (estilização)
- Framer Motion (animações)

### Backend
- Node.js 20+ + Express
- TypeScript
- PostgreSQL + Drizzle ORM
- Stripe API (pagamentos)
- Nodemailer + SendGrid (e-mails)
- Mailchimp API (newsletter)
- Zod (validação)
- Winston (logging)
- Helmet (segurança)

## 🚀 Deploy

### 1. Frontend (Vercel)

```bash
# Instale dependências
cd frontend
npm install

# Build
npm run build

# Deploy na Vercel
npm i -g vercel
vercel --prod
```

**Configurações Vercel:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2. Backend (Railway)

```bash
# Instale dependências
cd backend
npm install

# Configure variáveis
cp .env.example .env
# Edite .env com suas credenciais

# Deploy Railway
npm i -g @railway/cli
railway login
railway init
railway up
```

**Variáveis de Ambiente:**
- `NODE_ENV`: production
- `PORT`: 3000
- `TRUST_PROXY`: true
- `ALLOWED_ORIGINS`: https://seu-dominio.vercel.app
- `COOKIE_SECRET`: openssl rand -hex 64
- `STRIPE_SECRET_KEY`: sk_live_...
- `STRIPE_WEBHOOK_SECRET`: whsec_...
- `STRIPE_PRICE_ID`: price_...
- `DATABASE_URL`: postgresql://...
- `SENDGRID_API_KEY`: SG....
- `EMAIL_FROM`: contato@seudominio.com
- `DOWNLOAD_SECRET`: openssl rand -hex 64
- `DOWNLOAD_URL`: https://storage.googleapis.com/...
- `MAILCHIMP_API_KEY`: ...us21
- `MAILCHIMP_LIST_ID`: ...

### 3. Database (Supabase ou Railway)

```bash
# Execute o schema
psql -h host -U user -d database -f database.sql

# Ou via Supabase Dashboard
# SQL Editor → cole conteúdo de database.sql → Run
```

### 4. Stripe Webhook

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://api.seudominio.com/webhook/stripe`
3. Eventos: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
4. Copie o signing secret para `STRIPE_WEBHOOK_SECRET`

### 5. Storage (Google Cloud ou AWS S3)

Configure um bucket privado com:
- URL: `https://storage.googleapis.com/dozeroaomilhao-downloads`
- Access: Private
- CORS: Permitir domínio do frontend

## 📡 API Endpoints

### POST /checkout/session
Cria sessão de pagamento

```json
{
  "email": "cliente@email.com",
  "name": "João Silva"
}
```

Response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /webhook/stripe
Recebe eventos do Stripe (automático)

### GET /download/:token
Entrega arquivo após validação

### POST /newsletter/subscribe
Adiciona e-mail à newsletter

```json
{
  "email": "cliente@email.com",
  "name": "João Silva"
}
```

### GET /health
Health check

## 🔐 Segurança

### Frontend
- Content Security Policy (CSP)
- HTTPS only
- CORS configurado
- Sanitização de inputs
- Validação de formulários

### Backend
- Helmet.js (headers seguros)
- Rate limiting
- XSS protection
- SQL injection protection
- CSRF protection
- Honeypot anti-bot
- Validação Zod
- Logs de auditoria

## 📊 Monitoramento

### Logs
- `backend/logs/error.log` - Erros críticos
- `backend/logs/combined.log` - Todas as requisições

### Health Check
```bash
curl https://api.seudominio.com/health
```

### Stripe Dashboard
- Pagamentos em tempo real
- Webhooks logs
- Analytics

## 🎨 Customização

### Cores
Edite `tailwind.config.ts`:
```typescript
colors: {
  primary: "#F5C542",
  secondary: "#0A0A0A",
}
```

### Textos
Edite `src/App.tsx` - todos os textos estão inline nos componentes.

### Preços
Edite `backend/.env`:
- `STRIPE_PRICE_ID`: price_...

## 🐛 Debug

### Frontend
```bash
npm run dev
# Acesse http://localhost:5173
```

### Backend
```bash
npm run dev
# Acesse http://localhost:3000/health
```

### Logs
```bash
# Backend
tail -f backend/logs/combined.log

# Stripe
# Dashboard → Developers → Webhooks → Events
```

## 📝 Licença

MIT

## 🤝 Suporte

contato@dozeroaomilhao.com

---

**Construído com ❤️ para empreendedores que querem automatizar suas vendas.**
