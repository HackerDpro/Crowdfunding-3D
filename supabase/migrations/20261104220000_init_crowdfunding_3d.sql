-- Crowdfunding-3D Initial Schema, Security & Atomic RPCs
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Private schema for hashed admin code & participant edit tokens
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS app_private.admin_credentials (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  code_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_private.admin_credentials (id, code_hash)
VALUES (1, extensions.crypt('diego3d', extensions.gen_salt('bf')))
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION app_private.verify_admin(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM app_private.admin_credentials
    WHERE id = 1
      AND code_hash = extensions.crypt(trim(p_code), code_hash)
  );
END;
$$;

REVOKE ALL ON FUNCTION app_private.verify_admin(text) FROM PUBLIC, anon, authenticated;

-- 2. Campaign Settings (Singleton id = 1)
CREATE TABLE IF NOT EXISTS public.campaign_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  campaign_status text NOT NULL DEFAULT 'open' CHECK (campaign_status IN ('open', 'locked', 'completed')),
  organizer_name text NOT NULL DEFAULT 'Diego',
  include_organizer_in_split boolean NOT NULL DEFAULT true,
  printer_name text NOT NULL DEFAULT '3D Printer',
  printer_retail_cents int NOT NULL DEFAULT 17900 CHECK (printer_retail_cents >= 0),
  printer_discount_cents int NOT NULL DEFAULT 12000 CHECK (printer_discount_cents >= 0),
  printer_net_cents int NOT NULL DEFAULT 5900 CHECK (printer_net_cents >= 0),
  spool_count int NOT NULL DEFAULT 2 CHECK (spool_count >= 0 AND spool_count <= 50),
  spool_price_cents int NOT NULL DEFAULT 1099 CHECK (spool_price_cents >= 0),
  extra_cost_cents int NOT NULL DEFAULT 0,
  extra_cost_label text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'EUR',
  payment_enabled boolean NOT NULL DEFAULT false,
  payment_iban text NOT NULL DEFAULT '',
  payment_beneficiary text NOT NULL DEFAULT '',
  payment_link text NOT NULL DEFAULT '',
  payment_instructions text NOT NULL DEFAULT '',
  announcement_note text NOT NULL DEFAULT '',
  max_color_votes_per_person int NOT NULL DEFAULT 2 CHECK (max_color_votes_per_person >= 1 AND max_color_votes_per_person <= 10),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.campaign_settings (
  id,
  campaign_status,
  organizer_name,
  include_organizer_in_split,
  printer_name,
  printer_retail_cents,
  printer_discount_cents,
  printer_net_cents,
  spool_count,
  spool_price_cents,
  extra_cost_cents,
  max_color_votes_per_person
)
VALUES (1, 'open', 'Diego', true, '3D Printer', 17900, 12000, 5900, 2, 1099, 0, 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Filament Colors
CREATE TABLE IF NOT EXISTS public.filament_colors (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name_en text NOT NULL,
  name_nl text NOT NULL DEFAULT '',
  name_fr text NOT NULL DEFAULT '',
  name_es text NOT NULL DEFAULT '',
  hex text NOT NULL DEFAULT '#EA580C',
  material text NOT NULL DEFAULT 'PLA 1 kg',
  is_active boolean NOT NULL DEFAULT true,
  is_pinned boolean NOT NULL DEFAULT false,
  manual_votes_bonus int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.filament_colors (name_en, name_nl, name_fr, name_es, hex, material, sort_order)
SELECT * FROM (VALUES
  ('Matte Charcoal Black', 'Mat Houtskoolzwart', 'Noir Charbon Mat', 'Negro Carbón Mate', '#1F2421', 'PLA Matte · 1 kg', 1),
  ('Pure Arctic White', 'Puur Arctisch Wit', 'Blanc Arctique Pur', 'Blanco Ártico Puro', '#F3F2EE', 'PLA+ · 1 kg', 2),
  ('Maker Safety Orange', 'Maker Oranje', 'Orange Atelier', 'Naranja Taller', '#EA580C', 'PLA+ · 1 kg', 3),
  ('Cobalt Ocean Blue', 'Kobalt Oceaanblauw', 'Bleu Océan Cobalt', 'Azul Océano Cobalto', '#2563EB', 'PLA+ · 1 kg', 4),
  ('Alpine Forest Green', 'Alpen Bosgroen', 'Vert Forêt Alpin', 'Verde Bosque Alpino', '#16A34A', 'PLA Matte · 1 kg', 5),
  ('Crimson Ruby Red', 'Robijnrood', 'Rouge Rubis', 'Rojo Rubí', '#DC2626', 'PLA+ · 1 kg', 6),
  ('Warm Terracotta', 'Warme Terracotta', 'Terre Cuite Chaude', 'Terracota Cálido', '#C26D4A', 'PLA Matte · 1 kg', 7),
  ('Amber Silk Gold', 'Zijde Goudgeel', 'Or Ambré Soyeux', 'Oro Ámbar Seda', '#D97706', 'PLA Silk · 1 kg', 8)
) AS v(name_en, name_nl, name_fr, name_es, hex, material, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.filament_colors);

-- 4. Participants & Private Manage Tokens
CREATE TABLE IF NOT EXISTS public.participants (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  display_name text NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 60),
  contribution_mode text NOT NULL DEFAULT 'split_plus_extra' CHECK (contribution_mode IN ('split_plus_extra', 'fixed_minimum')),
  extra_cents int NOT NULL DEFAULT 0 CHECK (extra_cents >= 0),
  fixed_cents int NOT NULL DEFAULT 0 CHECK (fixed_cents >= 0),
  note text NOT NULL DEFAULT '' CHECK (length(note) <= 240),
  is_paid boolean NOT NULL DEFAULT false,
  preferred_locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_private.participant_tokens (
  participant_id uuid PRIMARY KEY REFERENCES public.participants(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Filament Color Votes
CREATE TABLE IF NOT EXISTS public.color_votes (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  color_id uuid NOT NULL REFERENCES public.filament_colors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, color_id)
);

-- 6. Row Level Security (Public Read, RPC-only Write)
ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filament_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read campaign_settings" ON public.campaign_settings;
CREATE POLICY "Public read campaign_settings" ON public.campaign_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read filament_colors" ON public.filament_colors;
CREATE POLICY "Public read filament_colors" ON public.filament_colors FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read participants" ON public.participants;
CREATE POLICY "Public read participants" ON public.participants FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read color_votes" ON public.color_votes;
CREATE POLICY "Public read color_votes" ON public.color_votes FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON public.campaign_settings, public.filament_colors, public.participants, public.color_votes TO anon, authenticated;

-- Enable Supabase Realtime on public tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_settings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.filament_colors;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.color_votes;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 7. Public RPC: Join Campaign (enforces amount >= Total / Total People atomically)
CREATE OR REPLACE FUNCTION public.join_campaign(
  p_name text,
  p_amount_cents int,
  p_mode text DEFAULT 'split_plus_extra',
  p_note text DEFAULT '',
  p_color_ids uuid[] DEFAULT ARRAY[]::uuid[],
  p_locale text DEFAULT 'en'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
DECLARE
  v_settings public.campaign_settings%ROWTYPE;
  v_clean_name text;
  v_clean_note text;
  v_clean_mode text;
  v_existing_count int;
  v_total_people int;
  v_total_goal_cents int;
  v_min_share_cents int;
  v_extra_cents int;
  v_fixed_cents int;
  v_participant_id uuid;
  v_raw_token text;
BEGIN
  -- Serialize against campaign_settings row so concurrent joins compute exact splits
  SELECT * INTO v_settings FROM public.campaign_settings WHERE id = 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SETTINGS_MISSING';
  END IF;

  IF v_settings.campaign_status <> 'open' THEN
    RAISE EXCEPTION 'CAMPAIGN_NOT_OPEN:%', v_settings.campaign_status;
  END IF;

  v_clean_name := trim(coalesce(p_name, ''));
  IF length(v_clean_name) < 1 OR length(v_clean_name) > 60 THEN
    RAISE EXCEPTION 'INVALID_NAME';
  END IF;

  v_clean_note := left(trim(coalesce(p_note, '')), 240);
  v_clean_mode := CASE WHEN p_mode = 'fixed_minimum' THEN 'fixed_minimum' ELSE 'split_plus_extra' END;

  SELECT count(*)::int INTO v_existing_count FROM public.participants;
  v_total_people := v_existing_count + (CASE WHEN v_settings.include_organizer_in_split THEN 1 ELSE 0 END) + 1;
  v_total_goal_cents := GREATEST(0, v_settings.printer_net_cents + (v_settings.spool_count * v_settings.spool_price_cents) + v_settings.extra_cost_cents);
  v_min_share_cents := (v_total_goal_cents + v_total_people - 1) / GREATEST(1, v_total_people);

  IF p_amount_cents IS NULL OR p_amount_cents < v_min_share_cents THEN
    RAISE EXCEPTION 'AMOUNT_BELOW_MINIMUM:%', v_min_share_cents;
  END IF;

  IF p_amount_cents > 500000 THEN
    RAISE EXCEPTION 'AMOUNT_TOO_HIGH';
  END IF;

  v_extra_cents := GREATEST(0, p_amount_cents - v_min_share_cents);
  v_fixed_cents := CASE WHEN v_clean_mode = 'fixed_minimum' THEN p_amount_cents ELSE 0 END;

  INSERT INTO public.participants (
    display_name,
    contribution_mode,
    extra_cents,
    fixed_cents,
    note,
    preferred_locale
  ) VALUES (
    v_clean_name,
    v_clean_mode,
    v_extra_cents,
    v_fixed_cents,
    v_clean_note,
    left(coalesce(p_locale, 'en'), 8)
  )
  RETURNING id INTO v_participant_id;

  v_raw_token := encode(extensions.gen_random_bytes(16), 'hex');
  INSERT INTO app_private.participant_tokens (participant_id, token_hash)
  VALUES (v_participant_id, extensions.crypt(v_raw_token, extensions.gen_salt('bf')));

  IF p_color_ids IS NOT NULL AND array_length(p_color_ids, 1) > 0 THEN
    INSERT INTO public.color_votes (participant_id, color_id)
    SELECT v_participant_id, c.id
    FROM public.filament_colors c
    WHERE c.id = ANY(p_color_ids)
      AND c.is_active = true
    ORDER BY c.sort_order ASC
    LIMIT v_settings.max_color_votes_per_person
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'participant_id', v_participant_id,
    'manage_token', v_raw_token,
    'min_share_cents', v_min_share_cents,
    'total_people', v_total_people,
    'total_goal_cents', v_total_goal_cents
  );
END;
$$;

-- 8. Public RPC: Update Own Participation (requires manage_token from browser)
CREATE OR REPLACE FUNCTION public.update_my_participation(
  p_participant_id uuid,
  p_manage_token text,
  p_name text,
  p_amount_cents int,
  p_mode text DEFAULT 'split_plus_extra',
  p_note text DEFAULT '',
  p_color_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
DECLARE
  v_settings public.campaign_settings%ROWTYPE;
  v_clean_name text;
  v_clean_note text;
  v_clean_mode text;
  v_existing_count int;
  v_total_people int;
  v_total_goal_cents int;
  v_min_share_cents int;
  v_extra_cents int;
  v_fixed_cents int;
BEGIN
  IF p_participant_id IS NULL OR p_manage_token IS NULL OR NOT EXISTS (
    SELECT 1
    FROM app_private.participant_tokens pt
    WHERE pt.participant_id = p_participant_id
      AND pt.token_hash = extensions.crypt(trim(p_manage_token), pt.token_hash)
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED_PARTICIPANT_TOKEN';
  END IF;

  SELECT * INTO v_settings FROM public.campaign_settings WHERE id = 1 FOR UPDATE;
  IF v_settings.campaign_status = 'completed' THEN
    RAISE EXCEPTION 'CAMPAIGN_COMPLETED';
  END IF;

  v_clean_name := trim(coalesce(p_name, ''));
  IF length(v_clean_name) < 1 OR length(v_clean_name) > 60 THEN
    RAISE EXCEPTION 'INVALID_NAME';
  END IF;

  v_clean_note := left(trim(coalesce(p_note, '')), 240);
  v_clean_mode := CASE WHEN p_mode = 'fixed_minimum' THEN 'fixed_minimum' ELSE 'split_plus_extra' END;

  SELECT count(*)::int INTO v_existing_count FROM public.participants;
  v_total_people := GREATEST(1, v_existing_count + (CASE WHEN v_settings.include_organizer_in_split THEN 1 ELSE 0 END));
  v_total_goal_cents := GREATEST(0, v_settings.printer_net_cents + (v_settings.spool_count * v_settings.spool_price_cents) + v_settings.extra_cost_cents);
  v_min_share_cents := (v_total_goal_cents + v_total_people - 1) / v_total_people;

  IF p_amount_cents IS NULL OR p_amount_cents < v_min_share_cents THEN
    RAISE EXCEPTION 'AMOUNT_BELOW_MINIMUM:%', v_min_share_cents;
  END IF;

  IF p_amount_cents > 500000 THEN
    RAISE EXCEPTION 'AMOUNT_TOO_HIGH';
  END IF;

  v_extra_cents := GREATEST(0, p_amount_cents - v_min_share_cents);
  v_fixed_cents := CASE WHEN v_clean_mode = 'fixed_minimum' THEN p_amount_cents ELSE 0 END;

  UPDATE public.participants
  SET
    display_name = v_clean_name,
    contribution_mode = v_clean_mode,
    extra_cents = v_extra_cents,
    fixed_cents = v_fixed_cents,
    note = v_clean_note,
    updated_at = now()
  WHERE id = p_participant_id;

  DELETE FROM public.color_votes WHERE participant_id = p_participant_id;
  IF p_color_ids IS NOT NULL AND array_length(p_color_ids, 1) > 0 THEN
    INSERT INTO public.color_votes (participant_id, color_id)
    SELECT p_participant_id, c.id
    FROM public.filament_colors c
    WHERE c.id = ANY(p_color_ids)
      AND c.is_active = true
    ORDER BY c.sort_order ASC
    LIMIT v_settings.max_color_votes_per_person
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'participant_id', p_participant_id,
    'min_share_cents', v_min_share_cents,
    'total_people', v_total_people
  );
END;
$$;

-- 8b. Public RPC: Quick 1-click Color Vote Update for Joined Participants
CREATE OR REPLACE FUNCTION public.update_my_color_votes(
  p_participant_id uuid,
  p_manage_token text,
  p_color_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
DECLARE
  v_settings public.campaign_settings%ROWTYPE;
BEGIN
  IF p_participant_id IS NULL OR p_manage_token IS NULL OR NOT EXISTS (
    SELECT 1
    FROM app_private.participant_tokens pt
    WHERE pt.participant_id = p_participant_id
      AND pt.token_hash = extensions.crypt(trim(p_manage_token), pt.token_hash)
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED_PARTICIPANT_TOKEN';
  END IF;

  SELECT * INTO v_settings FROM public.campaign_settings WHERE id = 1;
  IF v_settings.campaign_status = 'completed' THEN
    RAISE EXCEPTION 'CAMPAIGN_COMPLETED';
  END IF;

  DELETE FROM public.color_votes WHERE participant_id = p_participant_id;
  IF p_color_ids IS NOT NULL AND array_length(p_color_ids, 1) > 0 THEN
    INSERT INTO public.color_votes (participant_id, color_id)
    SELECT p_participant_id, c.id
    FROM public.filament_colors c
    WHERE c.id = ANY(p_color_ids)
      AND c.is_active = true
    ORDER BY c.sort_order ASC
    LIMIT v_settings.max_color_votes_per_person
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN true;
END;
$$;

-- 9. Admin RPCs
CREATE OR REPLACE FUNCTION public.admin_verify_code(p_admin_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
BEGIN
  RETURN app_private.verify_admin(p_admin_code);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_settings(
  p_admin_code text,
  p_patch jsonb
)
RETURNS public.campaign_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
DECLARE
  v_row public.campaign_settings%ROWTYPE;
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  UPDATE public.campaign_settings
  SET
    campaign_status = CASE
      WHEN p_patch ? 'campaign_status' AND (p_patch->>'campaign_status') IN ('open', 'locked', 'completed')
      THEN p_patch->>'campaign_status'
      ELSE campaign_status
    END,
    organizer_name = COALESCE(NULLIF(trim(p_patch->>'organizer_name'), ''), organizer_name),
    include_organizer_in_split = COALESCE((p_patch->>'include_organizer_in_split')::boolean, include_organizer_in_split),
    printer_name = COALESCE(NULLIF(trim(p_patch->>'printer_name'), ''), printer_name),
    printer_retail_cents = COALESCE(GREATEST(0, (p_patch->>'printer_retail_cents')::int), printer_retail_cents),
    printer_discount_cents = COALESCE(GREATEST(0, (p_patch->>'printer_discount_cents')::int), printer_discount_cents),
    printer_net_cents = COALESCE(GREATEST(0, (p_patch->>'printer_net_cents')::int), printer_net_cents),
    spool_count = COALESCE(LEAST(50, GREATEST(0, (p_patch->>'spool_count')::int)), spool_count),
    spool_price_cents = COALESCE(GREATEST(0, (p_patch->>'spool_price_cents')::int), spool_price_cents),
    extra_cost_cents = COALESCE((p_patch->>'extra_cost_cents')::int, extra_cost_cents),
    extra_cost_label = CASE WHEN p_patch ? 'extra_cost_label' THEN coalesce(p_patch->>'extra_cost_label', '') ELSE extra_cost_label END,
    payment_enabled = COALESCE((p_patch->>'payment_enabled')::boolean, payment_enabled),
    payment_iban = CASE WHEN p_patch ? 'payment_iban' THEN coalesce(p_patch->>'payment_iban', '') ELSE payment_iban END,
    payment_beneficiary = CASE WHEN p_patch ? 'payment_beneficiary' THEN coalesce(p_patch->>'payment_beneficiary', '') ELSE payment_beneficiary END,
    payment_link = CASE WHEN p_patch ? 'payment_link' THEN coalesce(p_patch->>'payment_link', '') ELSE payment_link END,
    payment_instructions = CASE WHEN p_patch ? 'payment_instructions' THEN coalesce(p_patch->>'payment_instructions', '') ELSE payment_instructions END,
    announcement_note = CASE WHEN p_patch ? 'announcement_note' THEN coalesce(p_patch->>'announcement_note', '') ELSE announcement_note END,
    max_color_votes_per_person = COALESCE(LEAST(10, GREATEST(1, (p_patch->>'max_color_votes_per_person')::int)), max_color_votes_per_person),
    updated_at = now()
  WHERE id = 1
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_color(
  p_admin_code text,
  p_id uuid DEFAULT NULL,
  p_name_en text DEFAULT '',
  p_name_nl text DEFAULT '',
  p_name_fr text DEFAULT '',
  p_name_es text DEFAULT '',
  p_hex text DEFAULT '#EA580C',
  p_material text DEFAULT 'PLA · 1 kg',
  p_is_active boolean DEFAULT true,
  p_is_pinned boolean DEFAULT false,
  p_manual_votes_bonus int DEFAULT 0,
  p_sort_order int DEFAULT 0
)
RETURNS public.filament_colors
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
DECLARE
  v_row public.filament_colors%ROWTYPE;
  v_clean_en text;
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  v_clean_en := trim(coalesce(p_name_en, ''));
  IF length(v_clean_en) < 1 THEN
    RAISE EXCEPTION 'COLOR_NAME_REQUIRED';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.filament_colors (
      name_en, name_nl, name_fr, name_es, hex, material, is_active, is_pinned, manual_votes_bonus, sort_order
    ) VALUES (
      v_clean_en,
      coalesce(NULLIF(trim(p_name_nl), ''), v_clean_en),
      coalesce(NULLIF(trim(p_name_fr), ''), v_clean_en),
      coalesce(NULLIF(trim(p_name_es), ''), v_clean_en),
      coalesce(NULLIF(trim(p_hex), ''), '#EA580C'),
      coalesce(NULLIF(trim(p_material), ''), 'PLA · 1 kg'),
      coalesce(p_is_active, true),
      coalesce(p_is_pinned, false),
      coalesce(p_manual_votes_bonus, 0),
      coalesce(p_sort_order, 0)
    )
    RETURNING * INTO v_row;
  ELSE
    UPDATE public.filament_colors
    SET
      name_en = v_clean_en,
      name_nl = coalesce(NULLIF(trim(p_name_nl), ''), v_clean_en),
      name_fr = coalesce(NULLIF(trim(p_name_fr), ''), v_clean_en),
      name_es = coalesce(NULLIF(trim(p_name_es), ''), v_clean_en),
      hex = coalesce(NULLIF(trim(p_hex), ''), hex),
      material = coalesce(NULLIF(trim(p_material), ''), material),
      is_active = coalesce(p_is_active, is_active),
      is_pinned = coalesce(p_is_pinned, is_pinned),
      manual_votes_bonus = coalesce(p_manual_votes_bonus, manual_votes_bonus),
      sort_order = coalesce(p_sort_order, sort_order)
    WHERE id = p_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_color(
  p_admin_code text,
  p_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  DELETE FROM public.filament_colors WHERE id = p_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_color_votes(
  p_admin_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  DELETE FROM public.color_votes;
  UPDATE public.filament_colors SET manual_votes_bonus = 0;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_manage_participant(
  p_admin_code text,
  p_action text,
  p_participant_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_mode text DEFAULT 'split_plus_extra',
  p_extra_cents int DEFAULT 0,
  p_fixed_cents int DEFAULT 0,
  p_note text DEFAULT '',
  p_is_paid boolean DEFAULT false,
  p_color_ids uuid[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  IF p_action = 'delete' THEN
    DELETE FROM public.participants WHERE id = p_participant_id;
    RETURN jsonb_build_object('ok', true, 'deleted', p_participant_id);
  ELSIF p_action = 'toggle_paid' THEN
    UPDATE public.participants
    SET is_paid = COALESCE(p_is_paid, NOT is_paid), updated_at = now()
    WHERE id = p_participant_id
    RETURNING id INTO v_id;
    RETURN jsonb_build_object('ok', true, 'participant_id', v_id);
  ELSIF p_action = 'create' THEN
    INSERT INTO public.participants (
      display_name,
      contribution_mode,
      extra_cents,
      fixed_cents,
      note,
      is_paid
    ) VALUES (
      trim(coalesce(p_name, 'Guest')),
      CASE WHEN p_mode = 'fixed_minimum' THEN 'fixed_minimum' ELSE 'split_plus_extra' END,
      GREATEST(0, coalesce(p_extra_cents, 0)),
      GREATEST(0, coalesce(p_fixed_cents, 0)),
      left(trim(coalesce(p_note, '')), 240),
      coalesce(p_is_paid, false)
    )
    RETURNING id INTO v_id;

    IF p_color_ids IS NOT NULL AND array_length(p_color_ids, 1) > 0 THEN
      INSERT INTO public.color_votes (participant_id, color_id)
      SELECT v_id, c.id FROM public.filament_colors c WHERE c.id = ANY(p_color_ids)
      ON CONFLICT DO NOTHING;
    END IF;

    RETURN jsonb_build_object('ok', true, 'participant_id', v_id);
  ELSIF p_action = 'update' THEN
    UPDATE public.participants
    SET
      display_name = COALESCE(NULLIF(trim(p_name), ''), display_name),
      contribution_mode = CASE WHEN p_mode IN ('split_plus_extra', 'fixed_minimum') THEN p_mode ELSE contribution_mode END,
      extra_cents = GREATEST(0, COALESCE(p_extra_cents, extra_cents)),
      fixed_cents = GREATEST(0, COALESCE(p_fixed_cents, fixed_cents)),
      note = CASE WHEN p_note IS NOT NULL THEN left(trim(p_note), 240) ELSE note END,
      is_paid = COALESCE(p_is_paid, is_paid),
      updated_at = now()
    WHERE id = p_participant_id
    RETURNING id INTO v_id;

    IF p_color_ids IS NOT NULL THEN
      DELETE FROM public.color_votes WHERE participant_id = v_id;
      IF array_length(p_color_ids, 1) > 0 THEN
        INSERT INTO public.color_votes (participant_id, color_id)
        SELECT v_id, c.id FROM public.filament_colors c WHERE c.id = ANY(p_color_ids)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;

    RETURN jsonb_build_object('ok', true, 'participant_id', v_id);
  ELSE
    RAISE EXCEPTION 'UNKNOWN_ACTION:%', p_action;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_change_code(
  p_admin_code text,
  p_new_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  IF p_new_code IS NULL OR length(trim(p_new_code)) < 4 THEN
    RAISE EXCEPTION 'NEW_CODE_TOO_SHORT';
  END IF;

  UPDATE app_private.admin_credentials
  SET code_hash = extensions.crypt(trim(p_new_code), extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = 1;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION
  public.join_campaign(text, int, text, text, uuid[], text),
  public.update_my_participation(uuid, text, text, int, text, text, uuid[]),
  public.update_my_color_votes(uuid, text, uuid[]),
  public.admin_verify_code(text),
  public.admin_update_settings(text, jsonb),
  public.admin_upsert_color(text, uuid, text, text, text, text, text, text, boolean, boolean, int, int),
  public.admin_delete_color(text, uuid),
  public.admin_reset_color_votes(text),
  public.admin_manage_participant(text, text, uuid, text, text, int, int, text, boolean, uuid[]),
  public.admin_change_code(text, text)
TO anon, authenticated;
