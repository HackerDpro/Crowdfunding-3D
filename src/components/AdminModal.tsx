import React, { useEffect, useState } from 'react'
import {
  Check,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Palette,
  Pin,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import type {
  CampaignSettings,
  CampaignStatus,
  ColorWithVotes,
  FilamentColor,
  Locale,
  Participant,
} from '../types'
import {
  centsToInputString,
  computeParticipantContributionCents,
  formatEur,
  parseEuroInputToCents,
  type PoolSummary,
} from '../lib/math'
import {
  adminChangeCodeRpc,
  adminDeleteColorRpc,
  adminManageParticipantRpc,
  adminResetColorVotesRpc,
  adminUpdateSettingsRpc,
  adminUpsertColorRpc,
  verifyAdminCodeRpc,
} from '../lib/supabase'
import { FilamentSpoolSvg } from './FilamentSpoolSvg'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  locale: Locale
  settings: CampaignSettings
  summary: PoolSummary
  participants: Participant[]
  allColorsWithVotes: ColorWithVotes[]
  adminCode: string | null
  onAdminUnlocked: (code: string) => void
  onAdminLogout: () => void
  onRefresh: () => Promise<void>
  onToast: (msg: string) => void
}

type AdminTab = 'settings' | 'participants' | 'colors' | 'security'

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  locale,
  settings,
  summary,
  participants,
  allColorsWithVotes,
  adminCode,
  onAdminUnlocked,
  onAdminLogout,
  onRefresh,
  onToast,
}) => {
  const [codeInput, setCodeInput] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>('settings')

  // Settings Tab State
  const [status, setStatus] = useState<CampaignStatus>(settings.campaign_status)
  const [organizerName, setOrganizerName] = useState(settings.organizer_name)
  const [includeOrganizer, setIncludeOrganizer] = useState(settings.include_organizer_in_split)
  const [printerName, setPrinterName] = useState(settings.printer_name)
  const [retailInput, setRetailInput] = useState(centsToInputString(settings.printer_retail_cents))
  const [discountInput, setDiscountInput] = useState(
    centsToInputString(settings.printer_discount_cents)
  )
  const [netInput, setNetInput] = useState(centsToInputString(settings.printer_net_cents))
  const [spoolCount, setSpoolCount] = useState(settings.spool_count)
  const [spoolPriceInput, setSpoolPriceInput] = useState(
    centsToInputString(settings.spool_price_cents)
  )
  const [extraCostInput, setExtraCostInput] = useState(centsToInputString(settings.extra_cost_cents))
  const [extraCostLabel, setExtraCostLabel] = useState(settings.extra_cost_label)
  const [maxVotes, setMaxVotes] = useState(settings.max_color_votes_per_person)
  const [announcementNote, setAnnouncementNote] = useState(settings.announcement_note)
  const [paymentEnabled, setPaymentEnabled] = useState(settings.payment_enabled)
  const [paymentBeneficiary, setPaymentBeneficiary] = useState(settings.payment_beneficiary)
  const [paymentIban, setPaymentIban] = useState(settings.payment_iban)
  const [paymentLink, setPaymentLink] = useState(settings.payment_link)
  const [paymentInstructions, setPaymentInstructions] = useState(settings.payment_instructions)
  const [savingSettings, setSavingSettings] = useState(false)

  // Participants Tab State
  const [newPName, setNewPName] = useState('')
  const [newPExtraInput, setNewPExtraInput] = useState('0.00')
  const [newPNote, setNewPNote] = useState('')
  const [newPPaid, setNewPPaid] = useState(false)
  const [editingPId, setEditingPId] = useState<string | null>(null)
  const [editPName, setEditPName] = useState('')
  const [editPExtraInput, setEditPExtraInput] = useState('0.00')
  const [editPNote, setEditPNote] = useState('')
  const [busyParticipant, setBusyParticipant] = useState(false)

  // Colors Tab State
  const [newColorNameEn, setNewColorNameEn] = useState('')
  const [newColorNameNl, setNewColorNameNl] = useState('')
  const [newColorNameFr, setNewColorNameFr] = useState('')
  const [newColorNameEs, setNewColorNameEs] = useState('')
  const [newColorHex, setNewColorHex] = useState('#EA580C')
  const [newColorMaterial, setNewColorMaterial] = useState('Bambu PLA Basic · 1 kg')
  const [editingColor, setEditingColor] = useState<FilamentColor | null>(null)
  const [busyColor, setBusyColor] = useState(false)

  // Security Tab State
  const [newAdminCode, setNewAdminCode] = useState('')
  const [confirmAdminCode, setConfirmAdminCode] = useState('')
  const [savingCode, setSavingCode] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Sync local form fields when settings change
  useEffect(() => {
    setStatus(settings.campaign_status)
    setOrganizerName(settings.organizer_name)
    setIncludeOrganizer(settings.include_organizer_in_split)
    setPrinterName(settings.printer_name)
    setRetailInput(centsToInputString(settings.printer_retail_cents))
    setDiscountInput(centsToInputString(settings.printer_discount_cents))
    setNetInput(centsToInputString(settings.printer_net_cents))
    setSpoolCount(settings.spool_count)
    setSpoolPriceInput(centsToInputString(settings.spool_price_cents))
    setExtraCostInput(centsToInputString(settings.extra_cost_cents))
    setExtraCostLabel(settings.extra_cost_label)
    setMaxVotes(settings.max_color_votes_per_person)
    setAnnouncementNote(settings.announcement_note)
    setPaymentEnabled(settings.payment_enabled)
    setPaymentBeneficiary(settings.payment_beneficiary)
    setPaymentIban(settings.payment_iban)
    setPaymentLink(settings.payment_link)
    setPaymentInstructions(settings.payment_instructions)
  }, [settings])

  if (!isOpen) return null

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      const ok = await verifyAdminCodeRpc(codeInput.trim())
      if (ok) {
        onAdminUnlocked(codeInput.trim())
        setCodeInput('')
      } else {
        setAuthError('Invalid admin code. Please try again.')
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setAuthLoading(false)
    }
  }

  // Preview total goal from current settings inputs
  const previewNetCents = parseEuroInputToCents(netInput) ?? 0
  const previewSpoolPriceCents = parseEuroInputToCents(spoolPriceInput) ?? 0
  const previewExtraCostCents = parseEuroInputToCents(extraCostInput) ?? 0
  const previewTotalGoalCents = Math.max(
    0,
    previewNetCents + spoolCount * previewSpoolPriceCents + previewExtraCostCents
  )

  const handleAutoCalcNet = (nextRetailStr: string, nextDiscountStr: string) => {
    const r = parseEuroInputToCents(nextRetailStr) ?? 0
    const d = parseEuroInputToCents(nextDiscountStr) ?? 0
    setNetInput(centsToInputString(Math.max(0, r - d)))
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminCode) return
    setActionError(null)
    setSavingSettings(true)
    try {
      await adminUpdateSettingsRpc(adminCode, {
        campaign_status: status,
        organizer_name: organizerName.trim() || 'Diego',
        include_organizer_in_split: includeOrganizer,
        printer_name: printerName.trim() || 'Bambu Lab A1 mini 3D Printer',
        printer_retail_cents: parseEuroInputToCents(retailInput) ?? 0,
        printer_discount_cents: parseEuroInputToCents(discountInput) ?? 0,
        printer_net_cents: previewNetCents,
        spool_count: spoolCount,
        spool_price_cents: previewSpoolPriceCents,
        extra_cost_cents: previewExtraCostCents,
        extra_cost_label: extraCostLabel.trim(),
        max_color_votes_per_person: maxVotes,
        announcement_note: announcementNote.trim(),
        payment_enabled: paymentEnabled,
        payment_beneficiary: paymentBeneficiary.trim(),
        payment_iban: paymentIban.trim(),
        payment_link: paymentLink.trim(),
        payment_instructions: paymentInstructions.trim(),
      })
      await onRefresh()
      onToast('Campaign settings updated live!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setSavingSettings(false)
    }
  }

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminCode || !newPName.trim()) return
    setActionError(null)
    setBusyParticipant(true)
    try {
      const extraCents = parseEuroInputToCents(newPExtraInput) ?? 0
      await adminManageParticipantRpc(adminCode, {
        action: 'create',
        name: newPName.trim(),
        mode: 'split_plus_extra',
        extraCents,
        note: newPNote.trim(),
        isPaid: newPPaid,
      })
      setNewPName('')
      setNewPExtraInput('0.00')
      setNewPNote('')
      setNewPPaid(false)
      await onRefresh()
      onToast('Participant added!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyParticipant(false)
    }
  }

  const handleTogglePaid = async (p: Participant) => {
    if (!adminCode) return
    setBusyParticipant(true)
    try {
      await adminManageParticipantRpc(adminCode, {
        action: 'toggle_paid',
        participantId: p.id,
        isPaid: !p.is_paid,
      })
      await onRefresh()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyParticipant(false)
    }
  }

  const handleSaveParticipantEdit = async (p: Participant) => {
    if (!adminCode) return
    setBusyParticipant(true)
    try {
      const extraCents = parseEuroInputToCents(editPExtraInput) ?? 0
      await adminManageParticipantRpc(adminCode, {
        action: 'update',
        participantId: p.id,
        name: editPName.trim() || p.display_name,
        mode: 'split_plus_extra',
        extraCents,
        fixedCents: 0,
        note: editPNote.trim(),
        isPaid: p.is_paid,
      })
      setEditingPId(null)
      await onRefresh()
      onToast('Participant updated!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyParticipant(false)
    }
  }

  const handleDeleteParticipant = async (p: Participant) => {
    if (!adminCode) return
    if (!window.confirm(`Remove "${p.display_name}" from the pool?`)) return
    setBusyParticipant(true)
    try {
      await adminManageParticipantRpc(adminCode, {
        action: 'delete',
        participantId: p.id,
      })
      await onRefresh()
      onToast(`Removed ${p.display_name}`)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyParticipant(false)
    }
  }

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminCode || !newColorNameEn.trim()) return
    setBusyColor(true)
    setActionError(null)
    try {
      await adminUpsertColorRpc(adminCode, {
        name_en: newColorNameEn.trim(),
        name_nl: newColorNameNl.trim() || newColorNameEn.trim(),
        name_fr: newColorNameFr.trim() || newColorNameEn.trim(),
        name_es: newColorNameEs.trim() || newColorNameEn.trim(),
        hex: newColorHex,
        material: newColorMaterial.trim() || 'PLA · 1 kg',
        is_active: true,
        is_pinned: false,
        manual_votes_bonus: 0,
        sort_order: allColorsWithVotes.length + 1,
      })
      setNewColorNameEn('')
      setNewColorNameNl('')
      setNewColorNameFr('')
      setNewColorNameEs('')
      await onRefresh()
      onToast('Filament color added!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyColor(false)
    }
  }

  const handleQuickColorPatch = async (
    color: FilamentColor,
    patch: Partial<FilamentColor>
  ) => {
    if (!adminCode) return
    setBusyColor(true)
    try {
      const merged = { ...color, ...patch }
      await adminUpsertColorRpc(adminCode, {
        id: merged.id,
        name_en: merged.name_en,
        name_nl: merged.name_nl,
        name_fr: merged.name_fr,
        name_es: merged.name_es,
        hex: merged.hex,
        material: merged.material,
        is_active: merged.is_active,
        is_pinned: merged.is_pinned,
        manual_votes_bonus: merged.manual_votes_bonus,
        sort_order: merged.sort_order,
      })
      setEditingColor(null)
      await onRefresh()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyColor(false)
    }
  }

  const handleDeleteColor = async (color: FilamentColor) => {
    if (!adminCode) return
    if (!window.confirm(`Delete filament color "${color.name_en}"?`)) return
    setBusyColor(true)
    try {
      await adminDeleteColorRpc(adminCode, color.id)
      await onRefresh()
      onToast('Color deleted!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyColor(false)
    }
  }

  const handleResetVotes = async () => {
    if (!adminCode) return
    if (!window.confirm('Reset ALL filament color votes to zero?')) return
    setBusyColor(true)
    try {
      await adminResetColorVotesRpc(adminCode)
      await onRefresh()
      onToast('All color votes reset!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusyColor(false)
    }
  }

  const handleChangeAdminCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminCode) return
    setActionError(null)
    if (newAdminCode.trim().length < 4) {
      setActionError('New admin code must be at least 4 characters.')
      return
    }
    if (newAdminCode.trim() !== confirmAdminCode.trim()) {
      setActionError('New admin codes do not match.')
      return
    }
    setSavingCode(true)
    try {
      await adminChangeCodeRpc(adminCode, newAdminCode.trim())
      onAdminUnlocked(newAdminCode.trim())
      setNewAdminCode('')
      setConfirmAdminCode('')
      onToast('Admin code updated!')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setSavingCode(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#DFD8CC] bg-[#FAF8F4] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E6E0D5] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181715] text-[#FB923C]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#181715] sm:text-lg">
                Organizer Admin Panel
              </h2>
              <p className="text-xs text-[#6B665E]">
                Live control over prices, filament spools, colors, participants & payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminCode && (
              <button
                type="button"
                onClick={onAdminLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD8CC] bg-[#FAF8F4] px-3 py-1.5 text-xs font-semibold text-[#57534E] hover:text-[#181715] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Lock</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Panel"
              className="rounded-xl p-2 text-[#57534E] hover:bg-[#F3EFE8] hover:text-[#181715] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Locked Screen OR Unlocked Tabbed Dashboard */}
        {!adminCode ? (
          <form onSubmit={handleUnlock} className="p-6 sm:p-10 max-w-md mx-auto w-full space-y-5">
            <div className="text-center space-y-1.5">
              <h3 className="font-display text-xl font-bold text-[#181715]">
                Enter Admin Code
              </h3>
              <p className="text-xs text-[#6B665E]">
                Verified securely on Supabase before allowing any live changes.
              </p>
            </div>

            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Admin code..."
                autoFocus
                className="w-full rounded-2xl border border-[#D6CFC2] bg-white px-4 py-3 pr-11 text-base font-mono-num text-[#181715] focus:border-[#EA580C] focus:outline-none focus:ring-3 focus:ring-[#EA580C]/15"
              />
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#181715] cursor-pointer"
              >
                {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {authError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-800">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || !codeInput.trim()}
              className="w-full rounded-2xl bg-[#181715] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#292524] disabled:opacity-45 cursor-pointer"
            >
              {authLoading ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>
          </form>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-[#E6E0D5] bg-white px-4 sm:px-6 gap-1">
              {(
                [
                  { id: 'settings', label: 'Prices & Campaign', icon: Settings },
                  {
                    id: 'participants',
                    label: `Participants (${participants.length})`,
                    icon: Users,
                  },
                  {
                    id: 'colors',
                    label: `Colors & Votes (${allColorsWithVotes.length})`,
                    icon: Palette,
                  },
                  { id: 'security', label: 'Admin Code', icon: KeyRound },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id)
                      setActionError(null)
                    }}
                    className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-3 text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'border-[#EA580C] text-[#EA580C]'
                        : 'border-transparent text-[#57534E] hover:text-[#181715]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {actionError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-900">
                  {actionError}
                </div>
              )}

              {/* TAB 1: PRICES & CAMPAIGN SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Live Total Preview Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                        Live Total Goal Preview
                      </div>
                      <div className="text-xs text-[#7C2D12]">
                        Printer ({formatEur(previewNetCents, locale)}) + {spoolCount} spools (
                        {formatEur(spoolCount * previewSpoolPriceCents, locale)})
                        {previewExtraCostCents !== 0
                          ? ` + Extra (${formatEur(previewExtraCostCents, locale)})`
                          : ''}
                      </div>
                    </div>
                    <div className="font-mono-num text-2xl font-bold text-[#181715]">
                      {formatEur(previewTotalGoalCents, locale)}
                    </div>
                  </div>

                  {/* Campaign Status & Organizer */}
                  <div className="rounded-2xl border border-[#DFD8CC] bg-white p-4 sm:p-5 space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#181715]">
                      Campaign Status & Split Rules
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm font-semibold text-[#181715]"
                        >
                          <option value="open">Open (Accepting People)</option>
                          <option value="locked">Locked (Ready to Pay)</option>
                          <option value="completed">Completed (Ordered!)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Organizer Name
                        </label>
                        <input
                          type="text"
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Max Color Votes / Person
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={maxVotes}
                          onChange={(e) => setMaxVotes(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm text-[#181715]"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-[#181715] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeOrganizer}
                        onChange={(e) => setIncludeOrganizer(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#EA580C]"
                      />
                      <span>
                        Count me ({organizerName || 'Organizer'}) as Person #1 in the equal split
                      </span>
                    </label>
                  </div>

                  {/* Printer & Filament Pricing */}
                  <div className="rounded-2xl border border-[#DFD8CC] bg-white p-4 sm:p-5 space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#181715]">
                      Printer & Filament Pricing
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Printer Name / Model
                        </label>
                        <input
                          type="text"
                          value={printerName}
                          onChange={(e) => setPrinterName(e.target.value)}
                          placeholder="e.g. Bambu Lab A1 mini"
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Retail Price (€)
                        </label>
                        <input
                          type="text"
                          value={retailInput}
                          onChange={(e) => {
                            setRetailInput(e.target.value)
                            handleAutoCalcNet(e.target.value, discountInput)
                          }}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm text-[#181715]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Discount (€)
                        </label>
                        <input
                          type="text"
                          value={discountInput}
                          onChange={(e) => {
                            setDiscountInput(e.target.value)
                            handleAutoCalcNet(retailInput, e.target.value)
                          }}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm text-[#181715]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Net Printer Price (€)
                        </label>
                        <input
                          type="text"
                          value={netInput}
                          onChange={(e) => setNetInput(e.target.value)}
                          className="w-full rounded-xl border border-[#EA580C]/60 bg-white px-3 py-2 font-mono-num text-sm font-bold text-[#181715]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 border-t border-[#EFEAE1] pt-4">
                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Total Filament Spools
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSpoolCount((c) => Math.max(0, c - 1))}
                            className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-bold cursor-pointer"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={spoolCount}
                            onChange={(e) => setSpoolCount(Math.max(0, Number(e.target.value) || 0))}
                            className="w-full rounded-xl border border-[#D6CFC2] bg-white px-3 py-2 text-center font-mono-num text-sm font-bold text-[#181715]"
                          />
                          <button
                            type="button"
                            onClick={() => setSpoolCount((c) => Math.min(50, c + 1))}
                            className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Price per Spool (€/kg)
                        </label>
                        <input
                          type="text"
                          value={spoolPriceInput}
                          onChange={(e) => setSpoolPriceInput(e.target.value)}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm text-[#181715]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Extra Cost (€) (Optional)
                        </label>
                        <input
                          type="text"
                          value={extraCostInput}
                          onChange={(e) => setExtraCostInput(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm text-[#181715]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#44403C] mb-1">
                          Extra Cost Label
                        </label>
                        <input
                          type="text"
                          value={extraCostLabel}
                          onChange={(e) => setExtraCostLabel(e.target.value)}
                          placeholder="e.g. Shipping"
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Announcement & Payment Info */}
                  <div className="rounded-2xl border border-[#DFD8CC] bg-white p-4 sm:p-5 space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#181715]">
                      Announcement & Payment Details (Optional)
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-[#44403C] mb-1">
                        Top Banner Note (leave empty to hide)
                      </label>
                      <input
                        type="text"
                        value={announcementNote}
                        onChange={(e) => setAnnouncementNote(e.target.value)}
                        placeholder="e.g. Ordering this Friday evening — join before 20:00!"
                        className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-[#181715] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentEnabled}
                        onChange={(e) => setPaymentEnabled(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#EA580C]"
                      />
                      <span>Show payment details (IBAN / Payconiq / Revolut link) to joined participants</span>
                    </label>

                    {paymentEnabled && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-[#44403C] mb-1">
                            Beneficiary Name
                          </label>
                          <input
                            type="text"
                            value={paymentBeneficiary}
                            onChange={(e) => setPaymentBeneficiary(e.target.value)}
                            placeholder="Diego Portillo"
                            className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#44403C] mb-1">
                            IBAN
                          </label>
                          <input
                            type="text"
                            value={paymentIban}
                            onChange={(e) => setPaymentIban(e.target.value)}
                            placeholder="BE00 0000 0000 0000"
                            className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm text-[#181715]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#44403C] mb-1">
                            Payment Link (Revolut / PayPal / Payconiq URL)
                          </label>
                          <input
                            type="url"
                            value={paymentLink}
                            onChange={(e) => setPaymentLink(e.target.value)}
                            placeholder="https://revolut.me/..."
                            className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#44403C] mb-1">
                            Extra Payment Note
                          </label>
                          <input
                            type="text"
                            value={paymentInstructions}
                            onChange={(e) => setPaymentInstructions(e.target.value)}
                            placeholder="e.g. Mention '3D Printer' in the transfer message!"
                            className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm text-[#181715]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA580C] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#C2410C] disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save All Settings Live'}</span>
                  </button>
                </form>
              )}

              {/* TAB 2: PARTICIPANTS MANAGER */}
              {activeTab === 'participants' && (
                <div className="space-y-6">
                  {/* Summary Strip */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-[#DFD8CC] bg-white p-3.5">
                      <div className="text-[11px] font-bold text-[#78716C]">Total People</div>
                      <div className="font-mono-num text-xl font-bold text-[#181715]">
                        {summary.currentTotalPeople}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#DFD8CC] bg-white p-3.5">
                      <div className="text-[11px] font-bold text-[#78716C]">Equal Share Now</div>
                      <div className="font-mono-num text-xl font-bold text-[#EA580C]">
                        {formatEur(summary.currentBaseShareCents, locale)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#DFD8CC] bg-white p-3.5">
                      <div className="text-[11px] font-bold text-[#78716C]">Extra Boosts</div>
                      <div className="font-mono-num text-xl font-bold text-emerald-700">
                        +{formatEur(summary.extraBoostPoolCents, locale)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#DFD8CC] bg-white p-3.5">
                      <div className="text-[11px] font-bold text-[#78716C]">Paid Backers</div>
                      <div className="font-mono-num text-xl font-bold text-[#181715]">
                        {summary.paidParticipantsCount}/{participants.length}
                      </div>
                    </div>
                  </div>

                  {/* Add Participant Manually */}
                  <form
                    onSubmit={handleAddParticipant}
                    className="rounded-2xl border border-[#DFD8CC] bg-white p-4 space-y-3"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                      + Add Participant Manually
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <input
                        type="text"
                        required
                        value={newPName}
                        onChange={(e) => setNewPName(e.target.value)}
                        placeholder="Name (e.g. Abuela)"
                        className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={newPExtraInput}
                        onChange={(e) => setNewPExtraInput(e.target.value)}
                        placeholder="Extra € boost (0.00)"
                        className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 font-mono-num text-sm"
                      />
                      <input
                        type="text"
                        value={newPNote}
                        onChange={(e) => setNewPNote(e.target.value)}
                        placeholder="Note (optional)"
                        className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#44403C]">
                          <input
                            type="checkbox"
                            checked={newPPaid}
                            onChange={(e) => setNewPPaid(e.target.checked)}
                            className="accent-[#EA580C]"
                          />
                          Paid
                        </label>
                        <button
                          type="submit"
                          disabled={busyParticipant}
                          className="ml-auto inline-flex items-center gap-1 rounded-xl bg-[#181715] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#292524] cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Participant Rows */}
                  <div className="space-y-2.5">
                    {participants.map((p) => {
                      const totalCents = computeParticipantContributionCents(
                        p,
                        summary.currentBaseShareCents
                      )
                      const extraCents = Math.max(0, totalCents - summary.currentBaseShareCents)
                      const isEditing = editingPId === p.id

                      return (
                        <div
                          key={p.id}
                          className="rounded-2xl border border-[#DFD8CC] bg-white p-3.5 sm:p-4"
                        >
                          {isEditing ? (
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4 items-center">
                              <input
                                type="text"
                                value={editPName}
                                onChange={(e) => setEditPName(e.target.value)}
                                className="rounded-xl border border-[#D6CFC2] px-3 py-1.5 text-sm font-bold"
                              />
                              <div>
                                <label className="block text-[10px] text-[#78716C]">
                                  Extra € above split
                                </label>
                                <input
                                  type="text"
                                  value={editPExtraInput}
                                  onChange={(e) => setEditPExtraInput(e.target.value)}
                                  className="w-full rounded-xl border border-[#D6CFC2] px-3 py-1.5 font-mono-num text-sm"
                                />
                              </div>
                              <input
                                type="text"
                                value={editPNote}
                                onChange={(e) => setEditPNote(e.target.value)}
                                placeholder="Note"
                                className="rounded-xl border border-[#D6CFC2] px-3 py-1.5 text-sm"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveParticipantEdit(p)}
                                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPId(null)}
                                  className="rounded-xl border border-[#DFD8CC] px-3 py-1.5 text-xs font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-display text-sm font-bold text-[#181715]">
                                    {p.display_name}
                                  </span>
                                  <span className="font-mono-num text-sm font-bold text-[#EA580C]">
                                    {formatEur(totalCents, locale)}
                                  </span>
                                  {extraCents > 0 && (
                                    <span className="text-xs font-semibold text-emerald-700">
                                      (+{formatEur(extraCents, locale)} extra)
                                    </span>
                                  )}
                                </div>
                                {p.note && <div className="text-xs text-[#6B665E]">“{p.note}”</div>}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={busyParticipant}
                                  onClick={() => handleTogglePaid(p)}
                                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                    p.is_paid
                                      ? 'bg-emerald-600 text-white'
                                      : 'border border-[#DFD8CC] bg-[#FAF8F4] text-[#57534E] hover:bg-[#EFEAE1]'
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {p.is_paid ? 'Paid' : 'Mark Paid'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPId(p.id)
                                    setEditPName(p.display_name)
                                    setEditPExtraInput(centsToInputString(extraCents))
                                    setEditPNote(p.note || '')
                                  }}
                                  className="rounded-xl border border-[#DFD8CC] p-2 text-[#57534E] hover:text-[#181715] cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteParticipant(p)}
                                  className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {participants.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-[#D6CFC2] bg-white p-6 text-center text-xs text-[#78716C]">
                        No participants have joined yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FILAMENT COLORS & VOTES */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  {/* Add New Color Form */}
                  <form
                    onSubmit={handleAddColor}
                    className="rounded-2xl border border-[#DFD8CC] bg-white p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                        + Add New Filament Color
                      </span>
                      <button
                        type="button"
                        onClick={handleResetVotes}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset All Votes
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-6 items-center">
                      <div className="flex items-center gap-2 sm:col-span-1">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="h-9 w-10 rounded border border-[#D6CFC2] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-2 py-2 font-mono-num text-xs"
                        />
                      </div>

                      <input
                        type="text"
                        required
                        value={newColorNameEn}
                        onChange={(e) => setNewColorNameEn(e.target.value)}
                        placeholder="Color name (EN) *"
                        className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-xs sm:col-span-2"
                      />

                      <input
                        type="text"
                        value={newColorMaterial}
                        onChange={(e) => setNewColorMaterial(e.target.value)}
                        placeholder="Bambu PLA Basic · 1 kg"
                        className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3 py-2 text-xs sm:col-span-2"
                      />

                      <button
                        type="submit"
                        disabled={busyColor}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#181715] px-3 py-2 text-xs font-bold text-white hover:bg-[#292524] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Color
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        value={newColorNameNl}
                        onChange={(e) => setNewColorNameNl(e.target.value)}
                        placeholder="Dutch name (optional)"
                        className="rounded-xl border border-[#ECE7DD] bg-[#FAF8F4] px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={newColorNameFr}
                        onChange={(e) => setNewColorNameFr(e.target.value)}
                        placeholder="French name (optional)"
                        className="rounded-xl border border-[#ECE7DD] bg-[#FAF8F4] px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={newColorNameEs}
                        onChange={(e) => setNewColorNameEs(e.target.value)}
                        placeholder="Spanish name (optional)"
                        className="rounded-xl border border-[#ECE7DD] bg-[#FAF8F4] px-3 py-1.5 text-xs"
                      />
                    </div>
                  </form>

                  {/* Existing Colors List */}
                  <div className="space-y-2.5">
                    {allColorsWithVotes.map((c) => {
                      const isEditingThis = editingColor?.id === c.id
                      return (
                        <div
                          key={c.id}
                          className={`rounded-2xl border bg-white p-3.5 transition ${
                            c.is_active ? 'border-[#DFD8CC]' : 'border-dashed border-[#D6CFC2] opacity-65'
                          }`}
                        >
                          {isEditingThis && editingColor ? (
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5 items-center">
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingColor.hex}
                                  onChange={(e) =>
                                    setEditingColor({ ...editingColor, hex: e.target.value })
                                  }
                                  className="h-9 w-10 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={editingColor.hex}
                                  onChange={(e) =>
                                    setEditingColor({ ...editingColor, hex: e.target.value })
                                  }
                                  className="w-full rounded-xl border border-[#D6CFC2] px-2 py-1.5 font-mono-num text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                value={editingColor.name_en}
                                onChange={(e) =>
                                  setEditingColor({ ...editingColor, name_en: e.target.value })
                                }
                                placeholder="EN Name"
                                className="rounded-xl border border-[#D6CFC2] px-3 py-1.5 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={editingColor.name_nl}
                                onChange={(e) =>
                                  setEditingColor({ ...editingColor, name_nl: e.target.value })
                                }
                                placeholder="NL Name"
                                className="rounded-xl border border-[#D6CFC2] px-3 py-1.5 text-xs"
                              />
                              <input
                                type="text"
                                value={editingColor.material}
                                onChange={(e) =>
                                  setEditingColor({ ...editingColor, material: e.target.value })
                                }
                                placeholder="Material"
                                className="rounded-xl border border-[#D6CFC2] px-3 py-1.5 text-xs"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleQuickColorPatch(editingColor, {})}
                                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingColor(null)}
                                  className="rounded-xl border border-[#DFD8CC] px-3 py-1.5 text-xs font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <FilamentSpoolSvg hex={c.hex} size={40} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-display text-sm font-bold text-[#181715]">
                                      {c.name_en}
                                    </span>
                                    <span className="text-xs text-[#78716C]">{c.material}</span>
                                    {c.isLeadingSpool && (
                                      <span className="rounded bg-[#181715] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        Top #{c.spoolRank}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-[#6B665E]">
                                    Total votes: <strong className="font-mono-num">{c.voteCount}</strong>{' '}
                                    {c.manual_votes_bonus !== 0 &&
                                      `(incl. ${c.manual_votes_bonus > 0 ? '+' : ''}${c.manual_votes_bonus} admin vote)`}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {/* Bonus Votes - / + */}
                                <div className="inline-flex items-center rounded-xl border border-[#DFD8CC] bg-[#FAF8F4] px-1.5 py-1 text-xs">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuickColorPatch(c, {
                                        manual_votes_bonus: (c.manual_votes_bonus || 0) - 1,
                                      })
                                    }
                                    className="px-1.5 font-bold hover:text-[#EA580C] cursor-pointer"
                                    title="Remove bonus vote"
                                  >
                                    −
                                  </button>
                                  <span className="px-1 font-mono-num text-[11px] font-semibold">
                                    Vote
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuickColorPatch(c, {
                                        manual_votes_bonus: (c.manual_votes_bonus || 0) + 1,
                                      })
                                    }
                                    className="px-1.5 font-bold hover:text-[#EA580C] cursor-pointer"
                                    title="Add organizer vote"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickColorPatch(c, { is_pinned: !c.is_pinned })
                                  }
                                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                                    c.is_pinned
                                      ? 'bg-amber-400/25 text-amber-950 border border-amber-400'
                                      : 'border border-[#DFD8CC] bg-[#FAF8F4] text-[#57534E]'
                                  }`}
                                >
                                  <Pin className="h-3 w-3" />
                                  {c.is_pinned ? 'Pinned' : 'Pin'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickColorPatch(c, { is_active: !c.is_active })
                                  }
                                  className="rounded-xl border border-[#DFD8CC] bg-[#FAF8F4] px-2.5 py-1.5 text-xs font-semibold text-[#57534E] cursor-pointer"
                                >
                                  {c.is_active ? 'Hide' : 'Show'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingColor(c)}
                                  className="rounded-xl border border-[#DFD8CC] p-1.5 text-[#57534E] hover:text-[#181715] cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteColor(c)}
                                  className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY / CHANGE ADMIN CODE */}
              {activeTab === 'security' && (
                <form
                  onSubmit={handleChangeAdminCode}
                  className="max-w-md mx-auto rounded-2xl border border-[#DFD8CC] bg-white p-6 space-y-4"
                >
                  <h3 className="font-display text-base font-bold text-[#181715]">
                    Change Admin Code
                  </h3>
                  <p className="text-xs text-[#6B665E]">
                    Your admin code is stored as a bcrypt hash inside a private PostgreSQL schema on Supabase.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-[#44403C] mb-1">
                      New Admin Code
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={newAdminCode}
                      onChange={(e) => setNewAdminCode(e.target.value)}
                      className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3.5 py-2.5 font-mono-num text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#44403C] mb-1">
                      Confirm New Admin Code
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={confirmAdminCode}
                      onChange={(e) => setConfirmAdminCode(e.target.value)}
                      className="w-full rounded-xl border border-[#D6CFC2] bg-[#FAF8F4] px-3.5 py-2.5 font-mono-num text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingCode}
                    className="w-full rounded-xl bg-[#181715] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#292524] cursor-pointer"
                  >
                    {savingCode ? 'Updating...' : 'Update Admin Code'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
