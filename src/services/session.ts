import type { Attribution } from '../types';
import { resolvePriceVariant, type PriceVariant } from '../config/pricing';

// Merkt sich Kampagnen-Herkunft (UTM) und Preistest-Variante für die Dauer der Sitzung,
// damit sie auch nach Navigation innerhalb der Seite im Lead landen.

const ATTRIBUTION_KEY = 'hp_attribution';
const VARIANT_KEY = 'hp_price_variant';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Privater Modus o. Ä. – Werte gelten dann nur für diesen Seitenaufruf
  }
}

let memoryAttribution: Attribution | null = null;
let memoryVariant: PriceVariant | null = null;

export function captureSession() {
  const params = new URLSearchParams(window.location.search);

  if (!read(ATTRIBUTION_KEY)) {
    const attribution: Attribution = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) attribution[key] = value.slice(0, 200);
    }
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      attribution.referrer = document.referrer.slice(0, 200);
    }
    memoryAttribution = attribution;
    write(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }

  const variantParam = params.get('p');
  if (variantParam) {
    memoryVariant = resolvePriceVariant(variantParam);
    write(VARIANT_KEY, memoryVariant);
  }
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(read(ATTRIBUTION_KEY) || 'null') ?? memoryAttribution ?? {};
  } catch {
    return memoryAttribution ?? {};
  }
}

export function getPriceVariant(): PriceVariant {
  return resolvePriceVariant(read(VARIANT_KEY) ?? memoryVariant);
}
