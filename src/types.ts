export type Locale = 'en' | 'nl' | 'fr' | 'es'

export type CampaignStatus = 'open' | 'locked' | 'completed'

export type ContributionMode = 'split_plus_extra' | 'fixed_minimum'

export interface CampaignSettings {
  id: number
  campaign_status: CampaignStatus
  organizer_name: string
  include_organizer_in_split: boolean
  printer_name: string
  printer_retail_cents: number
  printer_discount_cents: number
  printer_net_cents: number
  spool_count: number
  spool_price_cents: number
  extra_cost_cents: number
  extra_cost_label: string
  currency: string
  payment_enabled: boolean
  payment_iban: string
  payment_beneficiary: string
  payment_link: string
  payment_instructions: string
  announcement_note: string
  max_color_votes_per_person: number
  updated_at: string
}

export interface FilamentColor {
  id: string
  name_en: string
  name_nl: string
  name_fr: string
  name_es: string
  hex: string
  material: string
  is_active: boolean
  is_pinned: boolean
  manual_votes_bonus: number
  sort_order: number
  created_at: string
}

export interface Participant {
  id: string
  display_name: string
  contribution_mode: ContributionMode
  extra_cents: number
  fixed_cents: number
  note: string
  is_paid: boolean
  preferred_locale: string
  created_at: string
  updated_at: string
}

export interface ColorVote {
  id: string
  participant_id: string
  color_id: string
  created_at: string
}

export interface SavedParticipationToken {
  participant_id: string
  manage_token: string
}

export interface ColorWithVotes extends FilamentColor {
  voteCount: number
  voterNames: string[]
  isLeadingSpool: boolean
  spoolRank: number | null
}
