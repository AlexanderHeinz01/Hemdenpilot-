import { PlzRouteInfo } from '../types';

export const ROUTES: Record<string, [string, 'active' | 'prep', number]> = {
  '70173': ['Stuttgart-Mitte / Schloßplatz & Kanzleiviertel', 'active', 8],
  '70174': ['Stuttgart-Mitte / Friedrichstraße & Bankenviertel', 'active', 6],
  '70176': ['Stuttgart-West / Feuersee & Rosenberg', 'active', 5],
  '70178': ['Stuttgart-Süd / Marienplatz & Karlshöhe', 'active', 9],
  '70182': ['Stuttgart-Mitte / Bohnenviertel & Rathaus', 'active', 7],
  '70184': ['Stuttgart-Ost / Gänsheide & Bopser', 'active', 4],
  '70191': ['Stuttgart-Nord / Europaviertel & Pragfriedhof', 'active', 6],
  '70192': ['Stuttgart-Nord / Killesberg & Höhenpark', 'active', 4],
  '70197': ['Stuttgart-West / Schwabstraße', 'active', 7],
  '70597': ['Degerloch / Sonnenberg & Hoffeld', 'active', 5],
  '70190': ['Stuttgart-Ost / Stöckach & Berg', 'prep', 3],
  '70567': ['Möhringen / Sternhäule', 'prep', 4],
  '70569': ['Vaihingen / SynergiePark', 'prep', 5],
  '70372': ['Bad Cannstatt / Kurpark', 'prep', 6],
  '70469': ['Feuerbach', 'prep', 5],
};

export function lookupPlz(p: string): PlzRouteInfo {
  const clean = p.trim();
  const r = ROUTES[clean];
  if (r) {
    return { plz: clean, district: r[0], status: r[1], n: r[2] };
  }
  if (clean.startsWith('70')) {
    return { plz: clean, district: 'Großraum Stuttgart', status: 'prep', n: 5 };
  }
  return { plz: clean, district: 'Außerhalb Stuttgart', status: 'planned', n: 15 };
}
