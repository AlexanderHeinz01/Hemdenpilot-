import type { CompanyLead, LeadData } from '../types';

// Kennzahlen für den Smoke-Test, berechnet aus gespeicherten Leads und Event-Zählern.

export type EventCounts = Record<string, Record<string, number>>;

const FREEMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de', 'yahoo.com', 'yahoo.de',
  'outlook.com', 'outlook.de', 'hotmail.com', 'hotmail.de', 'live.de', 'icloud.com', 'me.com', 'posteo.de',
  'mail.de', 'freenet.de', 'aol.com', 'proton.me', 'protonmail.com',
]);

// Go/Stop-Kriterien aus dem Implementierungsplan (Phase 3.5)
export const GO_DEPOSITS = 5;
export const GO_CLUSTER_SIZE = 4;
export const DECISION_BUDGET = 250;

export function sumEvents(events: EventCounts): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const day of Object.values(events)) {
    for (const [key, count] of Object.entries(day)) totals[key] = (totals[key] || 0) + count;
  }
  return totals;
}

function companyKey(name: string | null | undefined, email: string): string | null {
  const normalized = (name || '').toLowerCase().replace(/[^a-z0-9äöüß]+/g, ' ').trim();
  if (normalized.length >= 2) return normalized;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !FREEMAIL_DOMAINS.has(domain) ? domain : null;
}

export interface Cluster {
  key: string;
  label: string;
  leads: number;
  colleaguesClaimed: number;
  employeesFromInquiry: number;
  potential: number;
}

// Gruppiert Büro-Leads und Firmenanfragen nach Firmenname bzw. geschäftlicher E-Mail-Domain.
export function buildClusters(leads: LeadData[], companies: CompanyLead[]): Cluster[] {
  const clusters = new Map<string, Cluster>();
  const get = (key: string, label: string) => {
    if (!clusters.has(key)) {
      clusters.set(key, { key, label, leads: 0, colleaguesClaimed: 0, employeesFromInquiry: 0, potential: 0 });
    }
    return clusters.get(key)!;
  };

  for (const lead of leads) {
    if (lead.handover.type !== 'B2B') continue;
    const key = companyKey(lead.handover.company, lead.contact.email);
    if (!key) continue;
    const cluster = get(key, lead.handover.company || key);
    cluster.leads += 1;
    cluster.colleaguesClaimed = Math.max(cluster.colleaguesClaimed, lead.handover.colleaguesCount ?? 0);
  }

  for (const inquiry of companies) {
    const key = companyKey(inquiry.company, inquiry.email);
    if (!key) continue;
    const cluster = get(key, inquiry.company);
    cluster.employeesFromInquiry = Math.max(cluster.employeesFromInquiry, inquiry.employeesInterested);
  }

  for (const c of clusters.values()) {
    c.potential = Math.max(c.leads, c.colleaguesClaimed + 1, c.employeesFromInquiry);
  }
  return [...clusters.values()].sort((a, b) => b.potential - a.potential);
}

export function countBy<T>(items: T[], pick: (item: T) => string | null | undefined): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = pick(item) ?? 'Keine Angabe';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function percent(part: number, whole: number): string {
  if (!whole) return '–';
  return `${((part / whole) * 100).toFixed(1).replace('.', ',')} %`;
}
