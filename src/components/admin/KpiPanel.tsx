import React, { useMemo, useState } from 'react';
import type { CompanyLead, LeadData } from '../../types';
import {
  CURRENT_SOLUTION_OPTIONS,
  HANDOVER_OPTIONS,
  MONTHLY_SPEND_OPTIONS,
  SHIRT_COUNT_OPTIONS,
} from '../../config/options';
import {
  DECISION_BUDGET,
  GO_CLUSTER_SIZE,
  GO_DEPOSITS,
  buildClusters,
  countBy,
  percent,
  sumEvents,
  type EventCounts,
} from '../../services/kpis';

interface KpiPanelProps {
  leads: LeadData[];
  companies: CompanyLead[];
  events: EventCounts;
}

const BUDGET_KEY = 'hp_admin_ad_budget';

function readBudget(): string {
  try {
    return localStorage.getItem(BUDGET_KEY) || '';
  } catch {
    return '';
  }
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-4 sm:p-5">
    <h4 className="m-0 mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">{title}</h4>
    {children}
  </div>
);

const Row: React.FC<{ label: string; value: React.ReactNode; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="flex justify-between gap-3 py-1.5 border-b border-[#F2EFE9] last:border-b-0 text-xs">
    <span className="text-[#57534E]">{label}</span>
    <span className={strong ? 'font-semibold text-[#18181B]' : 'text-[#18181B]'}>{value}</span>
  </div>
);

const Distribution: React.FC<{ rows: [string, number][]; total: number }> = ({ rows, total }) => (
  <>
    {rows.length === 0 && <p className="m-0 text-xs text-[#A8A29E]">Noch keine Daten.</p>}
    {rows.map(([label, count]) => (
      <Row key={label} label={label} value={`${count} (${percent(count, total)})`} />
    ))}
  </>
);

export const KpiPanel: React.FC<KpiPanelProps> = ({ leads, companies, events }) => {
  const [budget, setBudget] = useState<string>(readBudget);

  const handleBudget = (value: string) => {
    setBudget(value);
    try {
      localStorage.setItem(BUDGET_KEY, value);
    } catch {
      // nur Komfortfunktion
    }
  };

  const totals = useMemo(() => sumEvents(events), [events]);
  const clusters = useMemo(() => buildClusters(leads, companies), [leads, companies]);

  const spend = Number(budget.replace(',', '.')) || 0;
  const pageViews = totals.page_view || 0;
  const packageClicks = (totals.select_package_A || 0) + (totals.select_package_B || 0);
  const deposits = totals.deposit_clicked || 0;
  const allLeads = leads.length + companies.length;
  const pkgB = leads.filter((l) => l.package === 'B').length;
  const b2bOrB = leads.filter((l) => l.package === 'B' || l.handover.type === 'B2B').length;
  const bestCluster = clusters[0]?.potential ?? 0;

  const depositsMet = deposits >= GO_DEPOSITS;
  const clusterMet = bestCluster >= GO_CLUSTER_SIZE;
  const decisionDue = spend >= DECISION_BUDGET;
  const verdict = depositsMet && clusterMet
    ? { label: 'GO – beide messbaren Kriterien erfüllt (Reinigungsangebote ≤ 2 €/Hemd separat prüfen)', cls: 'bg-emerald-50 border-emerald-500 text-emerald-800' }
    : decisionDue
    ? { label: `STOP / PIVOT – Budget von ${DECISION_BUDGET} € erreicht, Kriterien verfehlt`, cls: 'bg-red-50 border-red-400 text-red-800' }
    : { label: 'Test läuft – noch keine Entscheidung', cls: 'bg-amber-50 border-amber-400 text-amber-800' };

  const funnel: [string, number][] = [
    ['Seitenaufrufe (Sitzungen)', pageViews],
    ['Besuche mit Paket-Klick', packageClicks],
    ['Konfigurator Schritt 1', totals.funnel_step_1 || 0],
    ['Konfigurator Schritt 2', totals.funnel_step_2 || 0],
    ['Konfigurator Schritt 3', totals.funnel_step_3 || 0],
    ['Reservierung abgeschickt', totals.lead_reserved || 0],
    ['Klick auf Anzahlung', deposits],
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Entscheidung */}
      <div className={`border px-4 py-3 text-xs font-semibold ${verdict.cls}`}>{verdict.label}</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Go/Stop-Kriterien">
          <label className="flex items-center justify-between gap-3 py-1.5 border-b border-[#F2EFE9] text-xs">
            <span className="text-[#57534E]">Ausgegebenes Werbebudget (€)</span>
            <input
              type="text"
              inputMode="decimal"
              value={budget}
              onChange={(e) => handleBudget(e.target.value)}
              placeholder="0"
              className="w-24 py-1 px-2 text-right bg-[#F9F8F6] border border-[#E5E0D8] outline-none focus:border-[#9A7B4F]"
            />
          </label>
          <Row label={`Anzahlungs-Klicks (Ziel ≥ ${GO_DEPOSITS})`} value={`${deposits} ${depositsMet ? '✓' : '✗'}`} strong />
          <Row label={`Größter Firmen-Cluster (Ziel ≥ ${GO_CLUSTER_SIZE})`} value={`${bestCluster} ${clusterMet ? '✓' : '✗'}`} strong />
          <Row label="Reinigungskosten ≤ 2 €/Hemd" value="offline prüfen" />
          <p className="m-0 mt-2 text-[10px] leading-[1.5] text-[#A8A29E]">
            Klicks auf den Anzahlungs-Link sind keine Zahlungen – bitte im Stripe-Dashboard (client_reference_id = Reservierungs-ID) abgleichen.
          </p>
        </Card>

        <Card title="Effizienz">
          <Row label="Leads gesamt (privat + Firma)" value={`${leads.length} + ${companies.length}`} strong />
          <Row label="Cost per Lead" value={spend && allLeads ? `${(spend / allLeads).toFixed(2).replace('.', ',')} €` : '–'} />
          <Row label="Klickrate auf Pakete (je Besuch)" value={percent(packageClicks, pageViews)} />
          <Row label="Erste Wahl Paket B" value={percent(totals.select_package_B || 0, packageClicks)} />
          <Row label="Conversion Besuch → Lead" value={percent(totals.lead_reserved || 0, pageViews)} />
          <Row label="Anteil Paket B" value={percent(pkgB, leads.length)} />
          <Row label="Anteil Paket B oder Büro-Übergabe" value={percent(b2bOrB, leads.length)} />
        </Card>

        <Card title="Funnel (Events)">
          {funnel.map(([label, count], i) => (
            <Row
              key={label}
              label={label}
              value={i === 0 ? count : `${count} (${percent(count, funnel[i - 1][1])})`}
            />
          ))}
        </Card>
      </div>

      <Card title={`Firmen-Cluster (hervorgehoben ab ${GO_CLUSTER_SIZE} Interessenten)`}>
        {clusters.length === 0 ? (
          <p className="m-0 text-xs text-[#A8A29E]">
            Noch keine Büro-Leads mit Firmenname oder geschäftlicher E-Mail-Domain und keine Firmenanfragen.
          </p>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#57534E] border-b border-[#E5E0D8]">
                <th className="py-2 pr-2 font-semibold">Firma / Domain</th>
                <th className="py-2 pr-2 font-semibold">Reservierungen</th>
                <th className="py-2 pr-2 font-semibold">Genannte Kollegen</th>
                <th className="py-2 pr-2 font-semibold">Laut Firmenanfrage</th>
                <th className="py-2 font-semibold">Potenzial</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((c) => (
                <tr key={c.key} className={`border-b border-[#F2EFE9] ${c.potential >= GO_CLUSTER_SIZE ? 'bg-[#9A7B4F]/10 font-semibold' : ''}`}>
                  <td className="py-2 pr-2">{c.label}</td>
                  <td className="py-2 pr-2">{c.leads}</td>
                  <td className="py-2 pr-2">{c.colleaguesClaimed ? `${c.colleaguesClaimed}+` : '–'}</td>
                  <td className="py-2 pr-2">{c.employeesFromInquiry || '–'}</td>
                  <td className="py-2">{c.potential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Übergabe-Wunsch">
          <Distribution rows={countBy(leads, (l) => HANDOVER_OPTIONS[l.handover.option]?.label)} total={leads.length} />
        </Card>
        <Card title="Hemdenbestand (Paket B)">
          <Distribution
            rows={countBy(leads.filter((l) => l.package === 'B'), (l) => (l.survey.shirtCount ? SHIRT_COUNT_OPTIONS[l.survey.shirtCount] : null))}
            total={pkgB}
          />
        </Card>
        <Card title="Heutige Lösung">
          <Distribution rows={countBy(leads, (l) => (l.survey.currentSolution ? CURRENT_SOLUTION_OPTIONS[l.survey.currentSolution] : null))} total={leads.length} />
        </Card>
        <Card title="Heutige Ausgaben / Monat">
          <Distribution rows={countBy(leads, (l) => (l.survey.monthlySpend ? MONTHLY_SPEND_OPTIONS[l.survey.monthlySpend] : null))} total={leads.length} />
        </Card>
        <Card title="Weitere Signale">
          <Row label="Interesse an Sakkos/Anzügen" value={percent(leads.filter((l) => l.survey.wantsSuits).length, leads.length)} />
          <Row label="PLZ-Checks Pilotgebiet" value={totals['plz_check:active'] || 0} />
          <Row label="PLZ-Checks weitere Stadtteile" value={totals['plz_check:prep'] || 0} />
          <Row label="PLZ-Checks außerhalb Stuttgart" value={totals['plz_check:outside'] || 0} />
          <Row label="Firmenanfragen (Formular)" value={totals.b2b_form_submitted || 0} />
        </Card>
        <Card title="Quellen & Preistest">
          <Distribution rows={countBy([...leads, ...companies], (l) => l.attribution?.utm_source || 'direkt')} total={allLeads} />
          <div className="mt-3 pt-2 border-t border-[#E5E0D8]">
            <Distribution rows={countBy(leads, (l) => `Variante ${l.priceVariant} · Paket ${l.package}`)} total={leads.length} />
          </div>
        </Card>
      </div>
    </div>
  );
};
