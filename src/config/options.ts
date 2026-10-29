// Auswahl-Optionen, die Konfigurator, B2B-Formular und Server-Validierung gemeinsam nutzen.

export const HANDOVER_OPTIONS = {
  home_sunday: {
    type: 'B2C',
    label: 'Privatadresse an der Wohnungstür',
    slot: 'Sonntag 18:00–21:00',
    description: 'Jeden Sonntagabend zwischen 18:00 und 21:00 Uhr – kontaktlos im Kleidersack',
  },
  home_weekday: {
    type: 'B2C',
    label: 'Privatadresse an einem Werktagabend',
    slot: 'Di oder Mi 19:00–21:00',
    description: 'Dienstag- oder Mittwochabend zwischen 19:00 und 21:00 Uhr – kontaktlos im Kleidersack',
  },
  concierge: {
    type: 'B2C',
    label: 'Concierge oder Paketraum im Gebäude',
    slot: 'Nach Absprache',
    description: 'Übergabe an Ihren Concierge oder in den Paketraum Ihres Wohngebäudes',
  },
  office_monday: {
    type: 'B2B',
    label: 'Büro- oder Kanzlei-Empfang',
    slot: 'Montag bis 09:00',
    description: 'Jeden Montagmorgen bis 09:00 Uhr – ideal für Teams & Kanzleien',
  },
} as const;

export type HandoverOption = keyof typeof HANDOVER_OPTIONS;

// Anzahl interessierter Kollegen (gespeichert wird die Untergrenze der Spanne)
export const COLLEAGUE_OPTIONS = [
  { value: 0, label: 'Nur ich' },
  { value: 1, label: '1–2' },
  { value: 3, label: '3–5' },
  { value: 6, label: '6 oder mehr' },
] as const;

export const SHIRT_COUNT_OPTIONS = {
  lt10: 'Weniger als 10',
  '10to14': '10 bis 14',
  '15plus': '15 oder mehr',
} as const;
export type ShirtCount = keyof typeof SHIRT_COUNT_OPTIONS;

export const CURRENT_SOLUTION_OPTIONS = {
  selbst: 'Selbst waschen & bügeln',
  partner: 'Partner(in) / Familie',
  reinigung: 'Textilreinigung',
  haushaltshilfe: 'Haushaltshilfe',
  anderes: 'Anderes',
} as const;
export type CurrentSolution = keyof typeof CURRENT_SOLUTION_OPTIONS;

export const MONTHLY_SPEND_OPTIONS = {
  none: '0 €',
  lt30: 'unter 30 €',
  '30to60': '30–60 €',
  gt60: 'über 60 €',
} as const;
export type MonthlySpend = keyof typeof MONTHLY_SPEND_OPTIONS;

export const SUBSIDY_OPTIONS = {
  ja: 'Ja',
  nein: 'Nein',
  unklar: 'Noch unklar',
} as const;
export type EmployerSubsidy = keyof typeof SUBSIDY_OPTIONS;

// Erlaubte Tracking-Events (aggregierte Zähler, keine personenbezogenen Daten)
export const TRACKING_EVENTS = {
  page_view: [],
  select_package_A: [],
  select_package_B: [],
  funnel_step_1: [],
  funnel_step_2: [],
  funnel_step_3: [],
  lead_reserved: [],
  plz_check: ['active', 'prep', 'outside'],
  b2b_form_submitted: [],
  deposit_clicked: [],
} as const satisfies Record<string, readonly string[]>;

export type TrackingEvent = keyof typeof TRACKING_EVENTS;

export function isOption<T extends Record<string, unknown>>(options: T, value: unknown): value is keyof T {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(options, value);
}
