-- ============================================
-- ALENFINOS HUB - Migration V2: Sincronização Completa
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- ============================================
-- SHOPPING (Lista de Compras)
-- ============================================
CREATE TABLE IF NOT EXISTS shopping_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  note TEXT,
  category_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quantity INT DEFAULT 1,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  assigned_to TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  completed_by TEXT
);

-- ============================================
-- CALENDAR (Calendário)
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  owner TEXT NOT NULL DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_comments (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  author_avatar TEXT NOT NULL DEFAULT '',
  author_color TEXT NOT NULL DEFAULT '#8b5cf6',
  text TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOALS (Metas)
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'outro',
  progress INT DEFAULT 0,
  target_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS goal_milestones (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

-- ============================================
-- PETS
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'other',
  breed TEXT,
  color TEXT,
  gender TEXT,
  birth_date TEXT,
  adoption_date TEXT,
  weight DECIMAL(8,2),
  microchip_id TEXT,
  is_neutered BOOLEAN DEFAULT FALSE,
  allergies TEXT[] DEFAULT '{}',
  diet_notes TEXT,
  vet_name TEXT,
  vet_phone TEXT,
  notes TEXT,
  photo_emoji TEXT DEFAULT '🐾',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_vaccinations (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  next_date TEXT,
  veterinarian TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pet_medical_records (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'outro',
  description TEXT NOT NULL,
  veterinarian TEXT,
  cost DECIMAL(10,2),
  notes TEXT
);

-- ============================================
-- MEALS (Cardápio)
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients TEXT,
  date_to_make TEXT NOT NULL,
  date_to_consume TEXT NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'almoco' CHECK (meal_type IN ('almoco', 'janta')),
  average_cost DECIMAL(10,2) DEFAULT 0,
  is_marmita BOOLEAN DEFAULT FALSE,
  owner TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAMILY FINANCE (Finanças Familiares)
-- ============================================
CREATE TABLE IF NOT EXISTS family_finance_state (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  current_month TEXT NOT NULL DEFAULT '03-2026',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_finance_entradas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_fixed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_finance_fixos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_fixed BOOLEAN DEFAULT TRUE,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_finance_creditos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'parcelamento' CHECK (type IN ('debito', 'credito', 'parcelamento', 'assinatura')),
  congelado BOOLEAN DEFAULT FALSE,
  progresso TEXT DEFAULT '',
  is_evelise BOOLEAN DEFAULT FALSE,
  paid BOOLEAN DEFAULT FALSE,
  start_month TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_finance_dividas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  descricao TEXT DEFAULT '',
  owner TEXT NOT NULL DEFAULT 'angelica' CHECK (owner IN ('angelica', 'isis')),
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_finance_problemas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  descricao TEXT DEFAULT '',
  encerra_em TEXT DEFAULT '',
  status TEXT DEFAULT '',
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_finance_termometro (
  id TEXT PRIMARY KEY,
  mes_ano TEXT NOT NULL,
  nome TEXT NOT NULL,
  saldo_inicial DECIMAL(12,2) DEFAULT 0,
  dias JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mes_ano)
);

-- ============================================
-- Enable Realtime for ALL new tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE goal_milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE pets;
ALTER PUBLICATION supabase_realtime ADD TABLE pet_vaccinations;
ALTER PUBLICATION supabase_realtime ADD TABLE pet_medical_records;
ALTER PUBLICATION supabase_realtime ADD TABLE meals;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_state;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_entradas;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_fixos;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_creditos;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_dividas;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_problemas;
ALTER PUBLICATION supabase_realtime ADD TABLE family_finance_termometro;

-- ============================================
-- Row Level Security (open — family use)
-- ============================================
ALTER TABLE shopping_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_fixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_problemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_finance_termometro ENABLE ROW LEVEL SECURITY;

-- Allow full access (family intranet — trusted)
CREATE POLICY "Allow all" ON shopping_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shopping_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON calendar_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON goal_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pet_vaccinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pet_medical_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_entradas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_fixos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_creditos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_dividas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_problemas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON family_finance_termometro FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_shopping_items_category ON shopping_items(category_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_comments_date ON calendar_comments(date);
CREATE INDEX idx_goals_workspace ON goals(workspace_id);
CREATE INDEX idx_goal_milestones_goal ON goal_milestones(goal_id);
CREATE INDEX idx_pet_vaccinations_pet ON pet_vaccinations(pet_id);
CREATE INDEX idx_pet_medical_records_pet ON pet_medical_records(pet_id);
CREATE INDEX idx_meals_date_consume ON meals(date_to_consume);
CREATE INDEX idx_ff_dividas_owner ON family_finance_dividas(owner);
CREATE INDEX idx_ff_termometro_mes ON family_finance_termometro(mes_ano);
