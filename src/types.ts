export type PackageType = 'A' | 'B';

export interface LeadData {
  id: string; // `HP-${plz}-${4 Ziffern}`
  event: 'lead_reserved';
  package: PackageType;
  packageName: string; // 'Paket A – Die Executive-Rotation' | 'Paket B – Der Logistik-Autopilot'
  pricePerMonth: 119 | 79;
  firstMonthPrice: 59.5 | 39.5;
  preferences: {
    collarSize: string;
    fit: string;
    colorMix: string | null;
    brand: string;
  };
  handover:
    | { type: 'B2C'; location: string; slot: 'Sonntag 18:00–21:00' }
    | { type: 'B2B'; location: string; slot: 'Montag bis 09:00'; colleaguesInterested: boolean };
  contact: {
    plz: string;
    name: string;
    email: string;
    phone: string | null;
  };
  city: 'Stuttgart';
  createdAt: string; // ISO
  status?: 'neu' | 'kontaktiert' | 'in_route' | 'abgeschlossen';
  notes?: string;
}

export interface PlzRouteInfo {
  plz: string;
  district: string;
  status: 'active' | 'prep' | 'planned';
  n: number;
}
