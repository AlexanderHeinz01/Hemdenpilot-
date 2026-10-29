import type { PackageType } from '../types';

// Zentrale Preis-Konfiguration – wird von Landingpage, Konfigurator und Server gemeinsam genutzt.
// Der Server setzt die Preise im Lead immer selbst aus dieser Datei (Client-Werte werden ignoriert).

export const PILOT_SPOTS = 50;
export const FIRST_MONTH_DISCOUNT = 0.5;
export const SETUP_FEE_A = 149;
export const DEPOSIT_AMOUNT = 19;

// Preistest: ?p=b89 bzw. ?p=b99 zeigt Paket B zu einem anderen Monatspreis.
export const PRICE_VARIANTS = {
  standard: { A: 119, B: 79 },
  b89: { A: 119, B: 89 },
  b99: { A: 119, B: 99 },
} as const satisfies Record<string, Record<PackageType, number>>;

export type PriceVariant = keyof typeof PRICE_VARIANTS;

export const PACKAGE_NAMES: Record<PackageType, string> = {
  A: 'Paket A – Die Executive-Rotation',
  B: 'Paket B – Der Logistik-Autopilot',
};

export interface PackagePricing {
  monthly: number;
  firstMonth: number;
  setupFee: number;
}

export function resolvePriceVariant(value: unknown): PriceVariant {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PRICE_VARIANTS, value)
    ? (value as PriceVariant)
    : 'standard';
}

export function getPricing(variant: PriceVariant, pkg: PackageType): PackagePricing {
  const monthly = PRICE_VARIANTS[variant][pkg];
  return {
    monthly,
    firstMonth: Math.round(monthly * (1 - FIRST_MONTH_DISCOUNT) * 100) / 100,
    setupFee: pkg === 'A' ? SETUP_FEE_A : 0,
  };
}

export function formatEuro(value: number): string {
  return Number.isInteger(value) ? `${value} €` : `${value.toFixed(2).replace('.', ',')} €`;
}
