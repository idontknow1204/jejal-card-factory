-- ============================================================
-- JeJal Card Factory — Supabase Schema v2
-- Run this in the Supabase SQL Editor to initialize the database.
-- All timestamps are UTC.
-- ============================================================

-- ============================================================
-- 1. card_projects
-- ============================================================
CREATE TABLE card_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  topic        TEXT NOT NULL,
  content_type TEXT NOT NULL,
  card_count   INT  DEFAULT 5,
  status       TEXT DEFAULT 'draft',
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. card_drafts
-- Claude-generated story structure (cards_json) per project.
-- ============================================================
CREATE TABLE card_drafts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  cards_json        JSONB NOT NULL,
  source_docs       JSONB,
  generation_prompt TEXT,
  model             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. copy_revisions
-- Per-card copy edits made by the CMO.
-- ============================================================
CREATE TABLE copy_revisions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  card_number    INT  NOT NULL,
  previous_text  TEXT,
  revised_text   TEXT,
  feedback_text  TEXT,
  approved       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. image_prompt_revisions
-- Per-card image prompt edits.
-- ============================================================
CREATE TABLE image_prompt_revisions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id               UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  card_number              INT  NOT NULL,
  previous_prompt          TEXT,
  revised_prompt           TEXT,
  previous_negative_prompt TEXT,
  revised_negative_prompt  TEXT,
  feedback_text            TEXT,
  approved                 BOOLEAN DEFAULT FALSE,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. generated_character_images
-- GPT-Image (OpenAI) results per card.
-- ============================================================
CREATE TABLE generated_character_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  card_number     INT  NOT NULL,
  prompt          TEXT,
  negative_prompt TEXT,
  provider        TEXT,
  model           TEXT,
  image_url       TEXT,
  approved        BOOLEAN DEFAULT FALSE,
  rejected_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. rendered_cards
-- Final composited card PNGs.
-- ============================================================
CREATE TABLE rendered_cards (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  card_number          INT  NOT NULL,
  top_text             TEXT,
  character_image_url  TEXT,
  rendered_image_url   TEXT,
  template_type        TEXT,
  approved             BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. final_card_sets
-- CMO-approved final set with quality feedback.
-- ============================================================
CREATE TABLE final_card_sets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  final_cards_json JSONB,
  final_image_urls JSONB,
  rating           INT,
  is_jejal_like    BOOLEAN,
  why_good         TEXT,
  what_to_improve  TEXT,
  approved         BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. approved_examples
-- Learning data: approved posts saved as future generation context.
-- ============================================================
CREATE TABLE approved_examples (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES card_projects(id) ON DELETE SET NULL,
  title            TEXT,
  topic            TEXT,
  reusable_pattern TEXT,
  final_cards_json JSONB,
  final_image_urls JSONB,
  why_it_works     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. rejected_examples
-- Learning data: rejected posts with rejection reason.
-- ============================================================
CREATE TABLE rejected_examples (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES card_projects(id) ON DELETE SET NULL,
  reason     TEXT,
  cards_json JSONB,
  image_urls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. figma_exports
-- Tracks each Figma export attempt per project.
-- ============================================================
CREATE TABLE figma_exports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES card_projects(id) ON DELETE CASCADE,
  figma_file_id  TEXT,
  figma_file_url TEXT,
  figma_page_id  TEXT,
  export_status  TEXT DEFAULT 'pending',
  exported_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_card_projects_status     ON card_projects (status);
CREATE INDEX idx_card_projects_created_at ON card_projects (created_at);
CREATE INDEX idx_card_drafts_project_id                ON card_drafts (project_id);
CREATE INDEX idx_copy_revisions_project_id             ON copy_revisions (project_id);
CREATE INDEX idx_image_prompt_revisions_project_id     ON image_prompt_revisions (project_id);
CREATE INDEX idx_generated_character_images_project_id ON generated_character_images (project_id);
CREATE INDEX idx_rendered_cards_project_id             ON rendered_cards (project_id);
CREATE INDEX idx_final_card_sets_project_id            ON final_card_sets (project_id);

-- ============================================================
-- UPDATED_AT TRIGGER — card_projects only
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_projects_updated_at
  BEFORE UPDATE ON card_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE card_projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_drafts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_revisions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_prompt_revisions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_character_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendered_cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_card_sets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_examples           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejected_examples           ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_exports               ENABLE ROW LEVEL SECURITY;

-- Permissive policies: authenticated users have full access.
-- Server routes use service role (bypasses RLS automatically).
CREATE POLICY "authenticated_all" ON card_projects
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON card_drafts
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON copy_revisions
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON image_prompt_revisions
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON generated_character_images
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON rendered_cards
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON final_card_sets
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON approved_examples
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON rejected_examples
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "authenticated_all" ON figma_exports
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- STORAGE BUCKETS
-- Run this block separately if the storage extension is enabled.
-- Alternatively, create buckets in the Supabase Dashboard → Storage.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('brand-assets',     'brand-assets',     FALSE),
  ('character-images', 'character-images',  TRUE),
  ('rendered-cards',   'rendered-cards',    FALSE),
  ('figma-exports',    'figma-exports',     FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can read/write their buckets.
CREATE POLICY "authenticated_read" ON storage.objects
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "authenticated_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated USING (TRUE);
