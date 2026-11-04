import type {
  CampaignSettings,
  ColorVote,
  ColorWithVotes,
  FilamentColor,
  Locale,
  Participant,
} from '../types'

/**
 * Total shared goal in integer euro cents:
 * printer_net_cents + (spool_count * spool_price_cents) + extra_cost_cents
 */
export function computeTotalGoalCents(settings: CampaignSettings): number {
  const total =
    settings.printer_net_cents +
    settings.spool_count * settings.spool_price_cents +
    settings.extra_cost_cents
  return Math.max(0, Math.round(total))
}

/**
 * Exact integer-cent ceiling of (totalGoalCents / totalPeople).
 * Guarantees that every participant's minimum share is NEVER less than Total / Total People.
 */
export function computeEqualShareCents(totalGoalCents: number, totalPeople: number): number {
  const n = Math.max(1, Math.floor(totalPeople))
  if (totalGoalCents <= 0) return 0
  return Math.floor((totalGoalCents + n - 1) / n)
}

/**
 * Effective contribution in cents for an existing participant at a given current base share.
 * Guaranteed >= baseShareCents in all cases.
 */
export function computeParticipantContributionCents(
  participant: Pick<Participant, 'contribution_mode' | 'extra_cents' | 'fixed_cents'>,
  baseShareCents: number
): number {
  if (participant.contribution_mode === 'fixed_minimum') {
    return Math.max(baseShareCents, participant.fixed_cents)
  }
  return baseShareCents + Math.max(0, participant.extra_cents)
}

export interface PoolSummary {
  totalGoalCents: number
  filamentTotalCents: number
  organizerCount: number
  participantCount: number
  currentTotalPeople: number
  joinTotalPeople: number
  currentBaseShareCents: number
  joinMinShareCents: number
  totalCommittedCents: number
  extraBoostPoolCents: number
  paidParticipantsCount: number
  paidAmountCents: number
}

export function computePoolSummary(
  settings: CampaignSettings,
  participants: Participant[]
): PoolSummary {
  const totalGoalCents = computeTotalGoalCents(settings)
  const filamentTotalCents = Math.max(0, settings.spool_count * settings.spool_price_cents)
  const organizerCount = settings.include_organizer_in_split ? 1 : 0
  const participantCount = participants.length
  const currentTotalPeople = Math.max(1, organizerCount + participantCount)
  const joinTotalPeople = organizerCount + participantCount + 1

  const currentBaseShareCents = computeEqualShareCents(totalGoalCents, currentTotalPeople)
  const joinMinShareCents = computeEqualShareCents(totalGoalCents, joinTotalPeople)

  const organizerContribution = organizerCount > 0 ? currentBaseShareCents : 0
  let participantsTotalCents = 0
  let paidParticipantsCount = 0
  let paidAmountCents = 0

  for (const p of participants) {
    const amount = computeParticipantContributionCents(p, currentBaseShareCents)
    participantsTotalCents += amount
    if (p.is_paid) {
      paidParticipantsCount += 1
      paidAmountCents += amount
    }
  }

  const totalCommittedCents =
    organizerCount + participantCount > 0 ? organizerContribution + participantsTotalCents : 0
  const baseCoveredCents = currentBaseShareCents * (organizerCount + participantCount)
  const extraBoostPoolCents = Math.max(0, totalCommittedCents - baseCoveredCents)

  return {
    totalGoalCents,
    filamentTotalCents,
    organizerCount,
    participantCount,
    currentTotalPeople,
    joinTotalPeople,
    currentBaseShareCents,
    joinMinShareCents,
    totalCommittedCents,
    extraBoostPoolCents,
    paidParticipantsCount,
    paidAmountCents,
  }
}

export function computeColorsWithVotes(
  colors: FilamentColor[],
  votes: ColorVote[],
  participants: Participant[],
  spoolCount: number,
  includeInactive = false
): ColorWithVotes[] {
  const participantMap = new Map(participants.map((p) => [p.id, p.display_name]))
  const filtered = includeInactive ? colors : colors.filter((c) => c.is_active)

  const enriched = filtered.map((color) => {
    const colorVotes = votes.filter((v) => v.color_id === color.id)
    const voterNames = colorVotes
      .map((v) => participantMap.get(v.participant_id))
      .filter((n): n is string => Boolean(n))
    const voteCount = Math.max(0, colorVotes.length + (color.manual_votes_bonus || 0))
    return {
      ...color,
      voteCount,
      voterNames,
      isLeadingSpool: false,
      spoolRank: null as number | null,
    }
  })

  // Rank active colors: pinned first, then highest voteCount, then sort_order
  const activeRanked = [...enriched]
    .filter((c) => c.is_active)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount
      return a.sort_order - b.sort_order
    })

  const topIds = new Map<string, number>()
  activeRanked.slice(0, Math.max(0, spoolCount)).forEach((c, idx) => {
    topIds.set(c.id, idx + 1)
  })

  return enriched
    .map((c) => ({
      ...c,
      isLeadingSpool: topIds.has(c.id),
      spoolRank: topIds.get(c.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount
      return a.sort_order - b.sort_order
    })
}

const LOCALE_FORMAT_MAP: Record<Locale, string> = {
  en: 'en-IE',
  nl: 'nl-BE',
  fr: 'fr-BE',
  es: 'es-ES',
}

export function formatEur(cents: number, locale: Locale = 'en'): string {
  const value = cents / 100
  return new Intl.NumberFormat(LOCALE_FORMAT_MAP[locale] || 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getLocalizedColorName(color: FilamentColor, locale: Locale): string {
  if (locale === 'nl' && color.name_nl) return color.name_nl
  if (locale === 'fr' && color.name_fr) return color.name_fr
  if (locale === 'es' && color.name_es) return color.name_es
  return color.name_en
}

export function centsToInputString(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function parseEuroInputToCents(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!normalized) return null
  const num = Number(normalized)
  if (!Number.isFinite(num) || num < 0) return null
  return Math.round(num * 100)
}
