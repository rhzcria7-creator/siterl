-- Schema do banco de dados - Do Zero ao Milhão
-- Execute este script no PostgreSQL

-- Tabela de compras
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  product TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT DEFAULT 'pending' NOT NULL,
  paid_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_amount CHECK (amount >= 0)
);

-- Índice para busca rápida
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- Tabela de tokens de download
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_count INTEGER DEFAULT 0,
  last_used_ip TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_token CHECK (length(token) >= 40)
);

-- Índice para validação rápida de tokens
CREATE INDEX idx_downloads_token ON downloads(token);
CREATE INDEX idx_downloads_purchase_id ON downloads(purchase_id);
CREATE INDEX idx_downloads_expires_at ON downloads(expires_at);

-- Tabela de newsletter/leads
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  source TEXT DEFAULT 'website' NOT NULL,
  tags JSONB DEFAULT '[]',
  subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índice para segmentação
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_source ON subscribers(source);
CREATE INDEX idx_subscribers_subscribed_at ON subscribers(subscribed_at DESC);

-- Tabela de logs de atividade (auditoria)
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índice para análise
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger (opcional, para auditoria)
-- CREATE TRIGGER update_purchases_updated_at
--   BEFORE UPDATE ON purchases
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE purchases IS 'Registra todas as compras realizadas';
COMMENT ON TABLE downloads IS 'Tokens seguros para download de arquivos';
COMMENT ON TABLE subscribers IS 'Assinantes da newsletter';
COMMENT ON TABLE activity_logs IS 'Logs de auditoria de todas as ações';
