-- Connection history table for WhatsApp instances
-- Tracks connection events: connected, disconnected, created, deleted, error

CREATE TABLE IF NOT EXISTS historico_conexoes (
  id BIGSERIAL PRIMARY KEY,
  instancia_id BIGINT REFERENCES instancias_whatsapp(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries by instance and time
CREATE INDEX IF NOT EXISTS idx_historico_instancia ON historico_conexoes(instancia_id, created_at DESC);

-- Enable RLS
ALTER TABLE historico_conexoes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view history for instances in their organization
CREATE POLICY "Users can view history for their org instances"
  ON historico_conexoes
  FOR SELECT
  USING (
    instancia_id IN (
      SELECT i.id FROM instancias_whatsapp i
      JOIN usuarios_sistema u ON u.id_organizacao = i.id_organizacao
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Policy: Users can insert history for instances in their organization
CREATE POLICY "Users can insert history for their org instances"
  ON historico_conexoes
  FOR INSERT
  WITH CHECK (
    instancia_id IN (
      SELECT i.id FROM instancias_whatsapp i
      JOIN usuarios_sistema u ON u.id_organizacao = i.id_organizacao
      WHERE u.auth_user_id = auth.uid()
    )
  );
