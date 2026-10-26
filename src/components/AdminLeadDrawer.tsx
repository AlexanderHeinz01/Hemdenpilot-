import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, X } from 'lucide-react';
import { LeadData } from '../types';

interface AdminLeadDrawerProps {
  lastUpdated: number;
}

export const AdminLeadDrawer: React.FC<AdminLeadDrawerProps> = ({ lastUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState<LeadData[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hemdenpilot_leads') || '[]');
      setLeads(stored);
    } catch {
      setLeads([]);
    }
  }, [lastUpdated, isOpen]);

  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Paket', 'Preis Monat', 'Preis Start', 'PLZ', 'Name', 'Email', 'Telefon', 'Kragenweite', 'Schnitt', 'FarbMix', 'Marke', 'Uebergabe', 'Ort', 'B2B_Kollegen', 'Datum'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.packageName}"`,
      l.pricePerMonth,
      l.firstMonthPrice,
      l.contact?.plz || '',
      `"${l.contact?.name || ''}"`,
      l.contact?.email || '',
      l.contact?.phone || '',
      `"${l.preferences?.collarSize || ''}"`,
      `"${l.preferences?.fit || ''}"`,
      `"${l.preferences?.colorMix || '-'}"`,
      `"${l.preferences?.brand || ''}"`,
      l.handover?.type || '',
      `"${l.handover?.location || ''}"`,
      l.handover?.type === 'B2B' ? (l.handover.colleaguesInterested ? 'Ja' : 'Nein') : 'Nein',
      l.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `hemdenpilot_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (confirm('Möchtest du die gespeicherten Test-Reservierungen zurücksetzen?')) {
      localStorage.removeItem('hemdenpilot_leads');
      setLeads([]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-jakarta">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0B111E] text-[#F9F8F6] text-[11px] uppercase tracking-[0.15em] border border-[#9A7B4F]/50 hover:border-[#9A7B4F] transition-colors cursor-pointer rounded-none"
        >
          <Database className="w-3.5 h-3.5 text-[#9A7B4F]" />
          <span>Pilot-Leads ({leads.length})</span>
        </button>
      ) : (
        <div className="bg-[#F9F8F6] border border-[#E5E0D8] p-5 w-80 sm:w-96 text-xs text-[#18181B] rounded-none shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2 font-semibold text-[#18181B] uppercase tracking-[0.15em] text-[11px]">
              <Database className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>Pilot-Reservierungen ({leads.length})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#57534E] hover:text-[#18181B] p-1 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto py-2 space-y-2">
            {leads.length === 0 ? (
              <p className="text-[#57534E] text-center py-4 text-xs font-jakarta">
                Noch keine Test-Reservierungen eingegangen. Wählen Sie ein Paket, um den Konfigurator zu testen.
              </p>
            ) : (
              leads.map((l) => (
                <div key={l.id} className="p-3 bg-white border border-[#E5E0D8] text-[11px] font-jakarta">
                  <div className="flex justify-between font-semibold text-[#18181B]">
                    <span className="font-mono">{l.id}</span>
                    <span className="text-[#9A7B4F]">PLZ {l.contact?.plz}</span>
                  </div>
                  <div className="text-[#57534E] mt-1">
                    {l.contact?.name} ({l.contact?.email}) · Paket {l.package} ({l.pricePerMonth} €)
                  </div>
                  <div className="text-[#57534E]/80 mt-1 flex justify-between">
                    <span>
                      Gr. {l.preferences?.collarSize} · {l.preferences?.fit} · {l.preferences?.brand}
                    </span>
                    <span>{l.handover?.type === 'B2C' ? 'Wohnungstür' : 'Büro-Empfang'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between gap-2">
            <button
              onClick={handleExportCsv}
              disabled={leads.length === 0}
              className="px-3 py-1.5 bg-[#F2EFE9] border border-[#E5E0D8] text-[#18181B] text-xs font-semibold tracking-[0.1em] uppercase hover:bg-white disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer rounded-none"
            >
              <Download className="w-3 h-3 text-[#9A7B4F]" />
              <span>CSV Export</span>
            </button>
            <button
              onClick={handleClear}
              disabled={leads.length === 0}
              className="px-3 py-1.5 text-[#9A3412] hover:bg-rose-50 border border-transparent disabled:opacity-40 transition flex items-center gap-1 cursor-pointer rounded-none text-xs font-semibold tracking-[0.1em] uppercase"
            >
              <Trash2 className="w-3 h-3" />
              <span>Löschen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
