import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Download,
  Mail,
  Trash2,
  Search,
  Building,
  Home,
  CheckCircle2,
  AlertCircle,
  Shield,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import type { CompanyLead, LeadData, LeadStatus, PackageType, StoredLead } from '../types';
import { adminApi, AdminAuthError, type AdminStatus } from '../services/leadService';
import type { EventCounts } from '../services/kpis';
import {
  CURRENT_SOLUTION_OPTIONS,
  MONTHLY_SPEND_OPTIONS,
  SHIRT_COUNT_OPTIONS,
  SUBSIDY_OPTIONS,
} from '../config/options';
import { formatEuro } from '../config/pricing';
import { KpiPanel } from './admin/KpiPanel';
import { describePlz } from '../data/mockRoutes';

interface LeadManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastUpdated: number;
}

type Tab = 'leads' | 'companies' | 'kpis';

const TOKEN_KEY = 'hp_admin_token';
const STATUSES: LeadStatus[] = ['neu', 'kontaktiert', 'in_route', 'abgeschlossen'];
const STATUS_LABELS: Record<LeadStatus, string> = {
  neu: 'Neu',
  kontaktiert: 'Kontaktiert',
  in_route: 'In Route',
  abgeschlossen: 'Abgeschlossen',
};

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function storeToken(token: string) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Token gilt dann nur, solange das Modal offen ist
  }
}

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  // UTF-8 BOM, damit Excel Umlaute korrekt anzeigt
  const content = '﻿' + [headers.join(';'), ...rows.map((r) => r.map(csvCell).join(';'))].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const statusClass = (status: LeadStatus) =>
  status === 'neu'
    ? 'bg-[#9A7B4F]/15 border-[#9A7B4F] text-[#866941]'
    : status === 'kontaktiert'
    ? 'bg-blue-50 border-blue-400 text-blue-800'
    : status === 'in_route'
    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
    : 'bg-stone-100 border-stone-300 text-stone-600';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Badge: React.FC<{ ok: boolean; children: React.ReactNode }> = ({ ok, children }) => (
  <span
    className={`text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 border ${
      ok ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
    }`}
  >
    {children}
  </span>
);

export const LeadManagementModal: React.FC<LeadManagementModalProps> = ({ isOpen, onClose, lastUpdated }) => {
  const [token, setToken] = useState<string>(readToken);
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [allLeads, setAllLeads] = useState<StoredLead[]>([]);
  const [events, setEvents] = useState<EventCounts>({});
  const [status, setStatus] = useState<AdminStatus | null>(null);

  const [tab, setTab] = useState<Tab>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPackage, setFilterPackage] = useState<'ALL' | PackageType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | LeadStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const showFeedback = (ok: boolean, text: string) => {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleError = useCallback((err: unknown) => {
    if (err instanceof AdminAuthError) {
      storeToken('');
      setToken('');
      setAuthError(err.message);
    } else {
      showFeedback(false, (err as Error).message || 'Unbekannter Fehler');
    }
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [leadList, eventCounts, adminStatus] = await Promise.all([
        adminApi.leads(token),
        adminApi.events(token),
        adminApi.status(token),
      ]);
      setAllLeads(leadList);
      setEvents(eventCounts);
      setStatus(adminStatus);
      setAuthError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [token, handleError]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, lastUpdated, load]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const leads = useMemo(() => allLeads.filter((l): l is LeadData => l.kind === 'private'), [allLeads]);
  const companies = useMemo(() => allLeads.filter((l): l is CompanyLead => l.kind === 'company'), [allLeads]);

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filterPackage !== 'ALL' && lead.package !== filterPackage) return false;
      if (filterStatus !== 'ALL' && lead.status !== filterStatus) return false;
      if (!query) return true;
      return [lead.contact.name, lead.contact.email, lead.contact.plz, lead.id, lead.preferences.brand, lead.handover.company]
        .some((v) => v?.toLowerCase().includes(query));
    });
  }, [leads, filterPackage, filterStatus, searchQuery]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return companies.filter((c) => {
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      if (!query) return true;
      return [c.company, c.contactName, c.email, c.plz, c.id].some((v) => v.toLowerCase().includes(query));
    });
  }, [companies, filterStatus, searchQuery]);

  const updateLead = async (id: string, patch: { status?: LeadStatus; notes?: string }) => {
    try {
      const updated = await adminApi.updateLead(token, id, patch);
      setAllLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;
    storeToken(value);
    setToken(value);
    setTokenInput('');
  };

  const handleLogout = () => {
    storeToken('');
    setToken('');
    setAllLeads([]);
    setEvents({});
    setStatus(null);
  };

  const handleTestMail = async () => {
    try {
      const res = await adminApi.testMail(token);
      showFeedback(res.emailSent, res.emailSent ? `Test-Mail an ${res.recipient} versendet.` : 'Test-Mail konnte nicht versendet werden (RESEND_API_KEY prüfen).');
    } catch (err) {
      handleError(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Alle gespeicherten Reservierungen und Firmenanfragen auf dem Server unwiderruflich löschen?')) return;
    try {
      await adminApi.clearLeads(token);
      setAllLeads([]);
      setSelectedId(null);
      showFeedback(true, 'Alle Leads gelöscht.');
    } catch (err) {
      handleError(err);
    }
  };

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    if (tab === 'companies') {
      downloadCsv(
        `hemdenpilot_firmenanfragen_${date}.csv`,
        ['ID', 'Status', 'Unternehmen', 'Ansprechpartner', 'Funktion', 'E-Mail', 'Telefon', 'PLZ', 'Mitarbeiter', 'Zuschuss', 'Nachricht', 'Notizen', 'Quelle', 'Kampagne', 'Erstellt_Am'],
        filteredCompanies.map((c) => [
          c.id, c.status, c.company, c.contactName, c.role, c.email, c.phone, c.plz, c.employeesInterested,
          SUBSIDY_OPTIONS[c.employerSubsidy], c.message, c.notes, c.attribution?.utm_source, c.attribution?.utm_campaign, c.createdAt,
        ])
      );
      return;
    }
    downloadCsv(
      `hemdenpilot_reservierungen_${date}.csv`,
      [
        'ID', 'Status', 'Paket', 'Preisvariante', 'Monatspreis', 'Probemonat', 'Erstausstattung', 'PLZ', 'Name', 'E-Mail', 'Telefon',
        'Kragenweite', 'Schnitt', 'Farb-Mix', 'Marke', 'Uebergabe', 'Zeitfenster', 'Firma', 'Kollegen_ab',
        'Hemdenbestand', 'Heutige_Loesung', 'Ausgaben_Monat', 'Sakkos_Anzuege', 'Notizen', 'Quelle', 'Kampagne', 'Erstellt_Am',
      ],
      filteredLeads.map((l) => [
        l.id, l.status, l.packageName, l.priceVariant, l.pricePerMonth, l.firstMonthPrice, l.setupFee, l.contact.plz, l.contact.name,
        l.contact.email, l.contact.phone, l.preferences.collarSize, l.preferences.fit, l.preferences.colorMix, l.preferences.brand,
        l.handover.location, l.handover.slot, l.handover.company, l.handover.colleaguesCount,
        l.survey.shirtCount ? SHIRT_COUNT_OPTIONS[l.survey.shirtCount] : '',
        l.survey.currentSolution ? CURRENT_SOLUTION_OPTIONS[l.survey.currentSolution] : '',
        l.survey.monthlySpend ? MONTHLY_SPEND_OPTIONS[l.survey.monthlySpend] : '',
        l.survey.wantsSuits ? 'Ja' : 'Nein', l.notes, l.attribution?.utm_source, l.attribution?.utm_campaign, l.createdAt,
      ])
    );
  };

  if (!isOpen) return null;

  const selected = allLeads.find((l) => l.id === selectedId) || null;
  const noteValue = selected ? noteDrafts[selected.id] ?? selected.notes : '';

  const statusSelect = (lead: StoredLead) => (
    <select
      value={lead.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 border outline-none cursor-pointer ${statusClass(lead.status)}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          ● {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-[#0B111E]/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 font-jakarta text-[#18181B]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F9F8F6] border border-[#E5E0D8] w-full max-w-[1240px] h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-[#0B111E] text-[#F9F8F6] px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 border border-[#9A7B4F]/50 flex items-center justify-center text-[#9A7B4F] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-cormorant text-[18px] sm:text-[20px] font-medium tracking-[0.05em]">HEMDENPILOT</span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 bg-[#9A7B4F]/20 text-[#D9C3A0] border border-[#9A7B4F]/40">
                  Lead Management Center
                </span>
                {status && (
                  <>
                    <Badge ok={status.resendConfigured}>
                      E-Mail {status.resendConfigured ? `aktiv (${status.mode})` : 'nicht konfiguriert'}
                    </Badge>
                    <Badge ok={status.webhookConfigured}>Sheet-Webhook {status.webhookConfigured ? 'aktiv' : 'fehlt'}</Badge>
                    <Badge ok={status.depositConfigured}>Anzahlung {status.depositConfigured ? 'aktiv' : 'aus'}</Badge>
                  </>
                )}
              </div>
              {status && (
                <p className="text-[10px] sm:text-[11px] text-[#A8A29E] m-0">
                  Benachrichtigungen an {status.recipient}. Die Liste hier zeigt den Server-Speicher; maßgeblich ist das Google Sheet.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {token && (
              <>
                <button
                  onClick={load}
                  disabled={loading}
                  className="px-3 py-1.5 bg-transparent border border-white/20 hover:bg-white/10 text-[11px] font-medium tracking-[0.1em] uppercase flex items-center gap-1.5 cursor-pointer min-h-[36px] disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Aktualisieren</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-transparent border border-white/20 hover:bg-white/10 text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer min-h-[36px]"
                >
                  Abmelden
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-transparent border border-white/20 hover:bg-white/10 text-[11px] font-medium tracking-[0.1em] uppercase flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Schließen</span>
            </button>
          </div>
        </div>

        {!token ? (
          /* Token-Abfrage */
          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleLogin} className="w-full max-w-[380px] bg-[#FFFFFF] border border-[#E5E0D8] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#9A7B4F]">
                <KeyRound className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Betreiber-Zugang</span>
              </div>
              <p className="m-0 text-xs leading-[1.6] text-[#57534E]">
                Bitte das Admin-Token eingeben (Umgebungsvariable <code>ADMIN_TOKEN</code> auf dem Server). Es wird nur für diese Browser-Sitzung gespeichert.
              </p>
              <input
                type="password"
                autoComplete="current-password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="p-3 bg-[#F9F8F6] border border-[#E5E0D8] text-sm outline-none focus:border-[#9A7B4F]"
              />
              {authError && (
                <div className="flex items-center gap-2 text-xs text-[#9A3412]">
                  <AlertCircle className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}
              <button type="submit" className="py-3 bg-[#0B111E] text-[#F9F8F6] text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#18181B]">
                Anmelden
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-[#F2EFE9] border-b border-[#E5E0D8] px-4 sm:px-6 flex gap-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
              {([
                ['leads', `Reservierungen (${leads.length})`],
                ['companies', `Firmenanfragen (${companies.length})`],
                ['kpis', 'Kennzahlen'],
              ] as [Tab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setSelectedId(null);
                  }}
                  className={`px-3 sm:px-4 py-3 border-b-2 cursor-pointer transition-colors ${
                    tab === key ? 'border-[#9A7B4F] text-[#18181B]' : 'border-transparent text-[#57534E] hover:text-[#18181B]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Action Toolbar */}
            {tab !== 'kpis' && (
              <div className="bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
                  <div className="relative flex-1 min-w-[180px] max-w-[320px]">
                    <Search className="w-3.5 h-3.5 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Name, Firma, E-Mail, PLZ oder ID…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E0D8] outline-none focus:border-[#9A7B4F]"
                    />
                  </div>
                  {tab === 'leads' && (
                    <select
                      value={filterPackage}
                      onChange={(e) => setFilterPackage(e.target.value as 'ALL' | PackageType)}
                      className="py-1.5 px-2.5 text-xs bg-[#F9F8F6] border border-[#E5E0D8] outline-none text-[#57534E]"
                    >
                      <option value="ALL">Alle Pakete</option>
                      <option value="A">Nur Paket A</option>
                      <option value="B">Nur Paket B</option>
                    </select>
                  )}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'ALL' | LeadStatus)}
                    className="py-1.5 px-2.5 text-xs bg-[#F9F8F6] border border-[#E5E0D8] outline-none text-[#57534E]"
                  >
                    <option value="ALL">Alle Status</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExport}
                    disabled={tab === 'leads' ? filteredLeads.length === 0 : filteredCompanies.length === 0}
                    className="px-3 py-1.5 bg-[#0B111E] hover:bg-[#18181B] text-[#F9F8F6] text-[11px] font-semibold tracking-[0.08em] uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9A7B4F]" />
                    <span>CSV Export</span>
                  </button>
                  <button
                    onClick={handleTestMail}
                    className="px-3 py-1.5 bg-[#F9F8F6] hover:bg-[#F2EFE9] border border-[#9A7B4F]/50 text-[11px] font-semibold tracking-[0.08em] uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#9A7B4F]" />
                    <span>Test-Mail</span>
                  </button>
                </div>
              </div>
            )}

            {feedback && (
              <div
                className={`border-b px-6 py-2 text-xs font-medium flex items-center gap-2 ${
                  feedback.ok ? 'bg-[#9A7B4F]/10 border-[#9A7B4F]/30 text-[#866941]' : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {feedback.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {tab === 'kpis' && <KpiPanel leads={leads} companies={companies} events={events} />}

                {tab === 'leads' &&
                  (filteredLeads.length === 0 ? (
                    <p className="text-center text-xs text-[#57534E] py-16">
                      {leads.length === 0 ? 'Noch keine Reservierungen gespeichert.' : 'Kein Lead entspricht Ihren Filtern.'}
                    </p>
                  ) : (
                    <div className="border border-[#E5E0D8] bg-[#FFFFFF] overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-[#F2EFE9] text-[#57534E] text-[10px] tracking-[0.14em] uppercase border-b border-[#E5E0D8]">
                            <th className="py-3 px-3.5 font-semibold">Status</th>
                            <th className="py-3 px-3.5 font-semibold">Kontakt</th>
                            <th className="py-3 px-3.5 font-semibold">PLZ &amp; Übergabe</th>
                            <th className="py-3 px-3.5 font-semibold">Paket</th>
                            <th className="py-3 px-3.5 font-semibold">Datum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E0D8]">
                          {filteredLeads.map((lead) => (
                            <tr
                              key={lead.id}
                              onClick={() => setSelectedId(lead.id === selectedId ? null : lead.id)}
                              className={`hover:bg-[#F9F8F6] cursor-pointer ${lead.id === selectedId ? 'bg-[#9A7B4F]/10' : ''}`}
                            >
                              <td className="py-3 px-3.5 align-top">{statusSelect(lead)}</td>
                              <td className="py-3 px-3.5 align-top">
                                <div className="font-semibold text-[13px]">{lead.contact.name}</div>
                                <div className="text-[#57534E] text-[11px] mt-0.5">{lead.contact.email}</div>
                                {lead.contact.phone && <div className="text-[#866941] text-[11px] mt-0.5 font-mono">{lead.contact.phone}</div>}
                              </td>
                              <td className="py-3 px-3.5 align-top">
                                <div className="font-semibold">{describePlz(lead.contact.plz)}</div>
                                <div className="text-[#57534E] text-[11px] mt-0.5 flex items-center gap-1">
                                  {lead.handover.type === 'B2B' ? <Building className="w-3 h-3 text-[#9A7B4F]" /> : <Home className="w-3 h-3" />}
                                  <span>{lead.handover.location}</span>
                                </div>
                                {lead.handover.type === 'B2B' && (lead.handover.company || lead.handover.colleaguesCount) ? (
                                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#9A7B4F] bg-[#9A7B4F]/10 px-1.5 py-0.5">
                                    {lead.handover.company || 'Firma ?'} · {lead.handover.colleaguesCount ?? 0}+ Kollegen
                                  </span>
                                ) : null}
                              </td>
                              <td className="py-3 px-3.5 align-top">
                                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 ${lead.package === 'A' ? 'bg-[#0B111E] text-[#F9F8F6]' : 'bg-[#E5E0D8]'}`}>
                                  Paket {lead.package}
                                </span>{' '}
                                <span className="font-medium">{formatEuro(lead.pricePerMonth)}</span>
                                {lead.priceVariant !== 'standard' && <div className="text-[10px] text-[#866941] mt-1">Preistest {lead.priceVariant}</div>}
                              </td>
                              <td className="py-3 px-3.5 align-top text-[#57534E] text-[11px]">{formatDate(lead.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                {tab === 'companies' &&
                  (filteredCompanies.length === 0 ? (
                    <p className="text-center text-xs text-[#57534E] py-16">
                      {companies.length === 0 ? 'Noch keine Firmenanfragen.' : 'Keine Anfrage entspricht Ihren Filtern.'}
                    </p>
                  ) : (
                    <div className="border border-[#E5E0D8] bg-[#FFFFFF] overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-[#F2EFE9] text-[#57534E] text-[10px] tracking-[0.14em] uppercase border-b border-[#E5E0D8]">
                            <th className="py-3 px-3.5 font-semibold">Status</th>
                            <th className="py-3 px-3.5 font-semibold">Unternehmen</th>
                            <th className="py-3 px-3.5 font-semibold">Ansprechpartner</th>
                            <th className="py-3 px-3.5 font-semibold">PLZ</th>
                            <th className="py-3 px-3.5 font-semibold">Mitarbeiter</th>
                            <th className="py-3 px-3.5 font-semibold">Zuschuss</th>
                            <th className="py-3 px-3.5 font-semibold">Datum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E0D8]">
                          {filteredCompanies.map((c) => (
                            <tr
                              key={c.id}
                              onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                              className={`hover:bg-[#F9F8F6] cursor-pointer ${c.id === selectedId ? 'bg-[#9A7B4F]/10' : ''}`}
                            >
                              <td className="py-3 px-3.5 align-top">{statusSelect(c)}</td>
                              <td className="py-3 px-3.5 align-top font-semibold text-[13px]">{c.company}</td>
                              <td className="py-3 px-3.5 align-top">
                                <div>{c.contactName}{c.role ? ` (${c.role})` : ''}</div>
                                <div className="text-[#57534E] text-[11px]">{c.email}</div>
                              </td>
                              <td className="py-3 px-3.5 align-top">{describePlz(c.plz)}</td>
                              <td className={`py-3 px-3.5 align-top ${c.employeesInterested >= 4 ? 'font-semibold text-[#866941]' : ''}`}>{c.employeesInterested}</td>
                              <td className="py-3 px-3.5 align-top">{SUBSIDY_OPTIONS[c.employerSubsidy]}</td>
                              <td className="py-3 px-3.5 align-top text-[#57534E] text-[11px]">{formatDate(c.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>

              {/* Detail-Ansicht */}
              {selected && tab !== 'kpis' && (
                <div className="w-[360px] shrink-0 bg-[#FFFFFF] border-l border-[#E5E0D8] p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                  <div className="flex items-start justify-between pb-3 border-b border-[#E5E0D8]">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A7B4F]">
                        {selected.kind === 'company' ? 'Firmenanfrage' : 'Reservierung'}
                      </span>
                      <h3 className="font-cormorant text-xl font-semibold m-0">{selected.id}</h3>
                    </div>
                    <button onClick={() => setSelectedId(null)} className="text-[#57534E] hover:text-[#18181B] p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#F9F8F6] border border-[#E5E0D8] p-4 space-y-2">
                    {selected.kind === 'private' ? (
                      <>
                        <div><strong>{selected.contact.name}</strong><br />{selected.contact.email}<br />{selected.contact.phone}</div>
                        <div className="pt-2 border-t border-[#E5E0D8]">
                          {selected.packageName}<br />
                          {formatEuro(selected.pricePerMonth)} / Monat · 1. Monat {formatEuro(selected.firstMonthPrice)}
                          {selected.setupFee > 0 && <> · Erstausstattung {formatEuro(selected.setupFee)}</>}
                        </div>
                        {selected.package === 'A' && (
                          <div className="pt-2 border-t border-[#E5E0D8]">
                            Kragenweite {selected.preferences.collarSize} · {selected.preferences.fit} · {selected.preferences.colorMix}
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#E5E0D8]">Marke: {selected.preferences.brand}</div>
                        <div className="pt-2 border-t border-[#E5E0D8]">
                          {selected.handover.location} ({selected.handover.slot})
                          {selected.handover.type === 'B2B' && (
                            <><br />Firma: {selected.handover.company || '–'} · Kollegen: {selected.handover.colleaguesCount ?? 0}+</>
                          )}
                        </div>
                        <div className="pt-2 border-t border-[#E5E0D8] text-[#57534E]">
                          Hemden: {selected.survey.shirtCount ? SHIRT_COUNT_OPTIONS[selected.survey.shirtCount] : '–'}<br />
                          Heute: {selected.survey.currentSolution ? CURRENT_SOLUTION_OPTIONS[selected.survey.currentSolution] : '–'}<br />
                          Ausgaben: {selected.survey.monthlySpend ? MONTHLY_SPEND_OPTIONS[selected.survey.monthlySpend] : '–'}<br />
                          Sakkos/Anzüge: {selected.survey.wantsSuits ? 'Ja' : 'Nein'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div><strong>{selected.company}</strong><br />{selected.contactName}{selected.role ? ` (${selected.role})` : ''}<br />{selected.email}<br />{selected.phone}</div>
                        <div className="pt-2 border-t border-[#E5E0D8]">
                          {describePlz(selected.plz)} · {selected.employeesInterested} Mitarbeiter · Zuschuss: {SUBSIDY_OPTIONS[selected.employerSubsidy]}
                        </div>
                        {selected.message && <div className="pt-2 border-t border-[#E5E0D8] whitespace-pre-wrap">{selected.message}</div>}
                      </>
                    )}
                    <div className="pt-2 border-t border-[#E5E0D8] text-[#57534E]">
                      Quelle: {selected.attribution?.utm_source || 'direkt'}
                      {selected.attribution?.utm_campaign && ` / ${selected.attribution.utm_campaign}`}
                    </div>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E]">Interne Notizen</span>
                    <textarea
                      rows={4}
                      value={noteValue}
                      onChange={(e) => setNoteDrafts({ ...noteDrafts, [selected.id]: e.target.value })}
                      onBlur={() => {
                        if (noteDrafts[selected.id] !== undefined && noteDrafts[selected.id] !== selected.notes) {
                          updateLead(selected.id, { notes: noteDrafts[selected.id] });
                        }
                      }}
                      className="w-full p-2.5 border border-[#E5E0D8] outline-none focus:border-[#9A7B4F]"
                    />
                    <span className="text-[10px] text-[#A8A29E]">Wird beim Verlassen des Feldes auf dem Server gespeichert.</span>
                  </label>

                  <a
                    href={`mailto:${selected.kind === 'company' ? selected.email : selected.contact.email}?subject=${encodeURIComponent(`Ihre Hemdenpilot-Anfrage (${selected.id})`)}`}
                    className="w-full py-2.5 bg-[#9A7B4F] text-[#0B111E] text-center font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#866941]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Per E-Mail kontaktieren</span>
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#F2EFE9] border-t border-[#E5E0D8] px-6 py-3 flex items-center justify-end text-xs">
              <button
                onClick={handleClearAll}
                disabled={allLeads.length === 0}
                className="text-[#9A3412] hover:underline text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3" />
                <span>Alle Leads auf dem Server löschen</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
