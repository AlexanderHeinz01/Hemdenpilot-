import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Mail,
  Trash2,
  Search,
  Filter,
  Check,
  Send,
  Building,
  Home,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { LeadData, PackageType } from '../types';

interface LeadManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastUpdated: number;
}

const STORAGE_KEY = 'hemdenpilot_leads';
const WEBHOOK_KEY = 'hemdenpilot_webhook_url';

export const LeadManagementModal: React.FC<LeadManagementModalProps> = ({
  isOpen,
  onClose,
  lastUpdated,
}) => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPackage, setFilterPackage] = useState<'ALL' | PackageType>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookSaved, setWebhookSaved] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // Load leads and webhook config
  const loadLeads = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setLeads(stored);
    } catch {
      setLeads([]);
    }
  };

  useEffect(() => {
    loadLeads();
    const savedWebhook = localStorage.getItem(WEBHOOK_KEY) || '';
    setWebhookUrl(savedWebhook);
  }, [lastUpdated, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const updateLeadStatus = (id: string, newStatus: LeadData['status']) => {
    const updated = leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateLeadNote = (id: string, note: string) => {
    const updated = leads.map((l) => (l.id === id ? { ...l, notes: note } : l));
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(WEBHOOK_KEY, webhookUrl.trim());
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) return;
    try {
      const testPayload = leads[0] || {
        id: 'HP-TEST-70173',
        event: 'lead_reserved',
        package: 'A',
        packageName: 'Paket A – Die Executive-Rotation',
        pricePerMonth: 119,
        firstMonthPrice: 59.5,
        contact: {
          plz: '70173',
          name: 'Test Partner',
          email: 'test@partner-stuttgart.de',
          phone: '+49 711 123456',
        },
        preferences: {
          collarSize: '41',
          fit: 'Slim Fit',
          colorMix: '3x Weiß / 2x Hellblau',
          brand: 'Eton',
        },
        handover: {
          type: 'B2B',
          location: 'Kanzlei-Empfang Königstraße',
          slot: 'Montag bis 09:00',
          colleaguesInterested: true,
        },
        city: 'Stuttgart',
        createdAt: new Date().toISOString(),
      };

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        mode: 'no-cors',
      });
      alert('Test-Event erfolgreich an den Webhook gesendet.');
    } catch (err) {
      alert('Fehler beim Webhook-Aufruf: ' + (err as Error).message);
    }
  };

  // CSV Export with UTF-8 BOM for German Excel compatibility
  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = [
      'ID',
      'Status',
      'Paket',
      'Monatspreis (EUR)',
      'Probemonat (EUR)',
      'PLZ',
      'Name',
      'E-Mail',
      'Telefon',
      'Kragenweite',
      'Schnitt',
      'Farb-Mix',
      'Marke',
      'Uebergabe-Typ',
      'Uebergabe-Ort',
      'Uebergabe-Zeitfenster',
      'B2B_Kollegen_Interesse',
      'Notizen',
      'Erstellt_Am',
    ];

    const rows = leads.map((l) => [
      l.id,
      l.status || 'neu',
      `"${l.packageName.replace(/"/g, '""')}"`,
      l.pricePerMonth,
      l.firstMonthPrice,
      l.contact?.plz || '',
      `"${(l.contact?.name || '').replace(/"/g, '""')}"`,
      `"${(l.contact?.email || '').replace(/"/g, '""')}"`,
      `"${(l.contact?.phone || '').replace(/"/g, '""')}"`,
      `"${l.preferences?.collarSize || ''}"`,
      `"${l.preferences?.fit || ''}"`,
      `"${(l.preferences?.colorMix || '-').replace(/"/g, '""')}"`,
      `"${(l.preferences?.brand || '').replace(/"/g, '""')}"`,
      l.handover?.type || '',
      `"${(l.handover?.location || '').replace(/"/g, '""')}"`,
      `"${(l.handover?.slot || '').replace(/"/g, '""')}"`,
      l.handover?.type === 'B2B' && (l.handover as any).colleaguesInterested ? 'Ja' : 'Nein',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.createdAt,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Excel displays German characters properly
    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hemdenpilot_leads_stuttgart_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy as Tab-Separated Values (TSV) for direct paste into Google Sheets / Excel
  const handleCopyForSheets = () => {
    if (leads.length === 0) return;
    const headers = [
      'ID',
      'Status',
      'Paket',
      'Monatspreis',
      'PLZ',
      'Name',
      'E-Mail',
      'Telefon',
      'Kragenweite',
      'Schnitt',
      'Farb-Mix',
      'Marke',
      'Übergabe',
      'B2B Kollegen',
      'Datum',
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      l.status || 'neu',
      l.package === 'A' ? 'Paket A (119 €)' : 'Paket B (79 €)',
      `${l.pricePerMonth} €`,
      l.contact?.plz,
      l.contact?.name,
      l.contact?.email,
      l.contact?.phone || '-',
      l.preferences?.collarSize,
      l.preferences?.fit,
      l.preferences?.colorMix || '-',
      l.preferences?.brand,
      l.handover?.location,
      l.handover?.type === 'B2B' && (l.handover as any).colleaguesInterested ? 'Ja' : 'Nein',
      new Date(l.createdAt).toLocaleDateString('de-DE'),
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopyFeedback('Tabelle in Zwischenablage kopiert! (Jetzt in Google Sheets einfügen)');
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleSeedSampleLeads = () => {
    const samples: LeadData[] = [
      {
        id: 'HP-70173-8412',
        event: 'lead_reserved',
        package: 'A',
        packageName: 'Paket A – Die Executive-Rotation',
        pricePerMonth: 119,
        firstMonthPrice: 59.5,
        status: 'neu',
        preferences: {
          collarSize: '41',
          fit: 'Slim Fit',
          colorMix: '3x Weiß / 2x Hellblau',
          brand: 'Eton',
        },
        handover: {
          type: 'B2B',
          location: 'Kanzlei-Empfang Königstraße',
          slot: 'Montag bis 09:00',
          colleaguesInterested: true,
        },
        contact: {
          plz: '70173',
          name: 'Dr. Florian von Berg',
          email: 'florian.vonberg@stuttgart-law.de',
          phone: '+49 171 4920194',
        },
        city: 'Stuttgart',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        notes: 'Große Partner-Kanzlei, hat nach 10er-Kontingent gefragt.',
      },
      {
        id: 'HP-70192-3195',
        event: 'lead_reserved',
        package: 'B',
        packageName: 'Paket B – Der Logistik-Autopilot',
        pricePerMonth: 79,
        firstMonthPrice: 39.5,
        status: 'kontaktiert',
        preferences: {
          collarSize: '40',
          fit: 'Modern / Tailored Fit',
          colorMix: null,
          brand: 'Olymp',
        },
        handover: {
          type: 'B2C',
          location: 'Privatadresse an der Wohnungstür',
          slot: 'Sonntag 18:00–21:00',
        },
        contact: {
          plz: '70192',
          name: 'Maximilian Seiler',
          email: 'm.seiler@management-partner.com',
          phone: '+49 160 8829104',
        },
        city: 'Stuttgart',
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        notes: 'Bevorzugt kontaktlose Ablage am Killesberg.',
      },
      {
        id: 'HP-70567-9201',
        event: 'lead_reserved',
        package: 'A',
        packageName: 'Paket A – Die Executive-Rotation',
        pricePerMonth: 119,
        firstMonthPrice: 59.5,
        status: 'in_route',
        preferences: {
          collarSize: '42',
          fit: 'Regular Fit',
          colorMix: '5x Weiß',
          brand: 'Eterna',
        },
        handover: {
          type: 'B2B',
          location: 'Unternehmensberatung Degerloch',
          slot: 'Montag bis 09:00',
          colleaguesInterested: true,
        },
        contact: {
          plz: '70567',
          name: 'Christoph Weber',
          email: 'weber@weber-advisory.de',
          phone: '+49 172 9018234',
        },
        city: 'Stuttgart',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        notes: 'Erstlieferung für kommenden Montag eingeplant.',
      },
    ];

    const combined = [...samples, ...leads];
    setLeads(combined);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
  };

  const handleClearAll = () => {
    if (confirm('Möchten Sie wirklich alle gespeicherten Lead-Daten unwiderruflich löschen?')) {
      localStorage.removeItem(STORAGE_KEY);
      setLeads([]);
      setSelectedLeadId(null);
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterPackage !== 'ALL' && lead.package !== filterPackage) return false;
      if (filterStatus !== 'ALL' && (lead.status || 'neu') !== filterStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = lead.contact?.name?.toLowerCase().includes(query);
        const matchesEmail = lead.contact?.email?.toLowerCase().includes(query);
        const matchesPlz = lead.contact?.plz?.includes(query);
        const matchesId = lead.id?.toLowerCase().includes(query);
        const matchesBrand = lead.preferences?.brand?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPlz && !matchesId && !matchesBrand) {
          return false;
        }
      }
      return true;
    });
  }, [leads, filterPackage, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = leads.length;
    const pkgA = leads.filter((l) => l.package === 'A').length;
    const pkgB = leads.filter((l) => l.package === 'B').length;
    const b2bInterests = leads.filter(
      (l) => l.handover?.type === 'B2B' && (l.handover as any).colleaguesInterested
    ).length;
    const totalMrr = pkgA * 119 + pkgB * 79;
    return { total, pkgA, pkgB, b2bInterests, totalMrr };
  }, [leads]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  if (!isOpen) return null;

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
                <span className="font-cormorant text-[18px] sm:text-[20px] font-medium tracking-[0.05em] text-[#F9F8F6]">
                  HEMDENPILOT
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] uppercase px-2 py-0.5 bg-[#9A7B4F]/20 text-[#D9C3A0] border border-[#9A7B4F]/40">
                  Lead Management Center (Stuttgart)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#A8A29E] m-0">
                Diskrete Lead-Verwaltung · Daten werden lokal im Browser &amp; optional per Webhook synchronisiert
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-transparent border border-white/20 text-[#F9F8F6] hover:bg-white/10 text-[11px] font-medium tracking-[0.1em] uppercase transition flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Schließen</span>
            </button>
          </div>
        </div>

        {/* Top KPI Ribbon */}
        <div className="bg-[#F2EFE9] border-b border-[#E5E0D8] px-4 sm:px-6 py-2.5 sm:py-3.5 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
              Reservierungen
            </span>
            <span className="text-xl font-cormorant font-semibold text-[#18181B]">
              {stats.total} <span className="text-xs font-jakarta text-[#57534E]">von 50 Pilotplätzen</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
              Paket A (Full-Service)
            </span>
            <span className="text-xl font-cormorant font-semibold text-[#9A7B4F]">
              {stats.pkgA} <span className="text-xs font-jakarta text-[#57534E]">(119 € / Mt.)</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
              Paket B (Eigene Hemden)
            </span>
            <span className="text-xl font-cormorant font-semibold text-[#18181B]">
              {stats.pkgB} <span className="text-xs font-jakarta text-[#57534E]">(79 € / Mt.)</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
              Potenzieller MRR
            </span>
            <span className="text-xl font-cormorant font-semibold text-[#18181B]">
              {stats.totalMrr.toLocaleString('de-DE')} € <span className="text-xs font-jakarta text-[#57534E]">/ Monat</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
              B2B-Multiplikatoren
            </span>
            <span className="text-xl font-cormorant font-semibold text-[#18181B]">
              {stats.b2bInterests} <span className="text-xs font-jakarta text-[#57534E]">Kanzlei-Teams</span>
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
            <div className="relative flex-1 min-w-[180px] max-w-[320px]">
              <Search className="w-3.5 h-3.5 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name, E-Mail, PLZ oder ID suchen…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E0D8] outline-none focus:border-[#9A7B4F]"
              />
            </div>

            {/* Package Filter */}
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-[#F9F8F6] border border-[#E5E0D8] outline-none text-[#57534E] focus:border-[#9A7B4F]"
            >
              <option value="ALL">Alle Pakete</option>
              <option value="A">Nur Paket A (119 €)</option>
              <option value="B">Nur Paket B (79 €)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#F9F8F6] border border-[#E5E0D8] outline-none text-[#57534E] focus:border-[#9A7B4F]"
            >
              <option value="ALL">Alle Status</option>
              <option value="neu">Neu</option>
              <option value="kontaktiert">Kontaktiert</option>
              <option value="in_route">In Route eingeplant</option>
              <option value="abgeschlossen">Abgeschlossen</option>
            </select>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyForSheets}
              disabled={leads.length === 0}
              className="px-3 py-1.5 bg-[#F9F8F6] hover:bg-[#F2EFE9] border border-[#E5E0D8] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#18181B] flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition"
              title="Kopiert Tabelle formatiert für Google Sheets / Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>Tabelle für Sheets kopieren</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={leads.length === 0}
              className="px-3 py-1.5 bg-[#0B111E] hover:bg-[#18181B] text-[#F9F8F6] text-[11px] font-semibold tracking-[0.08em] uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>CSV Export (Excel)</span>
            </button>

            {leads.length === 0 && (
              <button
                onClick={handleSeedSampleLeads}
                className="px-3 py-1.5 bg-[#9A7B4F] text-[#0B111E] text-[11px] font-semibold tracking-[0.08em] uppercase hover:bg-[#866941] flex items-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>3 Test-Leads laden</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback message banner */}
        {copyFeedback && (
          <div className="bg-[#9A7B4F]/10 border-b border-[#9A7B4F]/30 px-6 py-2 text-xs text-[#9A7B4F] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{copyFeedback}</span>
          </div>
        )}

        {/* Main Content Area: Leads Table + Detail Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Table / List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {filteredLeads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#57534E]">
                <div className="w-12 h-12 border border-[#E5E0D8] flex items-center justify-center mb-3 text-[#A8A29E]">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="font-cormorant text-xl text-[#18181B] mb-1">
                  Keine Reservierungen gefunden
                </h4>
                <p className="text-xs max-w-sm mb-4">
                  {leads.length === 0
                    ? 'Es sind aktuell noch keine Leads im System gespeichert. Sie können mit einem Klick realistische Test-Daten anlegen.'
                    : 'Kein Lead entspricht Ihren aktuellen Filtern.'}
                </p>
                {leads.length === 0 && (
                  <button
                    onClick={handleSeedSampleLeads}
                    className="px-4 py-2 bg-[#9A7B4F] text-[#0B111E] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Beispiel-Leads laden
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-[#E5E0D8] bg-[#FFFFFF]">
                <table className="w-full border-collapse text-left text-xs font-jakarta">
                  <thead>
                    <tr className="bg-[#F2EFE9] text-[#57534E] text-[10px] tracking-[0.14em] uppercase border-b border-[#E5E0D8]">
                      <th className="py-3 px-3.5 font-semibold">Status</th>
                      <th className="py-3 px-3.5 font-semibold">Kontakt / Lead</th>
                      <th className="py-3 px-3.5 font-semibold">PLZ &amp; Übergabe</th>
                      <th className="py-3 px-3.5 font-semibold">Paket &amp; Konfiguration</th>
                      <th className="py-3 px-3.5 font-semibold">Datum</th>
                      <th className="py-3 px-3.5 font-semibold text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {filteredLeads.map((lead) => {
                      const isSelected = lead.id === selectedLeadId;
                      const status = lead.status || 'neu';
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLeadId(isSelected ? null : lead.id)}
                          className={`hover:bg-[#F9F8F6] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#9A7B4F]/10' : ''
                          }`}
                        >
                          {/* Status */}
                          <td className="py-3 px-3.5 align-top">
                            <select
                              value={status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                updateLeadStatus(lead.id, e.target.value as any)
                              }
                              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 border outline-none cursor-pointer ${
                                status === 'neu'
                                  ? 'bg-[#9A7B4F]/15 border-[#9A7B4F] text-[#866941]'
                                  : status === 'kontaktiert'
                                  ? 'bg-blue-50 border-blue-400 text-blue-800'
                                  : status === 'in_route'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                  : 'bg-stone-100 border-stone-300 text-stone-600'
                              }`}
                            >
                              <option value="neu">● Neu</option>
                              <option value="kontaktiert">● Kontaktiert</option>
                              <option value="in_route">● In Route</option>
                              <option value="abgeschlossen">● Abgeschlossen</option>
                            </select>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="font-semibold text-[#18181B] text-[13px]">
                              {lead.contact?.name || 'Unbekannt'}
                            </div>
                            <div className="text-[#57534E] text-[11px] mt-0.5">
                              {lead.contact?.email}
                            </div>
                            {lead.contact?.phone && (
                              <div className="text-[#866941] text-[11px] mt-0.5 font-mono">
                                {lead.contact.phone}
                              </div>
                            )}
                          </td>

                          {/* PLZ & Übergabe */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="font-semibold text-[#18181B]">
                              PLZ {lead.contact?.plz} Stuttgart
                            </div>
                            <div className="text-[#57534E] text-[11px] mt-0.5 flex items-center gap-1">
                              {lead.handover?.type === 'B2B' ? (
                                <>
                                  <Building className="w-3 h-3 text-[#9A7B4F]" />
                                  <span>Büro / Kanzlei</span>
                                </>
                              ) : (
                                <>
                                  <Home className="w-3 h-3 text-[#57534E]" />
                                  <span>Privatwohnung</span>
                                </>
                              )}
                            </div>
                            {lead.handover?.type === 'B2B' &&
                              (lead.handover as any).colleaguesInterested && (
                                <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#9A7B4F] bg-[#9A7B4F]/10 px-1.5 py-0.5">
                                  3+ Kollegen B2B
                                </span>
                              )}
                          </td>

                          {/* Package & Config */}
                          <td className="py-3 px-3.5 align-top">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 ${
                                  lead.package === 'A'
                                    ? 'bg-[#0B111E] text-[#F9F8F6]'
                                    : 'bg-[#E5E0D8] text-[#18181B]'
                                }`}
                              >
                                Paket {lead.package}
                              </span>
                              <span className="font-medium text-[#18181B]">
                                {lead.pricePerMonth} €/Mt.
                              </span>
                            </div>
                            <div className="text-[#57534E] text-[11px] mt-1">
                              Gr. {lead.preferences?.collarSize} · {lead.preferences?.fit} ·{' '}
                              {lead.preferences?.brand}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3.5 align-top text-[#57534E] text-[11px]">
                            {new Date(lead.createdAt).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`mailto:${lead.contact?.email}?subject=Ihr%20Hemdenpilot-Start%20in%20Stuttgart%20(${lead.id})&body=Guten%20Tag%20${encodeURIComponent(
                                  lead.contact?.name || ''
                                )},%0D%0A%0D%0Avielen%20Dank%20f%C3%BCr%20Ihre%20Reservierung%20f%C3%BCr%20das%20${encodeURIComponent(
                                  lead.packageName
                                )}%20in%20Stuttgart%20(PLZ%20${
                                  lead.contact?.plz
                                }).%0D%0A%0D%0AWir%20bereiten%20aktuell%20die%20Routenfreigabe%20vor...`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 text-[#57534E] hover:text-[#9A7B4F] hover:bg-[#F2EFE9] transition"
                                title="E-Mail an Kunden schreiben"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeadId(lead.id);
                                }}
                                className="text-[10px] uppercase font-semibold text-[#866941] hover:underline"
                              >
                                Details →
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Lead Detail Drawer */}
          {selectedLead && (
            <div className="w-[380px] bg-[#FFFFFF] border-l border-[#E5E0D8] p-6 flex flex-col justify-between overflow-y-auto">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A7B4F]">
                      Reservierungs-Akte
                    </span>
                    <h3 className="font-cormorant text-2xl font-semibold text-[#18181B] m-0">
                      {selectedLead.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLeadId(null)}
                    className="text-[#57534E] hover:text-[#18181B] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Switcher */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] block mb-1.5">
                    Aktueller Bearbeitungs-Status
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['neu', 'kontaktiert', 'in_route', 'abgeschlossen'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => updateLeadStatus(selectedLead.id, st)}
                          className={`py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider border text-left transition ${
                            (selectedLead.status || 'neu') === st
                              ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
                              : 'bg-[#F9F8F6] text-[#57534E] border-[#E5E0D8] hover:border-[#9A7B4F]'
                          }`}
                        >
                          {st === 'neu' && '1. Neu'}
                          {st === 'kontaktiert' && '2. Kontaktiert'}
                          {st === 'in_route' && '3. In Route'}
                          {st === 'abgeschlossen' && '4. Abgeschlossen'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Lead Summary Details */}
                <div className="space-y-3 text-xs bg-[#F9F8F6] p-4 border border-[#E5E0D8]">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#57534E] block">
                      Kunde
                    </span>
                    <div className="font-semibold text-sm text-[#18181B]">
                      {selectedLead.contact?.name}
                    </div>
                    <div className="text-[#57534E]">{selectedLead.contact?.email}</div>
                    {selectedLead.contact?.phone && (
                      <div className="text-[#866941] font-mono mt-0.5">
                        {selectedLead.contact.phone}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-semibold text-[#57534E] block">
                      Paket
                    </span>
                    <div className="font-semibold text-[#18181B]">
                      {selectedLead.packageName}
                    </div>
                    <div className="text-[#57534E]">
                      Regulär: {selectedLead.pricePerMonth} € / Monat · Startmonat:{' '}
                      {selectedLead.firstMonthPrice} €
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-semibold text-[#57534E] block">
                      Passform &amp; Konfiguration
                    </span>
                    <div className="text-[#18181B]">
                      Kragenweite: <strong>{selectedLead.preferences?.collarSize}</strong> ·{' '}
                      {selectedLead.preferences?.fit}
                    </div>
                    {selectedLead.preferences?.colorMix && (
                      <div className="text-[#18181B]">
                        Mix: {selectedLead.preferences.colorMix}
                      </div>
                    )}
                    <div className="text-[#57534E]">
                      Bevorzugte Marke: {selectedLead.preferences?.brand}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-semibold text-[#57534E] block">
                      Übergabeort &amp; Slot
                    </span>
                    <div className="font-semibold text-[#18181B]">
                      {selectedLead.handover?.location}
                    </div>
                    <div className="text-[#57534E]">{selectedLead.handover?.slot}</div>
                    {selectedLead.handover?.type === 'B2B' &&
                      (selectedLead.handover as any).colleaguesInterested && (
                        <div className="mt-1 text-[#9A7B4F] font-semibold text-[11px]">
                          ✓ Interesse von 3+ Kollegen in Kanzlei/Firma
                        </div>
                      )}
                  </div>
                </div>

                {/* Internal Operator Notes */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] block mb-1">
                    Interne Notizen zum Kunden
                  </span>
                  <textarea
                    rows={3}
                    placeholder="z. B. Bevorzugt telefonischen Kontakt vor 10 Uhr..."
                    value={
                      editingNotes[selectedLead.id] !== undefined
                        ? editingNotes[selectedLead.id]
                        : selectedLead.notes || ''
                    }
                    onChange={(e) =>
                      setEditingNotes({
                        ...editingNotes,
                        [selectedLead.id]: e.target.value,
                      })
                    }
                    onBlur={() => {
                      if (editingNotes[selectedLead.id] !== undefined) {
                        updateLeadNote(selectedLead.id, editingNotes[selectedLead.id]);
                      }
                    }}
                    className="w-full p-2.5 bg-[#FFFFFF] border border-[#E5E0D8] text-xs outline-none focus:border-[#9A7B4F]"
                  />
                  <span className="text-[10px] text-[#A8A29E]">
                    Notiz wird automatisch beim Verlassen des Feldes gespeichert.
                  </span>
                </div>
              </div>

              {/* Bottom Quick Contact Action */}
              <div className="pt-4 border-t border-[#E5E0D8] flex flex-col gap-2">
                <a
                  href={`mailto:${selectedLead.contact?.email}?subject=Ihr%20Hemdenpilot-Start%20in%20Stuttgart%20(${selectedLead.id})`}
                  className="w-full py-2.5 bg-[#9A7B4F] text-[#0B111E] text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#866941] transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kunde per E-Mail kontaktieren</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Integration / Settings Bar */}
        <div className="bg-[#F2EFE9] border-t border-[#E5E0D8] px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Webhook Configuration */}
          <form
            onSubmit={handleSaveWebhook}
            className="flex items-center gap-2 flex-1 max-w-[560px]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] shrink-0">
              Webhook URL (Zapier / Sheets):
            </span>
            <input
              type="url"
              placeholder="https://hook.eu1.make.com/... oder Zapier Webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="py-1 px-2.5 text-xs bg-[#FFFFFF] border border-[#E5E0D8] flex-1 outline-none focus:border-[#9A7B4F]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#0B111E] text-[#F9F8F6] text-[10px] font-semibold uppercase tracking-wider hover:bg-[#18181B]"
            >
              {webhookSaved ? 'Gespeichert!' : 'Speichern'}
            </button>
            {webhookUrl && (
              <button
                type="button"
                onClick={handleTestWebhook}
                className="px-2.5 py-1 bg-[#FFFFFF] border border-[#E5E0D8] text-[10px] font-semibold uppercase tracking-wider text-[#57534E] hover:text-[#18181B]"
                title="Sendet Test-Payload an Webhook"
              >
                Test
              </button>
            )}
          </form>

          {/* Reset / Dangerous Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              disabled={leads.length === 0}
              className="text-[#9A3412] hover:underline text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
              <span>Alle Leads löschen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
