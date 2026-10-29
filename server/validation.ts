import crypto from 'crypto';
import type {
  Attribution,
  CompanyLead,
  LeadData,
  PackageType,
} from '../src/types';
import { PACKAGE_NAMES, getPricing, resolvePriceVariant } from '../src/config/pricing';
import {
  COLLEAGUE_OPTIONS,
  CURRENT_SOLUTION_OPTIONS,
  HANDOVER_OPTIONS,
  MONTHLY_SPEND_OPTIONS,
  SHIRT_COUNT_OPTIONS,
  SUBSIDY_OPTIONS,
  TRACKING_EVENTS,
  isOption,
} from '../src/config/options';

export type ValidationResult<T> =
  | { ok: true; value: T; isSpam: boolean }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLZ_RE = /^\d{5}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function optionalText(value: unknown, maxLength: number): string | null {
  return text(value, maxLength) || null;
}

function newId(prefix: string, plz: string): string {
  return `${prefix}-${plz}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

function parseAttribution(value: unknown): Attribution {
  if (!isRecord(value)) return {};
  const result: Attribution = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'referrer'] as const) {
    const v = text(value[key], 200);
    if (v) result[key] = v;
  }
  return result;
}

function validateContact(
  plz: unknown,
  name: unknown,
  email: unknown,
  phone: unknown,
  errors: Record<string, string>
) {
  const contact = {
    plz: text(plz, 5),
    name: text(name, 100),
    email: text(email, 254).toLowerCase(),
    phone: optionalText(phone, 30),
  };
  if (!PLZ_RE.test(contact.plz)) errors.plz = 'Bitte eine 5-stellige Postleitzahl eingeben.';
  if (contact.name.length < 3) errors.name = 'Bitte Vor- und Nachnamen eingeben.';
  if (!EMAIL_RE.test(contact.email)) errors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.';
  if (contact.phone && !/^[+\d][\d\s()/-]{4,29}$/.test(contact.phone)) {
    errors.phone = 'Bitte eine gültige Telefonnummer eingeben.';
  }
  return contact;
}

export function validatePrivateLead(body: unknown): ValidationResult<LeadData> {
  if (!isRecord(body)) return { ok: false, errors: { body: 'Ungültige Anfrage.' } };
  const errors: Record<string, string> = {};

  const pkg = body.package;
  if (pkg !== 'A' && pkg !== 'B') errors.package = 'Unbekanntes Paket.';
  const packageType = (pkg === 'A' ? 'A' : 'B') as PackageType;

  const prefs = isRecord(body.preferences) ? body.preferences : {};
  const handover = isRecord(body.handover) ? body.handover : {};
  const survey = isRecord(body.survey) ? body.survey : {};
  const contactIn = isRecord(body.contact) ? body.contact : {};

  if (!isOption(HANDOVER_OPTIONS, handover.option)) errors.handover = 'Bitte einen Übergabeort wählen.';
  const option = isOption(HANDOVER_OPTIONS, handover.option) ? handover.option : 'home_sunday';
  const handoverConfig = HANDOVER_OPTIONS[option];
  const isB2B = handoverConfig.type === 'B2B';

  const allowedColleagues: number[] = COLLEAGUE_OPTIONS.map((o) => o.value);
  const colleaguesCount =
    isB2B && typeof handover.colleaguesCount === 'number' && allowedColleagues.includes(handover.colleaguesCount)
      ? handover.colleaguesCount
      : null;

  const contact = validateContact(contactIn.plz, contactIn.name, contactIn.email, contactIn.phone, errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const priceVariant = resolvePriceVariant(body.priceVariant);
  const pricing = getPricing(priceVariant, packageType);
  const isA = packageType === 'A';

  const lead: LeadData = {
    kind: 'private',
    id: newId('HP', contact.plz),
    event: 'lead_reserved',
    package: packageType,
    packageName: PACKAGE_NAMES[packageType],
    priceVariant,
    pricePerMonth: pricing.monthly,
    firstMonthPrice: pricing.firstMonth,
    setupFee: pricing.setupFee,
    preferences: {
      collarSize: isA ? text(prefs.collarSize, 10) || 'Keine Angabe' : 'Eigene Hemden',
      fit: isA ? text(prefs.fit, 40) || 'Keine Angabe' : 'Eigene Hemden',
      colorMix: isA ? optionalText(prefs.colorMix, 40) : null,
      brand: text(prefs.brand, 80) || (isA ? 'Keine Angabe' : 'Eigene Hemden (Keine Angabe)'),
    },
    handover: {
      option,
      type: handoverConfig.type,
      location: handoverConfig.label,
      slot: handoverConfig.slot,
      company: isB2B ? optionalText(handover.company, 120) : null,
      colleaguesCount,
    },
    survey: {
      shirtCount: isOption(SHIRT_COUNT_OPTIONS, survey.shirtCount) ? survey.shirtCount : null,
      currentSolution: isOption(CURRENT_SOLUTION_OPTIONS, survey.currentSolution) ? survey.currentSolution : null,
      monthlySpend: isOption(MONTHLY_SPEND_OPTIONS, survey.monthlySpend) ? survey.monthlySpend : null,
      wantsSuits: survey.wantsSuits === true,
    },
    contact,
    city: 'Stuttgart',
    createdAt: new Date().toISOString(),
    status: 'neu',
    notes: '',
    attribution: parseAttribution(body.attribution),
  };

  return { ok: true, value: lead, isSpam: text(body.website, 200) !== '' };
}

export function validateCompanyLead(body: unknown): ValidationResult<CompanyLead> {
  if (!isRecord(body)) return { ok: false, errors: { body: 'Ungültige Anfrage.' } };
  const errors: Record<string, string> = {};

  const company = text(body.company, 120);
  if (company.length < 2) errors.company = 'Bitte den Namen Ihres Unternehmens angeben.';

  const contact = validateContact(body.plz, body.contactName, body.email, body.phone, errors);

  const employees = typeof body.employeesInterested === 'number' ? Math.floor(body.employeesInterested) : NaN;
  if (!Number.isFinite(employees) || employees < 1 || employees > 5000) {
    errors.employeesInterested = 'Bitte die Anzahl interessierter Mitarbeiter angeben (mind. 1).';
  }

  if (!isOption(SUBSIDY_OPTIONS, body.employerSubsidy)) errors.employerSubsidy = 'Bitte eine Auswahl treffen.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const lead: CompanyLead = {
    kind: 'company',
    id: newId('HPB', contact.plz),
    event: 'company_inquiry',
    company,
    contactName: contact.name,
    role: optionalText(body.role, 80),
    email: contact.email,
    phone: contact.phone,
    plz: contact.plz,
    employeesInterested: employees,
    employerSubsidy: isOption(SUBSIDY_OPTIONS, body.employerSubsidy) ? body.employerSubsidy : 'unklar',
    message: optionalText(body.message, 1000),
    city: 'Stuttgart',
    createdAt: new Date().toISOString(),
    status: 'neu',
    notes: '',
    attribution: parseAttribution(body.attribution),
  };

  return { ok: true, value: lead, isSpam: text(body.website, 200) !== '' };
}

// Liefert den Zähler-Schlüssel (z. B. "plz_check:active") oder null bei unbekanntem Event.
export function validateEvent(body: unknown): string | null {
  if (!isRecord(body) || !isOption(TRACKING_EVENTS, body.name)) return null;
  const allowedDetails: readonly string[] = TRACKING_EVENTS[body.name];
  if (allowedDetails.length === 0) return body.name;
  return typeof body.detail === 'string' && allowedDetails.includes(body.detail)
    ? `${body.name}:${body.detail}`
    : null;
}
