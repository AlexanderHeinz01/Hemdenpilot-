import { PlzRouteInfo } from '../types';

export const KNOWN_ROUTES: Record<string, PlzRouteInfo> = {
  // Stuttgart - Aktive Pilot-Touren
  '70173': { plz: '70173', city: 'Stuttgart', district: 'Stuttgart-Mitte / Schloßplatz & Kanzleiviertel', status: 'active', spotsRemaining: 8 },
  '70174': { plz: '70174', city: 'Stuttgart', district: 'Stuttgart-Mitte / Friedrichstraße & Bankenviertel', status: 'active', spotsRemaining: 6 },
  '70176': { plz: '70176', city: 'Stuttgart', district: 'Stuttgart-West / Feuersee & Rosenberg', status: 'active', spotsRemaining: 5 },
  '70178': { plz: '70178', city: 'Stuttgart', district: 'Stuttgart-Süd / Marienplatz & Karlshöhe', status: 'active', spotsRemaining: 9 },
  '70182': { plz: '70182', city: 'Stuttgart', district: 'Stuttgart-Mitte / Bohnenviertel & Rathaus', status: 'active', spotsRemaining: 7 },
  '70184': { plz: '70184', city: 'Stuttgart', district: 'Stuttgart-Ost / Gänsheide & Bopser', status: 'active', spotsRemaining: 4 },
  '70191': { plz: '70191', city: 'Stuttgart', district: 'Stuttgart-Nord / Europaviertel & Pragfriedhof', status: 'active', spotsRemaining: 6 },
  '70192': { plz: '70192', city: 'Stuttgart', district: 'Stuttgart-Nord / Killesberg & Höhenpark', status: 'active', spotsRemaining: 4 },
  '70197': { plz: '70197', city: 'Stuttgart', district: 'Stuttgart-West / Schwabstraße', status: 'active', spotsRemaining: 7 },
  '70597': { plz: '70597', city: 'Stuttgart', district: 'Degerloch / Sonnenberg & Hoffeld', status: 'active', spotsRemaining: 5 },

  // Stuttgart - Touren in Vorbereitung (kurz vor Freischaltung)
  '70190': { plz: '70190', city: 'Stuttgart', district: 'Stuttgart-Ost / Stöckach & Berg', status: 'in_preparation', reservationsNeeded: 3 },
  '70567': { plz: '70567', city: 'Stuttgart', district: 'Möhringen / Sternhäule', status: 'in_preparation', reservationsNeeded: 4 },
  '70569': { plz: '70569', city: 'Stuttgart', district: 'Vaihingen / SynergiePark', status: 'in_preparation', reservationsNeeded: 5 },
  '70372': { plz: '70372', city: 'Stuttgart', district: 'Bad Cannstatt / Kurpark', status: 'in_preparation', reservationsNeeded: 6 },
  '70469': { plz: '70469', city: 'Stuttgart', district: 'Feuerbach', status: 'in_preparation', reservationsNeeded: 5 },
};

export function lookupPlz(plz: string): PlzRouteInfo {
  const clean = plz.trim();
  if (KNOWN_ROUTES[clean]) {
    return KNOWN_ROUTES[clean];
  }
  
  if (clean.startsWith('70')) {
    return {
      plz: clean,
      city: 'Stuttgart',
      district: 'Großraum Stuttgart',
      status: 'in_preparation',
      reservationsNeeded: 5
    };
  }

  return {
    plz: clean,
    city: 'Außerhalb Stuttgart',
    district: 'Aktuell nur in Stuttgart aktiv (Vormerkung für spätere Städte)',
    status: 'planned',
    reservationsNeeded: 15
  };
}
