import React, { useState } from 'react'
import { ArrowDownRight, Calculator, Megaphone, Sparkles, Tag, Users } from 'lucide-react'
import type { CampaignSettings, ColorWithVotes, Locale } from '../types'
import { TRANSLATIONS } from '../i18n/translations'
import {
  computeEqualShareCents,
  formatEur,
  getLocalizedColorName,
  type PoolSummary,
} from '../lib/math'
import { FilamentSpoolSvg } from './FilamentSpoolSvg'

interface HeroBreakdownProps {
  locale: Locale
  settings: CampaignSettings
  summary: PoolSummary
  rankedColors: ColorWithVotes[]
  onScrollToJoin: () => void
  onScrollToColors: () => void
}

export const HeroBreakdown: React.FC<HeroBreakdownProps> = ({
  locale,
  settings,
  summary,
  rankedColors,
  onScrollToJoin,
  onScrollToColors,
}) => {
  const t = TRANSLATIONS[locale]
  const defaultSimPeople = Math.max(4, summary.joinTotalPeople)
  const [simPeople, setSimPeople] = useState<number>(defaultSimPeople)

  const leadingSpools = rankedColors.filter((c) => c.isLeadingSpool)
  const simShareCents = computeEqualShareCents(summary.totalGoalCents, simPeople)

  return (
    <section id="top" className="maker-grid-bg border-b border-[#E6E0D5] pt-8 pb-12 sm:pt-12 sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Optional Admin Announcement Banner */}
        {settings.announcement_note.trim() && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-orange-300/80 bg-orange-50/90 px-4 py-3 text-sm text-[#7C2D12] shadow-2xs">
            <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" />
            <p className="font-medium">{settings.announcement_note}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column (7 cols): Headline + Transparent Cost Receipt + Live Split */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                <Tag className="h-3.5 w-3.5" />
                {t.hero.eyebrow}
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-[#181715] sm:text-5xl sm:leading-[1.08]">
                {t.hero.titlePrefix}{' '}
                <span className="text-[#EA580C]">
                  {settings.printer_name !== '3D Printer'
                    ? `${settings.printer_name} + Filament`
                    : t.hero.titleHighlight}
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
                {t.hero.subtitle}
              </p>
            </div>

            {/* Transparent Cost Receipt Card */}
            <div className="rounded-3xl border border-[#DFD8CC] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-[#DFD8CC] pb-3.5">
                <h2 className="font-display text-base font-bold text-[#181715] sm:text-lg">
                  {t.hero.receiptTitle}
                </h2>
                <span className="rounded-full bg-[#F5F1EA] px-2.5 py-0.5 text-xs font-semibold text-[#57534E]">
                  {t.hero.receiptBadge}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                {/* Retail price */}
                {settings.printer_discount_cents > 0 && (
                  <>
                    <div className="flex items-center justify-between text-[#78716C]">
                      <span>
                        {settings.printer_name} ({t.hero.printerRetailLabel})
                      </span>
                      <span className="font-mono-num line-through">
                        {formatEur(settings.printer_retail_cents, locale)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-emerald-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t.hero.discountLabel}
                      </span>
                      <span className="font-mono-num font-semibold">
                        −{formatEur(settings.printer_discount_cents, locale)}
                      </span>
                    </div>
                  </>
                )}

                {/* Net printer price */}
                <div className="flex items-center justify-between font-semibold text-[#181715]">
                  <span>
                    {settings.printer_name} ({t.hero.printerNetLabel})
                  </span>
                  <span className="font-mono-num">
                    {formatEur(settings.printer_net_cents, locale)}
                  </span>
                </div>

                {/* Filament spools */}
                {settings.spool_count > 0 && (
                  <div className="flex items-center justify-between text-[#292524]">
                    <span>
                      {t.hero.filamentLabel} ({settings.spool_count}{' '}
                      {settings.spool_count === 1 ? t.hero.spoolWord : t.hero.spoolsWord} ×{' '}
                      <span className="font-mono-num">
                        {formatEur(settings.spool_price_cents, locale)}
                      </span>
                      {t.hero.perKilo})
                    </span>
                    <span className="font-mono-num font-semibold text-[#181715]">
                      {formatEur(summary.filamentTotalCents, locale)}
                    </span>
                  </div>
                )}

                {/* Optional Extra Cost */}
                {settings.extra_cost_cents !== 0 && (
                  <div className="flex items-center justify-between text-[#292524]">
                    <span>{settings.extra_cost_label || t.hero.extraCostFallback}</span>
                    <span className="font-mono-num font-semibold text-[#181715]">
                      {formatEur(settings.extra_cost_cents, locale)}
                    </span>
                  </div>
                )}

                {/* Total Line */}
                <div className="mt-3 flex items-baseline justify-between border-t-2 border-[#181715] pt-3.5">
                  <div>
                    <span className="font-display text-base font-bold text-[#181715] sm:text-lg">
                      {t.hero.totalGoalLabel}
                    </span>
                  </div>
                  <span className="font-mono-num text-2xl font-bold text-[#181715] sm:text-3xl">
                    {formatEur(summary.totalGoalCents, locale)}
                  </span>
                </div>
              </div>

              <p className="mt-3 rounded-xl bg-[#FAF8F4] px-3.5 py-2.5 text-xs font-medium text-[#57534E] border border-[#ECE7DD]">
                {t.hero.equalSplitExplain}
              </p>
            </div>

            {/* Live Group Split Highlight */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#DFD8CC] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#78716C]">
                  <span>{t.hero.peopleInPoolNow}</span>
                  <Users className="h-4 w-4 text-[#78716C]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono-num text-2xl font-bold text-[#181715]">
                    {summary.currentTotalPeople}
                  </span>
                  <span className="text-sm font-medium text-[#57534E]">
                    {summary.currentTotalPeople === 1
                      ? t.hero.personSingular
                      : t.hero.peoplePlural}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[#6B665E]">
                  {t.hero.currentShareEach}:{' '}
                  <strong className="font-mono-num text-[#181715]">
                    {formatEur(summary.currentBaseShareCents, locale)}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={onScrollToJoin}
                className="group rounded-2xl border-2 border-[#EA580C] bg-gradient-to-br from-[#FFF7ED] to-white p-4 text-left shadow-xs transition hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[#C2410C]">
                  <span>{t.hero.ifYouJoinNow}</span>
                  <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono-num text-2xl font-bold text-[#EA580C] sm:text-3xl">
                    {formatEur(summary.joinMinShareCents, locale)}
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-[#9A3412]">
                  {summary.joinTotalPeople} {t.hero.peoplePlural} ({t.hero.withYouCount})
                </div>
              </button>
            </div>

            {summary.extraBoostPoolCents > 0 && (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/75 px-4 py-3 text-xs sm:text-sm">
                <span className="font-semibold text-emerald-900">
                  +{formatEur(summary.extraBoostPoolCents, locale)} {t.hero.extraBoostCollected}
                </span>
                <span className="text-emerald-800 hidden sm:inline">{t.hero.extraBoostHint}</span>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Studio Printer Visual + Top Spools + Interactive Simulator */}
          <div className="lg:col-span-5 space-y-5">
            {/* Printer Visual Card */}
            <div className="overflow-hidden rounded-3xl border border-[#DFD8CC] bg-white shadow-sm">
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#F3EFE8]">
                <img
                  src="/images/printer-hero.jpg"
                  alt={settings.printer_name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#181715]/85 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                  <span className="font-mono-num text-[#FB923C]">
                    {formatEur(settings.printer_net_cents, locale)}
                  </span>{' '}
                  {settings.printer_discount_cents > 0 && (
                    <span className="ml-1 text-[11px] font-normal text-stone-300 line-through">
                      {formatEur(settings.printer_retail_cents, locale)}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Top Voted Filament Spools Rack */}
              {settings.spool_count > 0 && (
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-bold text-[#181715]">
                      {t.hero.topColorsRackTitle} ({settings.spool_count})
                    </h3>
                    <button
                      type="button"
                      onClick={onScrollToColors}
                      className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      {TRANSLATIONS[locale].colors.voteBtn} →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {leadingSpools.slice(0, 4).map((spool, idx) => (
                      <button
                        key={spool.id}
                        type="button"
                        onClick={onScrollToColors}
                        className="flex items-center gap-3 rounded-2xl border border-[#E7E1D6] bg-[#FAF8F4] p-2.5 text-left transition hover:border-[#EA580C]/50 cursor-pointer"
                      >
                        <FilamentSpoolSvg hex={spool.hex} size={44} className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-[#181715] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-white">
                              #{idx + 1}
                            </span>
                            {spool.is_pinned && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                {t.hero.pinnedTag}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-xs font-bold text-[#181715]">
                            {getLocalizedColorName(spool, locale)}
                          </div>
                          <div className="text-[11px] text-[#6B665E]">
                            <span className="font-mono-num font-semibold text-[#181715]">
                              {spool.voteCount}
                            </span>{' '}
                            {spool.voteCount === 1 ? t.hero.voteSingular : t.hero.votesCount}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Price-Drop Simulator */}
            <div className="rounded-3xl border border-[#DFD8CC] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#181715]">
                <Calculator className="h-4 w-4 text-[#EA580C]" />
                <h3>{t.hero.simulatorTitle}</h3>
              </div>
              <p className="mt-1 text-xs text-[#6B665E]">{t.hero.simulatorSub}</p>

              <div className="mt-4 flex items-baseline justify-between rounded-2xl bg-[#FAF8F4] px-4 py-3 border border-[#ECE7DD]">
                <div className="text-sm font-semibold text-[#292524]">
                  <span className="font-mono-num text-lg font-bold text-[#181715]">{simPeople}</span>{' '}
                  {simPeople === 1 ? t.hero.personSingular : t.hero.peoplePlural}
                </div>
                <div className="text-right">
                  <span className="font-mono-num text-xl font-bold text-[#EA580C]">
                    {formatEur(simShareCents, locale)}
                  </span>
                  <span className="ml-1.5 text-xs text-[#6B665E]">{t.hero.simulatorPerPerson}</span>
                </div>
              </div>

              <div className="mt-3 px-1">
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={simPeople}
                  onChange={(e) => setSimPeople(Number(e.target.value))}
                  aria-label={t.hero.simulatorTitle}
                  className="maker-slider w-full"
                />
                <div className="mt-1.5 flex justify-between font-mono-num text-[11px] text-[#78716C]">
                  {[2, 4, 6, 8, 10, 12].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSimPeople(n)}
                      className={`px-1 py-0.5 rounded transition cursor-pointer ${
                        simPeople === n
                          ? 'bg-orange-100 font-bold text-[#C2410C]'
                          : 'hover:text-[#181715]'
                      }`}
                    >
                      {n}p
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
