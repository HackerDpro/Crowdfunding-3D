import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Lock, Wifi } from 'lucide-react'
import type {
  CampaignSettings,
  ColorVote,
  FilamentColor,
  Locale,
  Participant,
  SavedParticipationToken,
} from './types'
import {
  clearParticipationTokens,
  DEFAULT_COLORS,
  DEFAULT_SETTINGS,
  fetchCampaignBundle,
  getSavedTokens,
  supabase,
} from './lib/supabase'
import { computeColorsWithVotes, computePoolSummary } from './lib/math'
import { TRANSLATIONS, detectInitialLocale, interpolate } from './i18n/translations'
import { Navbar } from './components/Navbar'
import { HeroBreakdown } from './components/HeroBreakdown'
import { JoinCard } from './components/JoinCard'
import { ColorVotingSection } from './components/ColorVotingSection'
import { ParticipantsList } from './components/ParticipantsList'
import { AdminModal } from './components/AdminModal'

const ADMIN_SESSION_KEY = 'crowdfunding3d_admin_code_session'

export function App() {
  const [locale, setLocale] = useState<Locale>(() => detectInitialLocale())
  const [settings, setSettings] = useState<CampaignSettings>(DEFAULT_SETTINGS)
  const [colors, setColors] = useState<FilamentColor[]>(DEFAULT_COLORS)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [votes, setVotes] = useState<ColorVote[]>([])
  const [connected, setConnected] = useState<boolean>(false)

  const [savedTokens, setSavedTokens] = useState<SavedParticipationToken[]>(() => getSavedTokens())
  const [preselectedColorIds, setPreselectedColorIds] = useState<string[]>([])

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('admin') === '1'
    } catch {
      return false
    }
  })
  const [adminCode, setAdminCode] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY)
    } catch {
      return null
    }
  })

  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev))
    }, 3200)
  }, [])

  const handleLocaleChange = (next: Locale) => {
    setLocale(next)
    try {
      localStorage.setItem('crowdfunding3d_locale', next)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const loadData = useCallback(async () => {
    try {
      const bundle = await fetchCampaignBundle()
      setSettings(bundle.settings)
      setColors(bundle.colors)
      setParticipants(bundle.participants)
      setVotes(bundle.votes)
      setConnected(true)
    } catch {
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel('crowdfunding-3d-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaign_settings' },
        () => {
          loadData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'filament_colors' },
        () => {
          loadData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          loadData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'color_votes' },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const summary = useMemo(
    () => computePoolSummary(settings, participants),
    [settings, participants]
  )

  const activeRankedColors = useMemo(
    () => computeColorsWithVotes(colors, votes, participants, settings.spool_count, false),
    [colors, votes, participants, settings.spool_count]
  )

  const allColorsWithVotes = useMemo(
    () => computeColorsWithVotes(colors, votes, participants, settings.spool_count, true),
    [colors, votes, participants, settings.spool_count]
  )

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAdminUnlocked = (code: string) => {
    setAdminCode(code)
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, code)
    } catch {
      // ignore
    }
  }

  const handleAdminLogout = () => {
    setAdminCode(null)
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
    } catch {
      // ignore
    }
  }

  const handleResetComplete = () => {
    clearParticipationTokens()
    setSavedTokens([])
    setPreselectedColorIds([])
    handleAdminLogout()
    setIsAdminOpen(false)
  }

  const t = TRANSLATIONS[locale]

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#181715]">
      <Navbar
        locale={locale}
        onLocaleChange={handleLocaleChange}
        status={settings.campaign_status}
        organizerName={settings.organizer_name}
        isAdminUnlocked={Boolean(adminCode)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToJoin={() => scrollToSection('join')}
      />

      <main className="flex-1">
        <HeroBreakdown
          locale={locale}
          settings={settings}
          summary={summary}
          rankedColors={activeRankedColors}
          onScrollToJoin={() => scrollToSection('join')}
          onScrollToColors={() => scrollToSection('colors')}
        />

        <JoinCard
          locale={locale}
          settings={settings}
          summary={summary}
          participants={participants}
          votes={votes}
          activeColors={activeRankedColors}
          savedTokens={savedTokens}
          onTokensUpdated={() => setSavedTokens(getSavedTokens())}
          onRefresh={loadData}
          preselectedColorIds={preselectedColorIds}
          onPreselectedColorsChange={setPreselectedColorIds}
          onToast={showToast}
        />

        <ColorVotingSection
          locale={locale}
          settings={settings}
          rankedColors={activeRankedColors}
          participants={participants}
          votes={votes}
          savedTokens={savedTokens}
          preselectedColorIds={preselectedColorIds}
          onPreselectedColorsChange={setPreselectedColorIds}
          onRefresh={loadData}
          onScrollToJoin={() => scrollToSection('join')}
          onToast={showToast}
        />

        <ParticipantsList
          locale={locale}
          settings={settings}
          summary={summary}
          participants={participants}
          colors={colors}
          votes={votes}
          savedTokens={savedTokens}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E0D5] bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-[#6B665E] sm:px-6">
          <div>
            {interpolate(t.footer.madeFor, { organizer: settings.organizer_name })}
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Wifi
                className={`h-3.5 w-3.5 ${connected ? 'text-emerald-600' : 'text-amber-500'}`}
              />
              <span>{connected ? t.footer.liveSync : t.footer.offlineMode}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1 font-semibold text-[#57534E] hover:text-[#181715] cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>{t.footer.adminAccess}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Control Center Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        locale={locale}
        settings={settings}
        summary={summary}
        participants={participants}
        allColorsWithVotes={allColorsWithVotes}
        adminCode={adminCode}
        onAdminUnlocked={handleAdminUnlocked}
        onAdminLogout={handleAdminLogout}
        onResetComplete={handleResetComplete}
        onRefresh={loadData}
        onToast={showToast}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#181715] px-4 py-3 text-xs font-bold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

export default App
