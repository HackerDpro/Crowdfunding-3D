import React, { useState } from 'react'
import { Check, Globe, Lock, Share2, ShieldCheck } from 'lucide-react'
import type { CampaignStatus, Locale } from '../types'
import { TRANSLATIONS } from '../i18n/translations'

interface NavbarProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  status: CampaignStatus
  organizerName: string
  isAdminUnlocked: boolean
  onOpenAdmin: () => void
  onScrollToJoin: () => void
}

const LOCALES: Locale[] = ['en', 'nl', 'fr', 'es']

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  onLocaleChange,
  status,
  organizerName,
  isAdminUnlocked,
  onOpenAdmin,
  onScrollToJoin,
}) => {
  const t = TRANSLATIONS[locale]
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href.split('?')[0]
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bambu Lab A1 mini 3D Printer Group Fund',
          text: `${organizerName}'s Bambu Lab A1 mini + filament group split`,
          url,
        })
        return
      } catch {
        // user cancelled or fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // ignore
    }
  }

  const statusBadge =
    status === 'open' ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/25">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        {t.nav.statusOpen}
      </span>
    ) : status === 'locked' ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-600/30">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        {t.nav.statusLocked}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-900 ring-1 ring-sky-600/30">
        <span className="h-2 w-2 rounded-full bg-sky-500" />
        {t.nav.statusCompleted}
      </span>
    )

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6E0D5] bg-[#FAF8F4]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5 px-4 py-3 sm:px-6">
        {/* Brand + Status */}
        <div className="flex items-center gap-3">
          <a href="#top" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181715] text-white shadow-xs transition-transform group-hover:scale-105">
              <span className="font-display text-sm font-bold tracking-tight text-[#FB923C]">3D</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold text-[#181715] sm:text-base">
                {organizerName}’s 3D Pool
              </div>
              <div className="text-[11px] font-medium text-[#6B665E] hidden sm:block">
                {t.nav.brandSub}
              </div>
            </div>
          </a>
          <div className="hidden md:block">{statusBadge}</div>
        </div>

        {/* Right Controls: Language Switcher + Share + Admin + CTA */}
        <div className="flex items-center gap-2">
          {/* 4-Language Switcher Pill Bar */}
          <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex items-center rounded-xl border border-[#DFD8CC] bg-white p-0.5 shadow-2xs"
          >
            <Globe className="ml-2 mr-1 h-3.5 w-3.5 text-[#78716C] hidden sm:block" />
            {LOCALES.map((code) => {
              const active = locale === code
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLocaleChange(code)}
                  title={TRANSLATIONS[code].langName}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#181715] text-white shadow-2xs'
                      : 'text-[#57534E] hover:bg-[#F3EFE8] hover:text-[#181715]'
                  }`}
                >
                  {TRANSLATIONS[code].langShort}
                </button>
              )
            })}
          </div>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD8CC] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#292524] shadow-2xs transition hover:bg-[#F5F1EA] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700">{t.nav.copied}</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-[#EA580C]" />
                <span className="hidden sm:inline">{t.nav.share}</span>
              </>
            )}
          </button>

          {/* Admin Trigger */}
          <button
            type="button"
            onClick={onOpenAdmin}
            title={t.nav.admin}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              isAdminUnlocked
                ? 'border-orange-300 bg-orange-50 text-[#C2410C] hover:bg-orange-100'
                : 'border-[#DFD8CC] bg-white text-[#57534E] hover:bg-[#F5F1EA] hover:text-[#181715]'
            }`}
          >
            {isAdminUnlocked ? (
              <ShieldCheck className="h-3.5 w-3.5 text-[#EA580C]" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">{t.nav.admin}</span>
          </button>

          {/* Primary CTA on desktop */}
          {status === 'open' && (
            <button
              type="button"
              onClick={onScrollToJoin}
              className="hidden sm:inline-flex items-center rounded-xl bg-[#EA580C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#C2410C] cursor-pointer"
            >
              {t.nav.joinCta}
            </button>
          )}
        </div>
      </div>

      {/* Mobile status strip */}
      <div className="flex items-center justify-between border-t border-[#ECE7DD] bg-[#F6F3EC] px-4 py-1.5 md:hidden">
        {statusBadge}
        {status === 'open' && (
          <button
            type="button"
            onClick={onScrollToJoin}
            className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
          >
            {t.nav.joinCta} →
          </button>
        )}
      </div>
    </header>
  )
}
