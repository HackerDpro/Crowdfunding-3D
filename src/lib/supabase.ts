import { createClient } from '@supabase/supabase-js'
import type {
  CampaignSettings,
  ColorVote,
  ContributionMode,
  FilamentColor,
  Locale,
  Participant,
  SavedParticipationToken,
} from '../types'

const DEFAULT_SUPABASE_URL = 'https://thqghrwcbchwyjzjwymz.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocWdocndjYmNod3lqemp3eW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MjIyNzEsImV4cCI6MjEwOTM5ODI3MX0.DhpbACnpEmTG_oyw_vNVUJY5LJ9-UYo-qDQReEKqsBw'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export const DEFAULT_SETTINGS: CampaignSettings = {
  id: 1,
  campaign_status: 'open',
  organizer_name: 'Diego',
  include_organizer_in_split: true,
  printer_name: '3D Printer',
  printer_retail_cents: 17900,
  printer_discount_cents: 12000,
  printer_net_cents: 5900,
  spool_count: 2,
  spool_price_cents: 1099,
  extra_cost_cents: 0,
  extra_cost_label: '',
  currency: 'EUR',
  payment_enabled: false,
  payment_iban: '',
  payment_beneficiary: '',
  payment_link: '',
  payment_instructions: '',
  announcement_note: '',
  max_color_votes_per_person: 2,
  updated_at: new Date().toISOString(),
}

export const DEFAULT_COLORS: FilamentColor[] = [
  {
    id: 'fallback-1',
    name_en: 'Matte Charcoal Black',
    name_nl: 'Mat Houtskoolzwart',
    name_fr: 'Noir Charbon Mat',
    name_es: 'Negro Carbón Mate',
    hex: '#1F2421',
    material: 'PLA Matte · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name_en: 'Pure Arctic White',
    name_nl: 'Puur Arctisch Wit',
    name_fr: 'Blanc Arctique Pur',
    name_es: 'Blanco Ártico Puro',
    hex: '#F3F2EE',
    material: 'PLA+ · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    name_en: 'Maker Safety Orange',
    name_nl: 'Maker Oranje',
    name_fr: 'Orange Atelier',
    name_es: 'Naranja Taller',
    hex: '#EA580C',
    material: 'PLA+ · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    name_en: 'Cobalt Ocean Blue',
    name_nl: 'Kobalt Oceaanblauw',
    name_fr: 'Bleu Océan Cobalt',
    name_es: 'Azul Océano Cobalto',
    hex: '#2563EB',
    material: 'PLA+ · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    name_en: 'Alpine Forest Green',
    name_nl: 'Alpen Bosgroen',
    name_fr: 'Vert Forêt Alpin',
    name_es: 'Verde Bosque Alpino',
    hex: '#16A34A',
    material: 'PLA Matte · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-6',
    name_en: 'Crimson Ruby Red',
    name_nl: 'Robijnrood',
    name_fr: 'Rouge Rubis',
    name_es: 'Rojo Rubí',
    hex: '#DC2626',
    material: 'PLA+ · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-7',
    name_en: 'Warm Terracotta',
    name_nl: 'Warme Terracotta',
    name_fr: 'Terre Cuite Chaude',
    name_es: 'Terracota Cálido',
    hex: '#C26D4A',
    material: 'PLA Matte · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-8',
    name_en: 'Amber Silk Gold',
    name_nl: 'Zijde Goudgeel',
    name_fr: 'Or Ambré Soyeux',
    name_es: 'Oro Ámbar Seda',
    hex: '#D97706',
    material: 'PLA Silk · 1 kg',
    is_active: true,
    is_pinned: false,
    manual_votes_bonus: 0,
    sort_order: 8,
    created_at: new Date().toISOString(),
  },
]

const TOKENS_STORAGE_KEY = 'crowdfunding3d_my_tokens_v1'

export function getSavedTokens(): SavedParticipationToken[] {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is SavedParticipationToken =>
        Boolean(item && typeof item.participant_id === 'string' && typeof item.manage_token === 'string')
    )
  } catch {
    return []
  }
}

export function saveParticipationToken(entry: SavedParticipationToken): void {
  try {
    const existing = getSavedTokens().filter((t) => t.participant_id !== entry.participant_id)
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify([entry, ...existing]))
  } catch {
    // ignore storage quota errors
  }
}

export interface CampaignBundle {
  settings: CampaignSettings
  colors: FilamentColor[]
  participants: Participant[]
  votes: ColorVote[]
  connected: boolean
}

export async function fetchCampaignBundle(): Promise<CampaignBundle> {
  const [settingsRes, colorsRes, participantsRes, votesRes] = await Promise.all([
    supabase.from('campaign_settings').select('*').eq('id', 1).single(),
    supabase.from('filament_colors').select('*').order('sort_order', { ascending: true }),
    supabase.from('participants').select('*').order('created_at', { ascending: true }),
    supabase.from('color_votes').select('*'),
  ])

  if (settingsRes.error) {
    throw settingsRes.error
  }

  return {
    settings: (settingsRes.data as CampaignSettings) ?? DEFAULT_SETTINGS,
    colors: ((colorsRes.data as FilamentColor[]) ?? DEFAULT_COLORS),
    participants: ((participantsRes.data as Participant[]) ?? []),
    votes: ((votesRes.data as ColorVote[]) ?? []),
    connected: true,
  }
}

export async function joinCampaignRpc(params: {
  name: string
  amountCents: number
  mode: ContributionMode
  note: string
  colorIds: string[]
  locale: Locale
}): Promise<{
  participant_id: string
  manage_token: string
  min_share_cents: number
  total_people: number
  total_goal_cents: number
}> {
  const { data, error } = await supabase.rpc('join_campaign', {
    p_name: params.name,
    p_amount_cents: params.amountCents,
    p_mode: params.mode,
    p_note: params.note,
    p_color_ids: params.colorIds,
    p_locale: params.locale,
  })
  if (error) throw error
  return data
}

export async function updateMyParticipationRpc(params: {
  participantId: string
  manageToken: string
  name: string
  amountCents: number
  mode: ContributionMode
  note: string
  colorIds: string[]
}): Promise<void> {
  const { error } = await supabase.rpc('update_my_participation', {
    p_participant_id: params.participantId,
    p_manage_token: params.manageToken,
    p_name: params.name,
    p_amount_cents: params.amountCents,
    p_mode: params.mode,
    p_note: params.note,
    p_color_ids: params.colorIds,
  })
  if (error) throw error
}

export async function updateMyColorVotesRpc(params: {
  participantId: string
  manageToken: string
  colorIds: string[]
}): Promise<void> {
  const { error } = await supabase.rpc('update_my_color_votes', {
    p_participant_id: params.participantId,
    p_manage_token: params.manageToken,
    p_color_ids: params.colorIds,
  })
  if (error) throw error
}

export async function verifyAdminCodeRpc(adminCode: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('admin_verify_code', {
    p_admin_code: adminCode,
  })
  if (error) throw error
  return Boolean(data)
}

export async function adminUpdateSettingsRpc(
  adminCode: string,
  patch: Partial<CampaignSettings>
): Promise<CampaignSettings> {
  const { data, error } = await supabase.rpc('admin_update_settings', {
    p_admin_code: adminCode,
    p_patch: patch,
  })
  if (error) throw error
  return data as CampaignSettings
}

export async function adminUpsertColorRpc(
  adminCode: string,
  color: {
    id?: string | null
    name_en: string
    name_nl?: string
    name_fr?: string
    name_es?: string
    hex: string
    material: string
    is_active: boolean
    is_pinned: boolean
    manual_votes_bonus: number
    sort_order: number
  }
): Promise<FilamentColor> {
  const { data, error } = await supabase.rpc('admin_upsert_color', {
    p_admin_code: adminCode,
    p_id: color.id ?? null,
    p_name_en: color.name_en,
    p_name_nl: color.name_nl ?? color.name_en,
    p_name_fr: color.name_fr ?? color.name_en,
    p_name_es: color.name_es ?? color.name_en,
    p_hex: color.hex,
    p_material: color.material,
    p_is_active: color.is_active,
    p_is_pinned: color.is_pinned,
    p_manual_votes_bonus: color.manual_votes_bonus,
    p_sort_order: color.sort_order,
  })
  if (error) throw error
  return data as FilamentColor
}

export async function adminDeleteColorRpc(adminCode: string, colorId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_color', {
    p_admin_code: adminCode,
    p_id: colorId,
  })
  if (error) throw error
}

export async function adminResetColorVotesRpc(adminCode: string): Promise<void> {
  const { error } = await supabase.rpc('admin_reset_color_votes', {
    p_admin_code: adminCode,
  })
  if (error) throw error
}

export async function adminManageParticipantRpc(
  adminCode: string,
  params: {
    action: 'create' | 'update' | 'toggle_paid' | 'delete'
    participantId?: string
    name?: string
    mode?: ContributionMode
    extraCents?: number
    fixedCents?: number
    note?: string
    isPaid?: boolean
    colorIds?: string[]
  }
): Promise<void> {
  const { error } = await supabase.rpc('admin_manage_participant', {
    p_admin_code: adminCode,
    p_action: params.action,
    p_participant_id: params.participantId ?? null,
    p_name: params.name ?? null,
    p_mode: params.mode ?? 'split_plus_extra',
    p_extra_cents: params.extraCents ?? 0,
    p_fixed_cents: params.fixedCents ?? 0,
    p_note: params.note ?? '',
    p_is_paid: params.isPaid ?? false,
    p_color_ids: params.colorIds ?? null,
  })
  if (error) throw error
}

export async function adminChangeCodeRpc(adminCode: string, newCode: string): Promise<void> {
  const { error } = await supabase.rpc('admin_change_code', {
    p_admin_code: adminCode,
    p_new_code: newCode,
  })
  if (error) throw error
}
