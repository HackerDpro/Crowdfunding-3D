-- Use the exact printer and Bambu Lab 1 kg filament-with-spool catalog.
UPDATE public.campaign_settings
SET printer_name = 'Bambu Lab A1 mini 3D Printer',
    updated_at = now()
WHERE id = 1;

-- Remove only the original placeholder palette; preserve any organizer-added colors.
DELETE FROM public.filament_colors
WHERE name_en IN (
  'Matte Charcoal Black',
  'Pure Arctic White',
  'Maker Safety Orange',
  'Cobalt Ocean Blue',
  'Alpine Forest Green',
  'Crimson Ruby Red',
  'Warm Terracotta',
  'Amber Silk Gold'
);

-- Names and SKUs intentionally stay official in every language.
-- Cocoa Brown and Mistletoe Green were unavailable/greyed out in the store picker,
-- so they are preloaded but hidden from public voting until enabled in Admin.
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
) AS v(name, hex, is_active, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.filament_colors c WHERE c.name_en = v.name
);
