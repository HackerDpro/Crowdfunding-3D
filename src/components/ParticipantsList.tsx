import React from 'react'
import { Check, Crown, Shield, Users } from 'lucide-react'
import type {
  CampaignSettings,
  ColorVote,
  FilamentColor,
  Locale,
  Participant,
  SavedParticipationToken,
} from '../types'
import { TRANSLATIONS, interpolate } from '../i18n/translations'
import {
  computeParticipantContributionCents,
  formatEur,
  getLocalizedColorName,
  type PoolSummary,
} from '../lib/math'

interface ParticipantsListProps {
  locale: Locale
  settings: CampaignSettings
  summary: PoolSummary
  participants: Participant[]
  colors: FilamentColor[]
  votes: ColorVote[]
  savedTokens: SavedParticipationToken[]
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  locale,
  settings,
  summary,
  participants,
  colors,
  votes,
  savedTokens,
}) => {
  const t = TRANSLATIONS[locale]
  const myIds = new Set(savedTokens.map((tok) => tok.participant_id))
  const colorMap = new Map(colors.map((c) => [c.id, c]))

  return (
    <section id="ledger" className="border-t border-[#E6E0D5] bg-[#FAF8F4] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 7 Cols: Live Participant Pool */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              <Users className="h-3.5 w-3.5" />
              {t.ledger.eyebrow}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#181715] sm:text-3xl">
              {t.ledger.title} ({summary.currentTotalPeople})
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">{t.ledger.subtitle}</p>

            <div className="mt-6 space-y-3">
              {/* Organizer Row (when included in split) */}
              {settings.include_organizer_in_split && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#DFD8CC] bg-white p-4 shadow-2xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#181715] font-display text-sm font-bold text-[#FB923C]">
                      {settings.organizer_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#181715] sm:text-base">
                          {settings.organizer_name}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F1EA] px-2 py-0.5 text-[11px] font-semibold text-[#57534E]">
                          <Crown className="h-3 w-3 text-[#EA580C]" />
                          {t.ledger.organizerBadge}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B665E]">{t.ledger.equalShareTag}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono-num text-base font-bold text-[#181715] sm:text-lg">
                      {formatEur(summary.currentBaseShareCents, locale)}
                    </div>
                  </div>
                </div>
              )}

              {/* Joined Participants */}
              {participants.map((p) => {
                const effectiveAmount = computeParticipantContributionCents(
                  p,
                  summary.currentBaseShareCents
                )
                const extra = Math.max(0, effectiveAmount - summary.currentBaseShareCents)
                const pColors = votes
                  .filter((v) => v.participant_id === p.id)
                  .map((v) => colorMap.get(v.color_id))
                  .filter((c): c is FilamentColor => Boolean(c))

                const isMe = myIds.has(p.id)

                return (
                  <div
                    key={p.id}
                    className={`flex items-start justify-between gap-4 rounded-2xl border bg-white p-4 shadow-2xs ${
                      isMe ? 'border-[#EA580C]/60 ring-1 ring-[#EA580C]/15' : 'border-[#DFD8CC]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-display text-sm font-bold text-[#C2410C]">
                        {p.display_name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-display text-sm font-bold text-[#181715] sm:text-base">
                            {p.display_name}
                          </span>

                          {isMe && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#C2410C]">
                              {t.ledger.youBadge}
                            </span>
                          )}

                          {p.is_paid && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <Check className="h-2.5 w-2.5" />
                              {t.ledger.paidBadge}
                            </span>
                          )}
                        </div>

                        {p.note && (
                          <p className="mt-0.5 text-xs text-[#57534E] break-words">“{p.note}”</p>
                        )}

                        {pColors.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {pColors.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 rounded-md border border-[#E6E0D5] bg-[#FAF8F4] px-1.5 py-0.5 text-[10px] font-medium text-[#44403C]"
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-black/20"
                                  style={{ backgroundColor: c.hex }}
                                />
                                {getLocalizedColorName(c, locale)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono-num text-base font-bold text-[#181715] sm:text-lg">
                        {formatEur(effectiveAmount, locale)}
                      </div>
                      {extra > 0 ? (
                        <div className="font-mono-num text-[11px] font-semibold text-emerald-700">
                          +{formatEur(extra, locale)} {t.ledger.boostTag}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#78716C]">{t.ledger.equalShareTag}</div>
                      )}
                    </div>
                  </div>
                )
              })}

              {participants.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#D6CFC2] bg-white/70 p-6 text-center text-sm text-[#6B665E]">
                  {interpolate(t.ledger.emptyState, { organizer: settings.organizer_name })}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: 3-Step Fair Split Explainer */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[#DFD8CC] bg-white p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#EA580C]" />
                <h3 className="font-display text-lg font-bold text-[#181715]">
                  {t.ledger.howItWorksTitle}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-[#FAF8F4] p-4 border border-[#ECE7DD]">
                  <div className="font-display text-sm font-bold text-[#181715]">
                    {t.ledger.step1Title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    {t.ledger.step1Desc}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F4] p-4 border border-[#ECE7DD]">
                  <div className="font-display text-sm font-bold text-[#181715]">
                    {t.ledger.step2Title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    {t.ledger.step2Desc}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F4] p-4 border border-[#ECE7DD]">
                  <div className="font-display text-sm font-bold text-[#181715]">
                    {t.ledger.step3Title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    {t.ledger.step3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
