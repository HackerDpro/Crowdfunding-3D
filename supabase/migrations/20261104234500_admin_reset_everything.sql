-- Atomic factory reset for every organizer/admin editable value.
-- Restores the original Bambu Lab A1 mini campaign and removes all joined people,
-- votes, custom colors, payment details, and admin-code changes.
CREATE OR REPLACE FUNCTION public.admin_reset_everything(p_admin_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private, extensions
AS $$
BEGIN
  IF NOT app_private.verify_admin(p_admin_code) THEN
    RAISE EXCEPTION 'INVALID_ADMIN_CODE';
  END IF;

  -- Serialize with joins, which take the same row lock while calculating shares.
  PERFORM 1 FROM public.campaign_settings WHERE id = 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SETTINGS_MISSING';
  END IF;

  -- Delete public participation data and every browser edit token.
  DELETE FROM public.color_votes;
  DELETE FROM app_private.participant_tokens;
  DELETE FROM public.participants;

  -- Restore every campaign/payment setting to its original default.
  UPDATE public.campaign_settings
  SET
    campaign_status = 'open',
    organizer_name = 'Diego',
    include_organizer_in_split = true,
    printer_name = 'Bambu Lab A1 mini 3D Printer',
    printer_retail_cents = 17900,
    printer_discount_cents = 12000,
    printer_net_cents = 5900,
    spool_count = 2,
    spool_price_cents = 1099,
    extra_cost_cents = 0,
    extra_cost_label = '',
    currency = 'EUR',
    payment_enabled = false,
    payment_iban = '',
    payment_beneficiary = '',
    payment_link = '',
    payment_instructions = '',
    announcement_note = '',
    max_color_votes_per_person = 2,
    updated_at = now()
  WHERE id = 1;

  -- Remove all custom color edits and restore the exact original catalog.
  DELETE FROM public.filament_colors;

  INSERT INTO public.filament_colors (
    name_en,
    name_nl,
    name_fr,
    name_es,
    hex,
    material,
    is_active,
    is_pinned,
    manual_votes_bonus,
    sort_order
  )
  SELECT
    v.name,
    v.name,
    v.name,
    v.name,
    v.hex,
    'Bambu PLA Basic · 1 kg',
    v.is_active,
    false,
    0,
    v.sort_order
  FROM (VALUES
    ('Jade White (10100)', '#FFFFFF', true, 1),
    ('Red (10200)', '#C12E1F', true, 2),
    ('Black (10101)', '#141414', true, 3),
    ('Bambu Green (10501)', '#00AE42', true, 4),
    ('Blue (10601)', '#0A2989', true, 5),
    ('Gray (10103)', '#8E9089', true, 6),
    ('Sunflower Yellow (10402)', '#FEC600', true, 7),
    ('Indigo Purple (10701)', '#482960', true, 8),
    ('Hot Pink (10204)', '#F5547C', true, 9),
    ('Pumpkin Orange (10301)', '#FF9016', true, 10),
    ('Cyan (10603)', '#0086D6', true, 11),
    ('Cocoa Brown (10802)', '#6F5034', false, 12),
    ('Mistletoe Green (10502)', '#3F8E43', false, 13)
  ) AS v(name, hex, is_active, sort_order);

  -- A factory reset also undoes admin-code changes. Keep the default server-side.
  UPDATE app_private.admin_credentials
  SET code_hash = extensions.crypt('diego3d', extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object(
    'ok', true,
    'participant_count', 0,
    'color_count', 13,
    'active_color_count', 11,
    'admin_code_reset', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reset_everything(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reset_everything(text) TO anon, authenticated;
