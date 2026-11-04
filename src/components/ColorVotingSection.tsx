import React, { useMemo, useState } from 'react'
import { Check, Palette, Pin, Sparkles } from 'lucide-react'
import type {
  CampaignSettings,
  ColorVote,
  ColorWithVotes,
  Locale,
  Participant,
  SavedParticipationToken,
} from '../types'
import { TRANSLATIONS, interpolate } from '../i18n/translations'
import { formatEur, getLocalizedColorName } from '../lib/math'
import { updateMyColorVotesRpc } from '../lib/supabase'
import { FilamentSpoolSvg } from './FilamentSpoolSvg'

interface ColorVotingSectionProps {
  locale: Locale
  settings: CampaignSettings
  rankedColors: ColorWithVotes[]
  participants: Participant[]
  votes: ColorVote[]
  savedTokens: SavedParticipationToken[]
  preselectedColorIds: string[]
  onPreselectedColorsChange: (ids: string[]) => void
  onRefresh: () => Promise<void>
  onScrollToJoin: () => void
  onToast: (msg: string) => void
}

export const ColorVotingSection: React.FC<ColorVotingSectionProps> = ({
  locale,
  settings,
  rankedColors,
  participants,
  votes,
  savedTokens,
  preselectedColorIds,
  onPreselectedColorsChange,
  onRefresh,
  onScrollToJoin,
  onToast,
}) => {
  const t = TRANSLATIONS[locale]
  const [savingColorId, setSavingColorId] = useState<string | null>(null)

  const myMatchedEntry = useMemo(() => {
    for (const tokenEntry of savedTokens) {
      const found = participants.find((p) => p.id === tokenEntry.participant_id)
      if (found) return { participant: found, token: tokenEntry.manage_token }
    }
    return null
  }, [savedTokens, participants])

  const myJoinedVoteIds = useMemo(() => {
    if (!myMatchedEntry) return []
    return votes
      .filter((v) => v.participant_id === myMatchedEntry.participant.id)
      .map((v) => v.color_id)
  }, [myMatchedEntry, votes])

  if (settings.spool_count <= 0 || rankedColors.length === 0) {
    return null
  }

  const maxVotes = settings.max_color_votes_per_person
  const highestVoteCount = Math.max(1, ...rankedColors.map((c) => c.voteCount))

  const handleToggleVote = async (colorId: string) => {
    if (myMatchedEntry) {
      if (settings.campaign_status === 'completed') return
      const current = myJoinedVoteIds
      let next: string[]
      if (current.includes(colorId)) {
        next = current.filter((id) => id !== colorId)
      } else if (current.length < maxVotes) {
        next = [...current, colorId]
      } else {
        next = [...current.slice(1), colorId]
      }

      setSavingColorId(colorId)
      try {
        await updateMyColorVotesRpc({
          participantId: myMatchedEntry.participant.id,
          manageToken: myMatchedEntry.token,
          colorIds: next,
        })
        await onRefresh()
        onToast(t.colors.votesSavedToast)
      } finally {
        setSavingColorId(null)
      }
    } else {
      // Not joined yet: pre-select for join form!
      if (preselectedColorIds.includes(colorId)) {
        onPreselectedColorsChange(preselectedColorIds.filter((id) => id !== colorId))
      } else if (preselectedColorIds.length < maxVotes) {
        onPreselectedColorsChange([...preselectedColorIds, colorId])
      } else {
        onPreselectedColorsChange([...preselectedColorIds.slice(1), colorId])
      }
    }
  }

  const activeSelectedIds = myMatchedEntry ? myJoinedVoteIds : preselectedColorIds

  return (
    <section id="colors" className="border-t border-[#E6E0D5] bg-[#F5F1EA]/65 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C2410C] border border-[#E6E0D5]">
              <Palette className="h-3.5 w-3.5" />
              {t.colors.eyebrow}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#181715] sm:text-3xl">
              {t.colors.title}
            </h2>
            <p className="mt-1 text-sm text-[#57534E] sm:text-base">
              {interpolate(t.colors.subtitle, {
                spools: settings.spool_count,
                price: formatEur(settings.spool_price_cents, locale),
                max: maxVotes,
              })}
            </p>
          </div>

          {!myMatchedEntry && settings.campaign_status === 'open' && (
            <button
              type="button"
              onClick={onScrollToJoin}
              className="rounded-xl border border-[#DFD8CC] bg-white px-3.5 py-2 text-xs font-bold text-[#292524] shadow-2xs hover:bg-[#FAF8F4] cursor-pointer"
            >
              {interpolate(t.colors.selectBeforeJoinHint, { max: maxVotes })}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rankedColors.map((color) => {
            const isSelected = activeSelectedIds.includes(color.id)
            const barWidthPct =
              color.voteCount > 0 ? Math.max(12, Math.round((color.voteCount / highestVoteCount) * 100)) : 0

            return (
              <div
                key={color.id}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-4 transition shadow-2xs ${
                  color.isLeadingSpool
                    ? 'border-[#181715] ring-1 ring-[#181715]/10'
                    : 'border-[#DFD8CC]'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3 min-h-[22px]">
                    {color.isLeadingSpool && color.spoolRank ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#181715] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        <Sparkles className="h-3 w-3 text-[#FB923C]" />
                        {interpolate(t.colors.leadingBadge, { rank: color.spoolRank })}
                      </span>
                    ) : (
                      <span />
                    )}

                    {color.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        <Pin className="h-2.5 w-2.5" />
                        {t.colors.pinnedBadge}
                      </span>
                    )}
                  </div>

                  {/* Spool SVG + Name */}
                  <div className="flex items-center gap-3.5">
                    <FilamentSpoolSvg hex={color.hex} size={56} className="shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-bold text-[#181715] leading-snug">
                        {getLocalizedColorName(color, locale)}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#78716C]">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full border border-black/15"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.material}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vote Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="font-mono-num font-bold text-[#181715]">
                        {color.voteCount}{' '}
                        <span className="font-sans font-normal text-[#6B665E]">
                          {color.voteCount === 1 ? t.hero.voteSingular : t.hero.votesCount}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#EFEAE1]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidthPct}%`,
                          backgroundColor: color.hex === '#F3F2EE' ? '#EA580C' : color.hex,
                        }}
                      />
                    </div>
                  </div>

                  {/* Voter Names */}
                  <div className="mt-2.5 min-h-[18px] text-[11px] text-[#6B665E] truncate">
                    {color.voterNames.length > 0 ? (
                      <span>
                        <strong className="font-semibold text-[#44403C]">
                          {t.colors.votersLabel}
                        </strong>{' '}
                        {color.voterNames.join(', ')}
                      </span>
                    ) : (
                      <span className="italic text-[#A8A29E]">{t.colors.noVotesYet}</span>
                    )}
                  </div>
                </div>

                {/* Vote Action Button */}
                {settings.campaign_status !== 'completed' && (
                  <button
                    type="button"
                    disabled={savingColorId === color.id}
                    onClick={() => handleToggleVote(color.id)}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#EA580C] text-white shadow-2xs hover:bg-[#C2410C]'
                        : 'border border-[#DFD8CC] bg-[#FAF8F4] text-[#181715] hover:bg-[#EFEAE1]'
                    }`}
                  >
                    {savingColorId === color.id ? (
                      <span>{t.colors.savingVotes}</span>
                    ) : isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{myMatchedEntry ? t.colors.votedBtn : t.colors.preselectedBtn}</span>
                      </>
                    ) : (
                      <span>{t.colors.voteBtn}</span>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
