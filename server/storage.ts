import fs from 'fs';
import path from 'path';
import type { LeadData, LeadStatus, StoredLead } from '../src/types';

// DATA_DIR sollte im Produktivbetrieb auf ein persistentes Volume zeigen
// (Cloud Run: GCS-Volume-Mount). Ohne Volume gehen Dateien bei jedem Neustart verloren –
// Leads sind dann nur über Webhook (Google Sheet) und E-Mail gesichert.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

export type EventCounts = Record<string, Record<string, number>>; // Tag (YYYY-MM-DD) → Event → Anzahl

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf-8') || 'null') ?? fallback) : fallback;
  } catch (err) {
    console.error(`[Storage] ${path.basename(file)} nicht lesbar:`, err);
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  ensureDir();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, file);
}

// Ältere Einträge (vor dem Umbau) haben kein `kind`, keine Umfrage und keine Übergabe-Option.
function normalize(raw: any): StoredLead {
  if (raw?.kind === 'company') return raw;
  const legacy = raw as Partial<LeadData> & { handover?: any };
  const isB2B = legacy.handover?.type === 'B2B';
  return {
    ...legacy,
    kind: 'private',
    priceVariant: legacy.priceVariant ?? 'standard',
    setupFee: legacy.setupFee ?? 0,
    handover: {
      option: legacy.handover?.option ?? (isB2B ? 'office_monday' : 'home_sunday'),
      type: isB2B ? 'B2B' : 'B2C',
      location: legacy.handover?.location ?? '',
      slot: legacy.handover?.slot ?? '',
      company: legacy.handover?.company ?? null,
      colleaguesCount:
        legacy.handover?.colleaguesCount ?? (legacy.handover?.colleaguesInterested ? 3 : null),
    },
    survey: legacy.survey ?? { shirtCount: null, currentSolution: null, monthlySpend: null, wantsSuits: false },
    status: legacy.status ?? 'neu',
    notes: legacy.notes ?? '',
    attribution: legacy.attribution ?? {},
  } as LeadData;
}

export function readLeads(): StoredLead[] {
  const raw = readJson<unknown[]>(LEADS_FILE, []);
  return Array.isArray(raw) ? raw.map(normalize) : [];
}

export function saveLead(lead: StoredLead) {
  writeJson(LEADS_FILE, [lead, ...readLeads().filter((l) => l.id !== lead.id)]);
}

export function updateLead(id: string, patch: { status?: LeadStatus; notes?: string }): StoredLead | null {
  const leads = readLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leads[index] = { ...leads[index], ...patch };
  writeJson(LEADS_FILE, leads);
  return leads[index];
}

export function clearLeads() {
  writeJson(LEADS_FILE, []);
}

export function readEvents(): EventCounts {
  return readJson<EventCounts>(EVENTS_FILE, {});
}

export function recordEvent(key: string) {
  const day = new Date().toISOString().slice(0, 10);
  const counts = readEvents();
  counts[day] = counts[day] || {};
  counts[day][key] = (counts[day][key] || 0) + 1;
  writeJson(EVENTS_FILE, counts);
}
