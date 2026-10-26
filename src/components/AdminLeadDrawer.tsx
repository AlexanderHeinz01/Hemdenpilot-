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
    const headers = ['ID', 'Paket', 'Preis', 'PLZ', 'Email', 'Telefon', 'Groesse', 'Schnitt', 'Marke', 'Uebergabeort', 'Datum'];
    const rows = leads.map(l => [
      l.id,
      `"${l.packageName}"`,
      l.pricePerMonth,
      l.plz,
      l.email,
      l.phone || '',
      `"${l.preferences.size}"`,
      `"${l.preferences.fit}"`,
      `"${l.preferences.brand}"`,
      `"${l.preferences.dropoffLocation}"`,
      l.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hemdenpilot_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (confirm('Möchtest du die gespeicherten Test-Leads zurücksetzen?')) {
      localStorage.removeItem('hemdenpilot_leads');
      setLeads([]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0F172A] text-[#F9F8F6] text-xs uppercase tracking-[0.15em] border border-[#9A7B4F]/40 hover:border-[#9A7B4F] transition-colors cursor-pointer rounded-none"
        >
          <Database className="w-3.5 h-3.5 text-[#9A7B4F]" />
          <span>Pilot-Leads ({leads.length})</span>
        </button>
      ) : (
        <div className="bg-[#F9F8F6] border border-[#E5E0D8] p-5 w-80 sm:w-96 text-xs text-[#1C1917] rounded-none shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2 font-medium text-[#1C1917] uppercase tracking-[0.15em] text-[11px]">
              <Database className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>Pilot-Reservierungen ({leads.length})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#57534E] hover:text-[#1C1917] p-1 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto py-2 space-y-2">
            {leads.length === 0 ? (
              <p className="text-[#57534E] text-center py-4 text-xs">
                Noch keine Test-Reservierungen eingegangen. Klicke auf ein Paket, um den 3-Schritte-Funnel zu testen.
              </p>
            ) : (
              leads.map((l) => (
                <div key={l.id} className="p-3 bg-white border border-[#E5E0D8] text-[11px]">
                  <div className="flex justify-between font-medium text-[#1C1917]">
                    <span className="font-mono">{l.id}</span>
                    <span className="text-[#9A7B4F] font-semibold">PLZ {l.plz}</span>
                  </div>
                  <div className="text-[#57534E] mt-1">{l.email} · {l.packageName.split(':')[0]} ({l.pricePerMonth} €)</div>
                  <div className="text-[#57534E]/80 mt-1 flex justify-between">
                    <span>{l.preferences.size} · {l.preferences.fit} · {l.preferences.brand}</span>
                    <span>{l.preferences.dropoffLocation.startsWith('Privat') ? 'Wohnungstür' : 'Empfang'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between gap-2">
            <button
              onClick={handleExportCsv}
              disabled={leads.length === 0}
              className="px-3 py-1.5 bg-[#F2EFE9] border border-[#E5E0D8] text-[#1C1917] text-xs font-medium hover:bg-white disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer rounded-none"
            >
              <Download className="w-3 h-3 text-[#9A7B4F]" />
              <span>CSV Export</span>
            </button>
            <button
              onClick={handleClear}
              disabled={leads.length === 0}
              className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 border border-transparent disabled:opacity-40 transition flex items-center gap-1 cursor-pointer rounded-none"
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
