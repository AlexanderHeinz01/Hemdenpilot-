export type PackageType = 'paket-b' | 'paket-a';

export interface ShirtPreferences {
  size: string; // Kragenweite 38–44
  fit: string; // Slim / Modern / Regular
  brand?: string; // Olymp, Eton, Eterna, Seidensticker, etc.
  dropoffLocation: string; // Privatadresse (Sonntagabend, 18–21 Uhr) / Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)
}

export interface LeadData {
  id: string;
  packageType: PackageType;
  packageName: string;
  pricePerMonth: number;
  preferences: ShirtPreferences;
  plz: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface PlzRouteInfo {
  plz: string;
  city: string;
  district: string;
  status: 'active' | 'in_preparation' | 'planned';
  spotsRemaining?: number;
  reservationsNeeded?: number;
}
