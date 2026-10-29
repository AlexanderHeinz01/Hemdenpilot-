import type { PriceVariant } from './config/pricing';
import type {
  HandoverOption,
  ShirtCount,
  CurrentSolution,
  MonthlySpend,
  EmployerSubsidy,
} from './config/options';

export type PackageType = 'A' | 'B';
export type LeadStatus = 'neu' | 'kontaktiert' | 'in_route' | 'abgeschlossen';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
}

export interface LeadPreferences {
  collarSize: string;
  fit: string;
  colorMix: string | null;
  brand: string;
}

export interface LeadHandover {
  option: HandoverOption;
  type: 'B2C' | 'B2B';
  location: string;
  slot: string;
  company: string | null;
  colleaguesCount: number | null;
}

export interface LeadSurvey {
  shirtCount: ShirtCount | null;
  currentSolution: CurrentSolution | null;
  monthlySpend: MonthlySpend | null;
  wantsSuits: boolean;
}

// Reservierung über den Konfigurator (vom Server gebaut und gespeichert)
export interface LeadData {
  kind: 'private';
  id: string; // `HP-${plz}-${8 Hex-Zeichen}`
  event: 'lead_reserved';
  package: PackageType;
  packageName: string;
  priceVariant: PriceVariant;
  pricePerMonth: number;
  firstMonthPrice: number;
  setupFee: number;
  preferences: LeadPreferences;
  handover: LeadHandover;
  survey: LeadSurvey;
  contact: {
    plz: string;
    name: string;
    email: string;
    phone: string | null;
  };
  city: 'Stuttgart';
  createdAt: string; // ISO
  status: LeadStatus;
  notes: string;
  attribution: Attribution;
}

// Firmenanfrage über die B2B-Sektion
export interface CompanyLead {
  kind: 'company';
  id: string; // `HPB-${plz}-${8 Hex-Zeichen}`
  event: 'company_inquiry';
  company: string;
  contactName: string;
  role: string | null;
  email: string;
  phone: string | null;
  plz: string;
  employeesInterested: number;
  employerSubsidy: EmployerSubsidy;
  message: string | null;
  city: 'Stuttgart';
  createdAt: string;
  status: LeadStatus;
  notes: string;
  attribution: Attribution;
}

export type StoredLead = LeadData | CompanyLead;

// Payloads vom Browser an den Server
export interface PrivateLeadSubmission {
  package: PackageType;
  priceVariant: PriceVariant;
  preferences: LeadPreferences;
  handover: {
    option: HandoverOption;
    company: string | null;
    colleaguesCount: number | null;
  };
  survey: LeadSurvey;
  contact: {
    plz: string;
    name: string;
    email: string;
    phone: string | null;
  };
  attribution: Attribution;
  website?: string; // Honeypot
}

export interface CompanyLeadSubmission {
  company: string;
  contactName: string;
  role: string | null;
  email: string;
  phone: string | null;
  plz: string;
  employeesInterested: number;
  employerSubsidy: EmployerSubsidy;
  message: string | null;
  attribution: Attribution;
  website?: string; // Honeypot
}

export interface PlzRouteInfo {
  plz: string;
  district: string;
  status: 'active' | 'prep' | 'planned';
}
