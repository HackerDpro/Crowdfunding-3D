import React, { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Lock,
  Minus,
  Plus,
  Sparkles,
  UserPlus,
  Wallet,
} from 'lucide-react'
import type {
  CampaignSettings,
  ColorVote,
  ColorWithVotes,
  ContributionMode,
  Locale,
  Participant,
  SavedParticipationToken,
} from '../types'
import { TRANSLATIONS, interpolate } from '../i18n/translations'
import {
  centsToInputString,
  computeParticipantContributionCents,
  formatEur,
  getLocalizedColorName,
  parseEuroInputToCents,
  type PoolSummary,
} from '../lib/math'
import {
  joinCampaignRpc,
  saveParticipationToken,
  updateMyParticipationRpc,
} from '../lib/supabase'

interface JoinCardProps {
  locale: Locale
  settings: CampaignSettings
  summary: PoolSummary
  participants: Participant[]
  votes: ColorVote[]
  activeColors: ColorWithVotes[]
  savedTokens: SavedParticipationToken[]
  onTokensUpdated: () => void
  onRefresh: () => Promise<void>
  preselectedColorIds: string[]
  onPreselectedColorsChange: (ids: string[]) => void
  onToast: (msg: string) => void
}

export const JoinCard: React.FC<JoinCardProps> = ({
  locale,
  settings,
  summary,
  participants,
  votes,
  activeColors,
  savedTokens,
  onTokensUpdated,
  onRefresh,
  preselectedColorIds,
  onPreselectedColorsChange,
  onToast,
}) => {
  const t = TRANSLATIONS[locale]

  // Match the latest saved token on this device that still exists in participants
  const myMatchedEntry = useMemo(() => {
    for (const tokenEntry of savedTokens) {
      const found = participants.find((p) => p.id === tokenEntry.participant_id)
      if (found) {
        return { participant: found, token: tokenEntry.manage_token }
      }
    }
    return null
  }, [savedTokens, participants])

  const [addingAnother, setAddingAnother] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  const isEditMode = Boolean(myMatchedEntry && isEditingExisting && !addingAnother)
  const showPersonalJoinedView = Boolean(myMatchedEntry && !isEditingExisting && !addingAnother)

  // Effective minimum share for the form:
  // - If joining as a new person: Total / (CurrentPeople + 1)
  // - If editing existing entry: Total / CurrentPeople
  const minShareCents = isEditMode ? summary.currentBaseShareCents : summary.joinMinShareCents
  const formulaPeopleCount = isEditMode ? summary.currentTotalPeople : summary.joinTotalPeople

  const [name, setName] = useState('')
  const [amountInput, setAmountInput] = useState(() => centsToInputString(minShareCents))
  const [hasCustomAmount, setHasCustomAmount] = useState(false)
  const [mode, setMode] = useState<ContributionMode>('split_plus_extra')
  const [note, setNote] = useState('')
  const [editColorIds, setEditColorIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [ibanCopied, setIbanCopied] = useState(false)

  // Keep amountInput synced with live minShareCents if user hasn't typed a custom override
  useEffect(() => {
    if (!hasCustomAmount && !isEditMode) {
      setAmountInput(centsToInputString(minShareCents))
    }
  }, [minShareCents, hasCustomAmount, isEditMode])

  const startEditingExisting = () => {
    if (!myMatchedEntry) return
    const p = myMatchedEntry.participant
    const currentAmount = computeParticipantContributionCents(p, summary.currentBaseShareCents)
    const myVoteIds = votes
      .filter((v) => v.participant_id === p.id)
      .map((v) => v.color_id)

    setName(p.display_name)
    setAmountInput(centsToInputString(currentAmount))
    setHasCustomAmount(currentAmount > summary.currentBaseShareCents)
    setMode(p.contribution_mode)
    setNote(p.note || '')
    setEditColorIds(myVoteIds)
    setErrorMsg(null)
    setIsEditingExisting(true)
  }

  const parsedCents = parseEuroInputToCents(amountInput)
  const isBelowMin = parsedCents === null || parsedCents < minShareCents
  const extraCents = parsedCents !== null && parsedCents > minShareCents ? parsedCents - minShareCents : 0

  const roundUpTargetCents = useMemo(() => {
    // Next clean €5 multiple strictly above minShareCents
    const euros = Math.ceil(minShareCents / 100)
    const nextFive = Math.ceil((euros + 1) / 5) * 5
    return Math.max(minShareCents + 100, nextFive * 100)
  }, [minShareCents])

  const selectedColorIds = isEditMode ? editColorIds : preselectedColorIds
  const setSelectedColorIds = isEditMode ? setEditColorIds : onPreselectedColorsChange

  const toggleColorChoice = (colorId: string) => {
    const maxVotes = settings.max_color_votes_per_person
    if (selectedColorIds.includes(colorId)) {
      setSelectedColorIds(selectedColorIds.filter((id) => id !== colorId))
    } else if (selectedColorIds.length < maxVotes) {
      setSelectedColorIds([...selectedColorIds, colorId])
    } else {
      // Replace oldest selection so tapping feels smooth
      setSelectedColorIds([...selectedColorIds.slice(1), colorId])
    }
  }

  const applyPresetAmount = (targetCents: number) => {
    const safe = Math.max(minShareCents, targetCents)
    setAmountInput(centsToInputString(safe))
    setHasCustomAmount(safe > minShareCents)
    setErrorMsg(null)
  }

  const stepAmount = (deltaCents: number) => {
    const current = parsedCents ?? minShareCents
    const next = Math.max(minShareCents, current + deltaCents)
    setAmountInput(centsToInputString(next))
    setHasCustomAmount(next > minShareCents)
    setErrorMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMsg(t.join.errorNameRequired)
      return
    }

    if (parsedCents === null || parsedCents < minShareCents) {
      setErrorMsg(
        interpolate(t.join.errorBelowMin, {
          min: formatEur(minShareCents, locale),
        })
      )
      return
    }

    const effectiveMode: ContributionMode = extraCents > 0 ? mode : 'split_plus_extra'

    setSubmitting(true)
    try {
      if (isEditMode && myMatchedEntry) {
        await updateMyParticipationRpc({
          participantId: myMatchedEntry.participant.id,
          manageToken: myMatchedEntry.token,
          name: trimmedName,
          amountCents: parsedCents,
          mode: effectiveMode,
          note: note.trim(),
          colorIds: selectedColorIds,
        })
        await onRefresh()
        setIsEditingExisting(false)
        onToast(t.join.updatedToast)
      } else {
        const res = await joinCampaignRpc({
          name: trimmedName,
          amountCents: parsedCents,
          mode: effectiveMode,
          note: note.trim(),
          colorIds: selectedColorIds,
          locale,
        })
        saveParticipationToken({
          participant_id: res.participant_id,
          manage_token: res.manage_token,
        })
        onTokensUpdated()
        await onRefresh()
        setName('')
        setNote('')
        setHasCustomAmount(false)
        setAddingAnother(false)
        onPreselectedColorsChange([])
        onToast(t.join.joinedToast)

        try {
          confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.65 },
            colors: ['#EA580C', '#16A34A', '#2563EB', '#F59E0B'],
          })
        } catch {
          // ignore confetti errors in headless browsers
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('AMOUNT_BELOW_MINIMUM:')) {
        const serverMin = Number(msg.split('AMOUNT_BELOW_MINIMUM:')[1]) || minShareCents
        setErrorMsg(
          interpolate(t.join.errorBelowMin, {
            min: formatEur(serverMin, locale),
          })
        )
      } else {
        setErrorMsg(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyIban = async () => {
    if (!settings.payment_iban) return
    try {
      await navigator.clipboard.writeText(settings.payment_iban)
      setIbanCopied(true)
      setTimeout(() => setIbanCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const renderPaymentBox = (amountToPayCents: number) => {
    if (!settings.payment_enabled) return null
    const hasAnyPaymentDetail =
      settings.payment_iban.trim() ||
      settings.payment_link.trim() ||
      settings.payment_instructions.trim()
    if (!hasAnyPaymentDetail) return null

    return (
      <div className="mt-5 rounded-2xl border border-[#DFD8CC] bg-[#FAF8F4] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#181715]">
            <Wallet className="h-4 w-4 text-[#EA580C]" />
            <span>{t.join.paymentTitle}</span>
          </div>
          <span className="font-mono-num text-sm font-bold text-[#EA580C]">
            {formatEur(amountToPayCents, locale)}
          </span>
        </div>

        {settings.payment_beneficiary.trim() && (
          <div className="text-xs text-[#57534E]">
            <span className="font-semibold text-[#181715]">{t.join.paymentBeneficiary}:</span>{' '}
            {settings.payment_beneficiary}
          </div>
        )}

        {settings.payment_iban.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6E0D5] bg-white px-3 py-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                {t.join.paymentIban}
              </div>
              <div className="font-mono-num text-xs font-semibold text-[#181715] sm:text-sm">
                {settings.payment_iban}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyIban}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3EFE8] px-2.5 py-1.5 text-xs font-semibold text-[#181715] hover:bg-[#E7E1D6] cursor-pointer"
            >
              {ibanCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  {t.join.ibanCopied}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {t.join.copyIban}
                </>
              )}
            </button>
          </div>
        )}

        {settings.payment_instructions.trim() && (
          <p className="text-xs leading-relaxed text-[#57534E]">{settings.payment_instructions}</p>
        )}

        {settings.payment_link.trim() && (
          <a
            href={settings.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#181715] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#292524]"
          >
            <span>
              {t.join.openPaymentLink} ({formatEur(amountToPayCents, locale)})
            </span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    )
  }

  return (
    <section id="join" className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            {t.join.sectionEyebrow}
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-[#181715] sm:text-4xl">
            {t.join.title}
          </h2>
          <p className="mt-2 text-sm text-[#57534E] sm:text-base">{t.join.subtitle}</p>
        </div>

        {/* Status Banner if Locked or Completed and user hasn't joined */}
        {settings.campaign_status !== 'open' && !showPersonalJoinedView && !isEditMode ? (
          <div className="rounded-3xl border border-[#DFD8CC] bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-[#181715]">
              {settings.campaign_status === 'locked'
                ? t.join.lockedBannerTitle
                : t.join.completedBannerTitle}
            </h3>
            <p className="mt-2 text-sm text-[#57534E]">
              {settings.campaign_status === 'locked'
                ? t.join.lockedBannerDesc
                : t.join.completedBannerDesc}
            </p>
            {renderPaymentBox(summary.currentBaseShareCents)}
          </div>
        ) : showPersonalJoinedView && myMatchedEntry ? (
          /* Personal Joined Confirmation & Live Share Card */
          (() => {
            const p = myMatchedEntry.participant
            const myLiveTotal = computeParticipantContributionCents(p, summary.currentBaseShareCents)
            const myExtra = Math.max(0, myLiveTotal - summary.currentBaseShareCents)
            const myColors = votes
              .filter((v) => v.participant_id === p.id)
              .map((v) => activeColors.find((c) => c.id === v.color_id))
              .filter((c): c is ColorWithVotes => Boolean(c))

            return (
              <div className="rounded-3xl border-2 border-emerald-500/40 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {t.join.joinedBadge}
                  </span>

                  {p.is_paid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                      <Check className="h-3.5 w-3.5" />
                      {t.join.paidConfirmed}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#6B665E]">
                      {t.join.awaitingSettlement}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-2xl font-bold text-[#181715]">
                  {interpolate(t.join.joinedTitle, { name: p.display_name })}
                </h3>
                <p className="mt-1 text-sm text-[#57534E]">{t.join.joinedSubtitle}</p>

                <div className="mt-5 rounded-2xl border border-[#E6E0D5] bg-[#FAF8F4] p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-[#57534E]">
                      {t.join.yourCurrentTotal}
                    </span>
                    <span className="font-mono-num text-3xl font-bold text-[#181715]">
                      {formatEur(myLiveTotal, locale)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#DFD8CC] pt-3 text-xs text-[#6B665E]">
                    <span>
                      {interpolate(t.join.yourBaseShare, {
                        people: summary.currentTotalPeople,
                      })}
                      :{' '}
                      <strong className="font-mono-num text-[#181715]">
                        {formatEur(summary.currentBaseShareCents, locale)}
                      </strong>
                    </span>
                    {myExtra > 0 && (
                      <span className="font-semibold text-emerald-700">
                        {t.join.yourExtraBoost}:{' '}
                        <span className="font-mono-num">+{formatEur(myExtra, locale)}</span>
                      </span>
                    )}
                  </div>

                  {myColors.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-[#DFD8CC] pt-3">
                      {myColors.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD8CC] bg-white px-2.5 py-1 text-xs font-medium text-[#181715]"
                        >
                          <span
                            className="h-3 w-3 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          {getLocalizedColorName(c, locale)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {renderPaymentBox(myLiveTotal)}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {settings.campaign_status !== 'completed' && (
                    <button
                      type="button"
                      onClick={startEditingExisting}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#DFD8CC] bg-white px-4 py-2.5 text-xs font-bold text-[#181715] shadow-2xs transition hover:bg-[#F5F1EA] cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#EA580C]" />
                      {t.join.editMyEntryBtn}
                    </button>
                  )}

                  {settings.campaign_status === 'open' && (
                    <button
                      type="button"
                      onClick={() => {
                        setName('')
                        setNote('')
                        setHasCustomAmount(false)
                        setAmountInput(centsToInputString(summary.joinMinShareCents))
                        setAddingAnother(true)
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B665E] hover:text-[#181715] cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {t.join.addAnotherPersonBtn}
                    </button>
                  )}
                </div>
              </div>
            )
          })()
        ) : (
          /* Interactive Join / Edit Form Card */
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#DFD8CC] bg-white p-5 shadow-md sm:p-8 space-y-6"
          >
            {/* Visual Math Formula Strip: Total / People = Minimum */}
            <div className="rounded-2xl border border-[#E7E1D6] bg-[#FAF8F4] p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                {t.join.formulaLabel}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                  <span className="rounded-lg bg-white px-2.5 py-1 font-mono-num font-bold text-[#181715] border border-[#E6E0D5]">
                    {formatEur(summary.totalGoalCents, locale)}
                  </span>
                  <span className="font-bold text-[#78716C]">÷</span>
                  <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-[#181715] border border-[#E6E0D5]">
                    <span className="font-mono-num font-bold">{formulaPeopleCount}</span>{' '}
                    {t.join.formulaDividedBy}
                  </span>
                  <span className="font-bold text-[#78716C]">=</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-[#6B665E]">
                    {t.join.formulaMinimum}:
                  </span>
                  <span className="font-mono-num text-xl font-bold text-[#EA580C] sm:text-2xl">
                    {formatEur(minShareCents, locale)}
                  </span>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label
                htmlFor="participant-name"
                className="block text-sm font-bold text-[#181715] mb-1.5"
              >
                {t.join.nameLabel}
              </label>
              <input
                id="participant-name"
                type="text"
                required
                maxLength={60}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errorMsg) setErrorMsg(null)
                }}
                placeholder={t.join.namePlaceholder}
                className="w-full rounded-2xl border border-[#D6CFC2] bg-[#FAF8F4] px-4 py-3 text-base font-medium text-[#181715] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#EA580C]/15"
              />
            </div>

            {/* Customizable Contribution Input (Strictly >= Total / Total People) */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                <label htmlFor="participant-amount" className="text-sm font-bold text-[#181715]">
                  {t.join.amountLabel}
                </label>
                <span className="text-xs font-semibold text-[#6B665E]">
                  {t.join.minRuleNotice}:{' '}
                  <strong className="font-mono-num text-[#181715]">
                    {formatEur(minShareCents, locale)}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepAmount(-100)}
                  disabled={parsedCents !== null && parsedCents <= minShareCents}
                  aria-label="Decrease amount"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D6CFC2] bg-[#FAF8F4] text-[#181715] transition hover:bg-[#ECE7DD] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono-num text-lg font-bold text-[#78716C]">
                    €
                  </span>
                  <input
                    id="participant-amount"
                    type="text"
                    inputMode="decimal"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value)
                      setHasCustomAmount(true)
                      if (errorMsg) setErrorMsg(null)
                    }}
                    className={`w-full rounded-2xl border pl-9 pr-4 py-3 font-mono-num text-xl font-bold transition focus:outline-none focus:ring-3 ${
                      isBelowMin
                        ? 'border-red-400 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-[#D6CFC2] bg-white text-[#181715] focus:border-[#EA580C] focus:ring-[#EA580C]/15'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => stepAmount(100)}
                  aria-label="Increase amount"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D6CFC2] bg-[#FAF8F4] text-[#181715] transition hover:bg-[#ECE7DD] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Boost Chips */}
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAmountInput(centsToInputString(minShareCents))
                    setHasCustomAmount(false)
                    setErrorMsg(null)
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    parsedCents === minShareCents
                      ? 'bg-[#181715] text-white'
                      : 'border border-[#DFD8CC] bg-[#FAF8F4] text-[#44403C] hover:bg-[#EFEAE1]'
                  }`}
                >
                  {t.join.quickExactMin} ({formatEur(minShareCents, locale)})
                </button>

                {[200, 500, 1000].map((boostCents) => {
                  const target = minShareCents + boostCents
                  const active = parsedCents === target
                  return (
                    <button
                      key={boostCents}
                      type="button"
                      onClick={() => applyPresetAmount(target)}
                      className={`rounded-xl px-3 py-1.5 font-mono-num text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-[#EA580C] text-white'
                          : 'border border-[#DFD8CC] bg-[#FAF8F4] text-[#44403C] hover:bg-[#EFEAE1]'
                      }`}
                    >
                      +€{boostCents / 100}
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => applyPresetAmount(roundUpTargetCents)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    parsedCents === roundUpTargetCents
                      ? 'bg-[#EA580C] text-white'
                      : 'border border-[#DFD8CC] bg-[#FAF8F4] text-[#44403C] hover:bg-[#EFEAE1]'
                  }`}
                >
                  {t.join.quickRoundUp} ({formatEur(roundUpTargetCents, locale)})
                </button>
              </div>

              {/* Below-Minimum Guardrail OR Extra Boost Mode Selector */}
              {isBelowMin ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>
                      {interpolate(t.join.errorBelowMin, {
                        min: formatEur(minShareCents, locale),
                      })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAmountInput(centsToInputString(minShareCents))
                      setHasCustomAmount(false)
                      setErrorMsg(null)
                    }}
                    className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                  >
                    {interpolate(t.join.resetToMin, {
                      min: formatEur(minShareCents, locale),
                    })}
                  </button>
                </div>
              ) : extraCents > 0 && parsedCents !== null ? (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {interpolate(t.join.modeTitle, {
                        extra: formatEur(extraCents, locale),
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setMode('split_plus_extra')}
                      className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        mode === 'split_plus_extra'
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/15'
                          : 'border-emerald-200/80 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#181715]">
                        {interpolate(t.join.modeDynamicLabel, {
                          extra: formatEur(extraCents, locale),
                        })}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-[#57534E]">
                        {interpolate(t.join.modeDynamicDesc, {
                          extra: formatEur(extraCents, locale),
                        })}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('fixed_minimum')}
                      className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        mode === 'fixed_minimum'
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/15'
                          : 'border-emerald-200/80 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#181715]">
                        {interpolate(t.join.modeFixedLabel, {
                          total: formatEur(parsedCents, locale),
                        })}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-[#57534E]">
                        {interpolate(t.join.modeFixedDesc, {
                          total: formatEur(parsedCents, locale),
                        })}
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-[#6B665E]">{t.join.exactMinFeedback}</p>
              )}
            </div>

            {/* Filament Color Vote Picker inside Join Form */}
            {settings.spool_count > 0 && activeColors.length > 0 && (
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2">
                  <span className="text-sm font-bold text-[#181715]">
                    {interpolate(t.join.colorVoteLabel, {
                      max: settings.max_color_votes_per_person,
                    })}
                  </span>
                  <span className="text-xs text-[#6B665E]">
                    {selectedColorIds.length}/{settings.max_color_votes_per_person} ·{' '}
                    {t.join.colorVoteHint}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {activeColors.map((color) => {
                    const picked = selectedColorIds.includes(color.id)
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => toggleColorChoice(color.id)}
                        className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                          picked
                            ? 'border-[#EA580C] bg-orange-50/80 font-bold text-[#181715] ring-2 ring-[#EA580C]/20'
                            : 'border-[#E6E0D5] bg-[#FAF8F4] font-medium text-[#44403C] hover:border-[#C7BFB1]'
                        }`}
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-black/20 shadow-2xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{getLocalizedColorName(color, locale)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Optional Cheer Message */}
            <div>
              <label
                htmlFor="participant-note"
                className="block text-sm font-bold text-[#181715] mb-1.5"
              >
                {t.join.noteLabel}
              </label>
              <input
                id="participant-note"
                type="text"
                maxLength={180}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.join.notePlaceholder}
                className="w-full rounded-2xl border border-[#D6CFC2] bg-[#FAF8F4] px-4 py-2.5 text-sm text-[#181715] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#EA580C]/15"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting || isBelowMin}
                className="flex-1 rounded-2xl bg-[#EA580C] px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-[#C2410C] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting
                  ? t.join.submittingBtn
                  : isEditMode
                    ? t.join.saveChangesBtn
                    : `${t.join.submitBtn} · ${formatEur(parsedCents ?? minShareCents, locale)}`}
              </button>

              {(isEditMode || addingAnother) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingExisting(false)
                    setAddingAnother(false)
                    setErrorMsg(null)
                  }}
                  className="rounded-2xl border border-[#DFD8CC] bg-[#FAF8F4] px-5 py-3.5 text-sm font-bold text-[#44403C] hover:bg-[#EFEAE1] cursor-pointer"
                >
                  {isEditMode ? t.join.cancelEditBtn : t.join.backToMyEntryBtn}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
