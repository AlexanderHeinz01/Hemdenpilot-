import { PlzRouteInfo } from '../types';

// Geplante Pilotgebiete. Noch keine Route ist in Betrieb – die Texte im PLZ-Check müssen das widerspiegeln.

export const ROUTES: Record<string, [string, 'active' | 'prep']> = {
  '70173': ['Stuttgart-Mitte / Schloßplatz & Kanzleiviertel', 'active'],
  '70174': ['Stuttgart-Mitte / Friedrichstraße & Bankenviertel', 'active'],
  '70176': ['Stuttgart-West / Feuersee & Rosenberg', 'active'],
  '70178': ['Stuttgart-Süd / Marienplatz & Karlshöhe', 'active'],
  '70182': ['Stuttgart-Mitte / Bohnenviertel & Rathaus', 'active'],
  '70184': ['Stuttgart-Ost / Gänsheide & Bopser', 'active'],
  '70191': ['Stuttgart-Nord / Europaviertel & Pragfriedhof', 'active'],
  '70192': ['Stuttgart-Nord / Killesberg & Höhenpark', 'active'],
  '70197': ['Stuttgart-West / Schwabstraße', 'active'],
  '70597': ['Degerloch / Sonnenberg & Hoffeld', 'active'],
  '70190': ['Stuttgart-Ost / Stöckach & Berg', 'prep'],
  '70567': ['Möhringen / Sternhäule', 'prep'],
  '70569': ['Vaihingen / SynergiePark', 'prep'],
  '70372': ['Bad Cannstatt / Kurpark', 'prep'],
  '70469': ['Feuerbach', 'prep'],
};

export function lookupPlz(p: string): PlzRouteInfo {
  const clean = p.trim();
  const r = ROUTES[clean];
  if (r) {
    return { plz: clean, district: r[0], status: r[1] };
  }
  if (clean.startsWith('70')) {
    return { plz: clean, district: 'Großraum Stuttgart', status: 'prep' };
  }
  return { plz: clean, district: 'Außerhalb Stuttgart', status: 'planned' };
}

export function isInPilotArea(p: string): boolean {
  return lookupPlz(p).status !== 'planned';
}

// Anzeige-Text für eine PLZ in Bestätigung, Mail und Admin, z. B. "70173 · Stuttgart-Mitte"
export function describePlz(p: string): string {
  const r = lookupPlz(p);
  if (r.status === 'planned') return `${r.plz} · außerhalb des Pilotgebiets – Vormerkung`;
  return `${r.plz} · ${r.district.split('/')[0].trim()}`;
}
