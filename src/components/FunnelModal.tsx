import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { PackageType, LeadData } from '../types';
import { submitPrivateLead, fetchPublicConfig, CONTACT_EMAIL } from '../services/leadService';
import { getAttribution, getPriceVariant } from '../services/session';
import { track } from '../services/tracking';
import { openLegal } from '../services/legal';
import { PILOT_SPOTS, formatEuro, getPricing } from '../config/pricing';
import {
  COLLEAGUE_OPTIONS,
  CURRENT_SOLUTION_OPTIONS,
  HANDOVER_OPTIONS,
  MONTHLY_SPEND_OPTIONS,
  SHIRT_COUNT_OPTIONS,
  type CurrentSolution,
  type HandoverOption,
  type MonthlySpend,
  type ShirtCount,
} from '../config/options';

interface FunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PackageType;
  prefillPlz?: string;
  onPackageChange: (pkg: PackageType) => void;
  onLeadSubmitted: (lead: LeadData) => void;
}

const chipClass = (active: boolean) =>
  `py-2.5 px-3 border rounded-none font-jakarta text-[12px] sm:text-[13px] font-medium cursor-pointer transition-colors text-center ${
    active
      ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
      : 'bg-[#FFFFFF] text-[#18181B] border-[#E5E0D8] hover:border-[#9A7B4F]'
  }`;

const labelClass = 'text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E] mb-2.5';

export const FunnelModal: React.FC<FunnelModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  prefillPlz = '',
  onPackageChange,
  onLeadSubmitted,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1 State
  const [size, setSize] = useState<string>('40');
  const [fit, setFit] = useState<string>('Modern / Tailored Fit');
  const [mix, setMix] = useState<string>('3x Weiß / 2x Hellblau');
  const [brand, setBrand] = useState<string>('Eton');
  const [customBrand, setCustomBrand] = useState<string>('');
  const [shirtCount, setShirtCount] = useState<ShirtCount | null>(null);

  // Step 2 State
  const [handoverOption, setHandoverOption] = useState<HandoverOption>('home_sunday');
  const [company, setCompany] = useState<string>('');
  const [colleaguesCount, setColleaguesCount] = useState<number>(0);
  const [currentSolution, setCurrentSolution] = useState<CurrentSolution | null>(null);
  const [monthlySpend, setMonthlySpend] = useState<MonthlySpend | null>(null);
  const [wantsSuits, setWantsSuits] = useState<boolean>(false);

  // Step 3 State
  const [plz, setPlz] = useState<string>(prefillPlz);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [website, setWebsite] = useState<string>(''); // Honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedLead, setConfirmedLead] = useState<LeadData | null>(null);
  const [deposit, setDeposit] = useState<{ url: string; amount: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmedLead(null);
      setErrors({});
      setIsSubmitting(false);
      if (prefillPlz) {
        setPlz(prefillPlz);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, prefillPlz]);

  // Jeden Schritt nur einmal pro Öffnung zählen (Zurück-Navigation verfälscht sonst den Funnel)
  const reachedStep = useRef(0);
  useEffect(() => {
    if (!isOpen) {
      reachedStep.current = 0;
      return;
    }
    if (step <= 3 && step > reachedStep.current) {
      reachedStep.current = step;
      track(`funnel_step_${step}` as 'funnel_step_1');
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen || deposit) return;
    fetchPublicConfig().then((config) => {
      if (config?.depositUrl) setDeposit({ url: config.depositUrl, amount: config.depositAmount });
    });
  }, [isOpen, deposit]);

  if (!isOpen) return null;

  const isA = selectedPackage === 'A';
  const priceVariant = getPriceVariant();
  const pricing = getPricing(priceVariant, selectedPackage);
  const pricingA = getPricing(priceVariant, 'A');
  const pricingB = getPricing(priceVariant, 'B');
  const isOffice = HANDOVER_OPTIONS[handoverOption].type === 'B2B';

  const handlePickPackage = (pkg: PackageType) => {
    if (pkg !== selectedPackage) {
      onPackageChange(pkg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!/^\d{5}$/.test(plz)) {
      newErrors.plz = 'Bitte eine 5-stellige Postleitzahl eingeben.';
    }
    if (name.trim().length < 3) {
      newErrors.name = 'Bitte Vor- und Nachnamen eingeben.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    const result = await submitPrivateLead({
      package: selectedPackage,
      priceVariant,
      preferences: {
        collarSize: isA ? size : '',
        fit: isA ? fit : '',
        colorMix: isA ? mix : null,
        brand: customBrand.trim() || (isA ? brand : ''),
      },
      handover: {
        option: handoverOption,
        company: isOffice ? company.trim() || null : null,
        colleaguesCount: isOffice ? colleaguesCount : null,
      },
      survey: {
        shirtCount: isA ? null : shirtCount,
        currentSolution,
        monthlySpend,
        wantsSuits,
      },
      contact: {
        plz,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      },
      attribution: getAttribution(),
      website,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    track('lead_reserved');
    onLeadSubmitted(result.lead);
    setConfirmedLead(result.lead);
    setStep(4);
  };

  const depositHref = (lead: LeadData) => {
    if (!deposit) return '';
    const url = new URL(deposit.url);
    url.searchParams.set('client_reference_id', lead.id);
    url.searchParams.set('prefilled_email', lead.contact.email);
    return url.toString();
  };

  const sizes = ['38', '39', '40', '41', '42', '43', '44+'];
  const fits = ['Slim Fit', 'Modern / Tailored Fit', 'Regular Fit'];
  const mixes = ['5x Weiß', '3x Weiß / 2x Hellblau', '5x Hellblau'];
  const brands = ['Eton', 'Olymp', 'Eterna', 'Seidensticker', 'Maßhemd'];

  const serverErrors = Object.entries(errors).filter(([key]) => !['plz', 'name', 'email'].includes(key));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#0B111E]/72 backdrop-blur-md overflow-y-auto flex justify-center items-start p-3 sm:p-5 md:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-screen-label="Konfigurator"
        className="bg-[#F9F8F6] border border-[#E5E0D8] max-w-[576px] w-full p-4 sm:p-7 md:p-9 text-[#18181B] my-2 sm:my-auto rounded-none font-jakarta"
      >
        {/* Modal Top Row */}
        <div className="flex justify-between items-center gap-4 mb-4 sm:mb-5">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] sm:tracking-[0.22em] text-[#9A7B4F] uppercase">
            {step === 4 ? 'BESTÄTIGUNG' : `SCHRITT ${step} VON 3`}
          </span>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="bg-transparent border-0 p-2 cursor-pointer text-[#57534E] hover:text-[#18181B] flex transition-colors min-h-[36px] min-w-[36px] items-center justify-center"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* 3 Step Indicator Bars */}
        <div className="grid grid-cols-3 gap-1.5 mb-5 sm:mb-7">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-[2px] transition-colors ${
                i <= Math.min(step, 3) ? 'bg-[#9A7B4F]' : 'bg-[#E5E0D8]'
              }`}
            />
          ))}
        </div>

        {/* Package Toggle Segment */}
        {step !== 4 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 py-3 border-t border-b border-[#E5E0D8] mb-6 sm:mb-8 font-jakarta">
            <span className="text-[12px] font-medium text-[#57534E]">Gewähltes Modell:</span>
            <div className="grid grid-cols-2 w-full sm:w-auto border border-[#E5E0D8] bg-[#FFFFFF] p-[3px] gap-[3px]">
              <button
                type="button"
                onClick={() => handlePickPackage('B')}
                className={`py-2 px-2.5 sm:px-3.5 border-0 rounded-none text-[11px] sm:text-[12px] font-semibold cursor-pointer text-center transition-colors min-h-[38px] flex items-center justify-center ${
                  !isA ? 'bg-[#0B111E] text-[#F9F8F6]' : 'bg-transparent text-[#57534E]'
                }`}
              >
                Paket B ({formatEuro(pricingB.monthly)})
              </button>
              <button
                type="button"
                onClick={() => handlePickPackage('A')}
                className={`py-2 px-2.5 sm:px-3.5 border-0 rounded-none text-[11px] sm:text-[12px] font-semibold cursor-pointer text-center transition-colors min-h-[38px] flex items-center justify-center ${
                  isA ? 'bg-[#0B111E] text-[#F9F8F6]' : 'bg-transparent text-[#57534E]'
                }`}
              >
                Paket A ({formatEuro(pricingA.monthly)})
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Passform & Marken-Präferenz (Bedingte Logik nach Paket A / B) */}
        {step === 1 && (
          <div className="flex flex-col gap-6 sm:gap-7">
            <h3 className="font-cormorant font-medium text-[26px] sm:text-[30px] leading-[1.15] m-0">
              {isA ? (
                <>
                  Ihre Passform &amp; <em className="italic">Marken-Präferenz</em>
                </>
              ) : (
                <>
                  Ihre Hemden in der <em className="italic">Pflege-Rotation</em>
                </>
              )}
            </h3>

            {isA ? (
              <>
                {/* Kragenweite (Nur Paket A) */}
                <div>
                  <div className={labelClass}>Kragenweite</div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`${chipClass(size === s)} py-3 text-[14px] tabular-nums`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bevorzugter Schnitt (Nur Paket A) */}
                <div>
                  <div className={labelClass}>Bevorzugter Schnitt</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {fits.map((f) => (
                      <button key={f} type="button" onClick={() => setFit(f)} className={`${chipClass(fit === f)} py-3`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Farb-Mix der 5 Wochenhemden (Nur Paket A) */}
                <div>
                  <div className={labelClass}>Farb-Mix der 5 Wochenhemden</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {mixes.map((m) => (
                      <button key={m} type="button" onClick={() => setMix(m)} className={`${chipClass(mix === m)} py-3`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Welche Hemdenmarke tragen Sie aktuell am liebsten? (Paket A) */}
                <div>
                  <div className={labelClass}>Welche Hemdenmarke tragen Sie aktuell am liebsten?</div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {brands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBrand(b);
                          setCustomBrand('');
                        }}
                        className={`${chipClass(brand === b && !customBrand)} py-2 px-3.5 text-[12px]`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Andere Marke (optional)"
                    value={customBrand}
                    maxLength={80}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full p-3.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F]"
                  />
                </div>

                <div className="p-4 bg-[#F2EFE9] border border-[#E5E0D8] text-[13px] leading-[1.65] text-[#57534E]">
                  Für Ihre 15 persönlich zugewiesenen Hemden fällt einmalig eine Erstausstattung von{' '}
                  <strong className="text-[#18181B]">{formatEuro(pricingA.setupFee)}</strong> an.
                </div>
              </>
            ) : (
              <>
                {/* Paket B: Bestand abfragen (Voraussetzung für das 3-Satz-Prinzip) */}
                <div>
                  <div className={labelClass}>Wie viele Business-Hemden besitzen Sie aktuell?</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {(Object.keys(SHIRT_COUNT_OPTIONS) as ShirtCount[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setShirtCount(key)}
                        className={`${chipClass(shirtCount === key)} py-3`}
                      >
                        {SHIRT_COUNT_OPTIONS[key]}
                      </button>
                    ))}
                  </div>
                  <p className="m-0 mt-2.5 text-[12px] leading-[1.6] text-[#57534E]">
                    Unser Kreislauf arbeitet mit rund 15 Hemden: 5 im Einsatz, 5 in der Pflege, 5 als Reserve in Ihrem Schrank.
                  </p>
                </div>

                <div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#57534E] leading-relaxed">
                      Welche Hemdenmarken geben Sie voraussichtlich in unsere Pflege? (Optional)
                    </span>
                    <input
                      type="text"
                      placeholder="z. B. Eton, Olymp, Van Laack, Maßhemden …"
                      value={customBrand}
                      maxLength={80}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full p-3.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F]"
                    />
                  </label>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 sm:py-[18px] px-3 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[11px] sm:text-[12px] font-semibold tracking-[0.08em] sm:tracking-[0.14em] uppercase cursor-pointer hover:bg-[#866941] transition-colors min-h-[48px] flex items-center justify-center text-center"
            >
              Weiter zum Übergabeort →
            </button>
          </div>
        )}

        {/* STEP 2: Übergabeort & Kurzumfrage */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-cormorant font-medium text-[26px] sm:text-[30px] leading-[1.15] m-0 mb-1 sm:mb-2">
              Wo sollen wir Ihre 5 Hemden <em className="italic">wöchentlich tauschen</em>?
            </h3>

            <div className="flex flex-col gap-2.5">
              {(Object.keys(HANDOVER_OPTIONS) as HandoverOption[]).map((key) => {
                const option = HANDOVER_OPTIONS[key];
                const active = handoverOption === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setHandoverOption(key)}
                    className={`flex gap-3.5 sm:gap-4 items-start p-4 sm:p-5 bg-[#FFFFFF] border cursor-pointer text-left transition-colors ${
                      active ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 border flex items-center justify-center shrink-0 mt-[3px] transition-colors ${
                        active ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
                      }`}
                    >
                      <span className={`w-2 h-2 ${active ? 'bg-[#9A7B4F]' : 'bg-transparent'}`} />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[14px] sm:text-[15px] font-semibold text-[#18181B]">{option.label}</span>
                      <span className="text-[12px] sm:text-[13px] leading-[1.6] text-[#57534E] italic">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* B2B-Details (nur bei Büro-Übergabe) */}
            {isOffice && (
              <div className="flex flex-col gap-4 p-4 bg-[#F2EFE9] border border-[#E5E0D8]">
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#57534E]">
                    Unternehmen / Kanzlei (Optional)
                  </span>
                  <input
                    type="text"
                    autoComplete="organization"
                    placeholder="z. B. Muster & Partner Rechtsanwälte"
                    value={company}
                    maxLength={120}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-3 bg-[#FFFFFF] border border-[#E5E0D8] rounded-none text-[14px] outline-none focus:border-[#9A7B4F]"
                  />
                </label>
                <div>
                  <div className={labelClass}>Wie viele Kollegen am Standort hätten vermutlich auch Interesse?</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {COLLEAGUE_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setColleaguesCount(o.value)}
                        className={chipClass(colleaguesCount === o.value)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Kurzumfrage (optional) */}
            <div className="flex flex-col gap-4 pt-2 border-t border-[#E5E0D8]">
              <span className="text-[12px] text-[#57534E]">Zwei kurze Fragen (optional) – sie helfen uns bei der Routenplanung:</span>
              <div>
                <div className={labelClass}>Wie lösen Sie das Thema Hemden heute?</div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(CURRENT_SOLUTION_OPTIONS) as CurrentSolution[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCurrentSolution(currentSolution === key ? null : key)}
                      className={chipClass(currentSolution === key)}
                    >
                      {CURRENT_SOLUTION_OPTIONS[key]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={labelClass}>Was geben Sie dafür ungefähr pro Monat aus?</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(MONTHLY_SPEND_OPTIONS) as MonthlySpend[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMonthlySpend(monthlySpend === key ? null : key)}
                      className={chipClass(monthlySpend === key)}
                    >
                      {MONTHLY_SPEND_OPTIONS[key]}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWantsSuits(!wantsSuits)}
                className="flex gap-3 items-start p-3.5 bg-[#FFFFFF] border border-[#E5E0D8] cursor-pointer text-left"
              >
                <span
                  className={`w-4 h-4 border border-[#9A7B4F] flex items-center justify-center shrink-0 mt-0.5 ${
                    wantsSuits ? 'bg-[#9A7B4F]' : 'bg-[#FFFFFF]'
                  }`}
                >
                  <Check className="w-3 h-3 text-[#F9F8F6] stroke-[3]" />
                </span>
                <span className="text-[12px] sm:text-[13px] leading-[1.6] text-[#18181B]">
                  Ich würde auch Sakkos, Anzüge und Hosen in die Pflege mitgeben.
                </span>
              </button>
            </div>

            <div className="flex flex-col-reverse sm:grid sm:grid-cols-[1fr_2fr] gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3.5 sm:py-[18px] px-3 bg-[#FFFFFF] text-[#57534E] border border-[#E5E0D8] rounded-none font-jakarta text-[11px] sm:text-[12px] font-semibold tracking-[0.08em] sm:tracking-[0.14em] uppercase cursor-pointer hover:border-[#9A7B4F] transition-colors min-h-[44px] sm:min-h-[48px] flex items-center justify-center text-center"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-4 sm:py-[18px] px-3 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[11px] sm:text-[12px] font-semibold tracking-[0.08em] sm:tracking-[0.14em] uppercase cursor-pointer hover:bg-[#866941] transition-colors min-h-[48px] flex items-center justify-center text-center"
              >
                Weiter zur PLZ-Prüfung →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Warteliste & Lead-Erfassung */}
        {step === 3 && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <h3 className="font-cormorant font-medium text-[26px] sm:text-[30px] leading-[1.15] m-0">
              Sichern Sie sich Ihren Pilotplatz mit{' '}
              <em className="italic text-[#9A7B4F]">50 % Start-Vorteil</em>.
            </h3>

            <p className="m-0 mb-1 text-[13px] sm:text-[14px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
              Wir bereiten den Start der ersten Kurier-Routen in Stuttgart vor. Reservieren Sie sich unverbindlich einen der {PILOT_SPOTS} Pilotplätze und testen Sie den ersten Monat zum halben Preis ({formatEuro(pricing.firstMonth)} statt {formatEuro(pricing.monthly)}
              {pricing.setupFee > 0 && <>, zzgl. einmalig {formatEuro(pricing.setupFee)} Erstausstattung</>}).
            </p>

            {/* PLZ */}
            <label className="flex flex-col gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
                Postleitzahl in Stuttgart *
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="z. B. 70173"
                value={plz}
                onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className={`p-3 sm:p-3.5 bg-[#FFFFFF] border rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F] ${
                  errors.plz ? 'border-[#9A3412]' : 'border-[#E5E0D8]'
                }`}
              />
              {errors.plz && <span className="text-[12px] text-[#9A3412]">{errors.plz}</span>}
            </label>

            {/* Name */}
            <label className="flex flex-col gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
                Vor- und Nachname *
              </span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Dr. Max Mustermann"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                className={`p-3 sm:p-3.5 bg-[#FFFFFF] border rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F] ${
                  errors.name ? 'border-[#9A3412]' : 'border-[#E5E0D8]'
                }`}
              />
              {errors.name && <span className="text-[12px] text-[#9A3412]">{errors.name}</span>}
            </label>

            {/* Email */}
            <label className="flex flex-col gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
                E-Mail-Adresse (Geschäftlich oder Privat) *
              </span>
              <input
                type="email"
                autoComplete="email"
                placeholder="name@kanzlei-beispiel.de"
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
                className={`p-3 sm:p-3.5 bg-[#FFFFFF] border rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F] ${
                  errors.email ? 'border-[#9A3412]' : 'border-[#E5E0D8]'
                }`}
              />
              {errors.email && <span className="text-[12px] text-[#9A3412]">{errors.email}</span>}
            </label>

            {/* Phone (Optional) */}
            <label className="flex flex-col gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E]">
                Mobilnummer für Rückfragen zur Route (Optional)
              </span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+49 170 1234567"
                value={phone}
                maxLength={30}
                onChange={(e) => setPhone(e.target.value)}
                className="p-3 sm:p-3.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F]"
              />
            </label>

            {/* Honeypot: für Menschen unsichtbar, Bots füllen es aus */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute -left-[9999px] w-px h-px opacity-0"
            />

            {serverErrors.length > 0 && (
              <div role="alert" className="p-3.5 border border-[#9A3412]/40 bg-[#9A3412]/5 text-[12px] leading-[1.6] text-[#9A3412]">
                {serverErrors.map(([key, message]) => (
                  <div key={key}>{message}</div>
                ))}
                <div className="mt-1">
                  Alternativ erreichen Sie uns unter{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-4 sm:py-[18px] px-3 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[11px] sm:text-[12px] font-semibold tracking-[0.06em] sm:tracking-[0.1em] uppercase cursor-pointer hover:bg-[#866941] transition-opacity min-h-[48px] flex items-center justify-center text-center leading-snug ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              {isSubmitting ? 'Wird reserviert …' : 'Pilotplatz & 50 % Rabatt unverbindlich reservieren'}
            </button>

            <p className="m-0 text-[11px] leading-[1.6] text-[#57534E] text-center">
              Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Reservierung verarbeiten.
              Details in der{' '}
              <button
                type="button"
                onClick={() => openLegal('datenschutz')}
                className="bg-transparent border-0 p-0 underline text-[#18181B] cursor-pointer text-[11px]"
              >
                Datenschutzerklärung
              </button>{' '}
              und den{' '}
              <button
                type="button"
                onClick={() => openLegal('agb')}
                className="bg-transparent border-0 p-0 underline text-[#18181B] cursor-pointer text-[11px]"
              >
                Teilnahmebedingungen
              </button>
              .
            </p>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="self-center bg-transparent border-0 p-2 font-jakarta text-[12px] text-[#57534E] cursor-pointer hover:text-[#18181B] transition-colors min-h-[44px] flex items-center justify-center"
            >
              ← Zurück zum Übergabeort
            </button>
          </form>
        )}

        {/* STEP 4: Bestätigung */}
        {step === 4 && confirmedLead && (
          <div className="flex flex-col items-center text-center gap-4">
            <span className="w-14 h-14 border border-[#9A7B4F]/50 flex items-center justify-center text-[#9A7B4F]">
              <Check className="w-6 h-6 stroke-[1.5]" />
            </span>

            <h3 className="font-cormorant font-medium text-[28px] sm:text-[32px] leading-[1.15] mt-1 mb-0">
              Ihr Pilotplatz ist <em className="italic">vorgemerkt</em>.
            </h3>

            <p className="m-0 text-[13px] sm:text-[14px] leading-[1.7] text-[#57534E] max-w-[420px] text-pretty font-jakarta">
              Vielen Dank, {confirmedLead.contact.name}. Wir melden uns per E-Mail, sobald Ihre Route in PLZ {confirmedLead.contact.plz} startet. Ihr erster Monat kostet {formatEuro(confirmedLead.firstMonthPrice)} statt {formatEuro(confirmedLead.pricePerMonth)}.
            </p>

            {/* Summary Table */}
            <div className="w-full bg-[#FFFFFF] border border-[#E5E0D8] mt-3 text-left">
              {[
                { k: 'Reservierungs-ID', v: confirmedLead.id },
                { k: 'Modell', v: confirmedLead.packageName },
                ...(confirmedLead.package === 'A'
                  ? [
                      {
                        k: 'Kragenweite & Schnitt',
                        v: `${confirmedLead.preferences.collarSize} · ${confirmedLead.preferences.fit}`,
                      },
                      ...(confirmedLead.preferences.colorMix
                        ? [{ k: 'Farb-Mix', v: confirmedLead.preferences.colorMix }]
                        : []),
                      { k: 'Lieblingsmarke', v: confirmedLead.preferences.brand },
                      { k: 'Erstausstattung (einmalig)', v: formatEuro(confirmedLead.setupFee) },
                    ]
                  : [{ k: 'Hemden', v: 'Eigene Hemden (Rotation)' }]),
                {
                  k: 'Übergabe',
                  v: `${confirmedLead.handover.location} (${confirmedLead.handover.slot})`,
                },
                { k: 'PLZ', v: `${confirmedLead.contact.plz} Stuttgart` },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="flex justify-between gap-4 py-2.5 sm:py-3 px-3 sm:px-4.5 border-b border-[#F2EFE9] text-[12px] sm:text-[13px] font-jakarta"
                >
                  <span className="text-[#57534E]">{row.k}</span>
                  <span className="text-[#18181B] font-medium text-right">{row.v}</span>
                </div>
              ))}
            </div>

            {/* Optional: verbindliche, erstattbare Anzahlung */}
            {deposit && (
              <div className="w-full mt-2 p-4 sm:p-5 border border-[#9A7B4F] bg-[#FFFFFF] text-left flex flex-col gap-3">
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#9A7B4F]">
                  Platz verbindlich sichern (optional)
                </span>
                <p className="m-0 text-[13px] leading-[1.65] text-[#57534E]">
                  Mit einer Anzahlung von {formatEuro(deposit.amount)} rücken Sie in der Startreihenfolge nach vorn. Der Betrag wird
                  mit Ihrem ersten Monat verrechnet und ist bis zum Start jederzeit auf Anfrage voll erstattbar.
                </p>
                <a
                  href={depositHref(confirmedLead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('deposit_clicked')}
                  className="w-full py-3.5 bg-[#9A7B4F] text-[#0B111E] text-center text-[12px] font-semibold tracking-[0.12em] uppercase hover:bg-[#866941] transition-colors min-h-[48px] flex items-center justify-center"
                >
                  {formatEuro(deposit.amount)} Anzahlung leisten →
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-4 bg-[#0B111E] text-[#F9F8F6] border-0 rounded-none font-jakarta text-[12px] font-semibold tracking-[0.14em] uppercase cursor-pointer hover:bg-[#18181B] transition-colors min-h-[48px] flex items-center justify-center text-center"
            >
              Schließen
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
