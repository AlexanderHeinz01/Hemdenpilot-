import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { PackageType, LeadData } from '../types';
import { dispatchLead } from '../services/leadService';

interface FunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PackageType;
  prefillPlz?: string;
  onPackageChange: (pkg: PackageType) => void;
  onLeadSubmitted: (lead: LeadData) => void;
}

const STORAGE_KEY = 'hemdenpilot_leads';

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

  // Step 2 State
  const [dropoff, setDropoff] = useState<'home' | 'office'>('home');
  const [colleagues, setColleagues] = useState<boolean>(false);

  // Step 3 State
  const [plz, setPlz] = useState<string>(prefillPlz);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedLead, setConfirmedLead] = useState<LeadData | null>(null);

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

  if (!isOpen) return null;

  const isA = selectedPackage === 'A';

  const handlePickPackage = (pkg: PackageType) => {
    if (pkg !== selectedPackage) {
      console.log('[Tracking] package_switched', { to: pkg });
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'package_switched', { to: pkg });
      }
      onPackageChange(pkg);
    }
  };

  const handleCustomBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomBrand(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const lead: LeadData = {
      id: `HP-${plz}-${Math.floor(1000 + Math.random() * 9000)}`,
      event: 'lead_reserved',
      package: selectedPackage,
      packageName: isA ? 'Paket A – Die Executive-Rotation' : 'Paket B – Der Logistik-Autopilot',
      pricePerMonth: isA ? 119 : 79,
      firstMonthPrice: isA ? 59.5 : 39.5,
      preferences: {
        collarSize: isA ? size : 'Eigene Hemden (Keine Angabe nötig)',
        fit: isA ? fit : 'Eigene Hemden',
        colorMix: isA ? mix : null,
        brand: isA ? (customBrand.trim() || brand) : (customBrand.trim() || 'Eigene Hemden (Keine Angabe)'),
      },
      handover:
        dropoff === 'home'
          ? {
              type: 'B2C',
              location: 'Privatadresse an der Wohnungstür',
              slot: 'Sonntag 18:00–21:00',
            }
          : {
              type: 'B2B',
              location: 'Büro- oder Kanzlei-Empfang',
              slot: 'Montag bis 09:00',
              colleaguesInterested: colleagues,
            },
      contact: {
        plz,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      },
      city: 'Stuttgart',
      createdAt: new Date().toISOString(),
      status: 'neu',
    };

    // Forward lead directly to info@alexander-heinz.de, trigger webhooks, and save locally
    dispatchLead(lead).finally(() => {
      console.log('NEUER LEAD ERFASST (Event: lead_reserved):', lead);
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lead_reserved', lead);
      }

      onLeadSubmitted(lead);
      setConfirmedLead(lead);
      setIsSubmitting(false);
      setStep(4);
    });
  };

  const sizes = ['38', '39', '40', '41', '42', '43', '44+'];
  const fits = ['Slim Fit', 'Modern / Tailored Fit', 'Regular Fit'];
  const mixes = ['5x Weiß', '3x Weiß / 2x Hellblau', '5x Hellblau'];
  const brands = ['Eton', 'Olymp', 'Eterna', 'Seidensticker', 'Maßhemd'];

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 py-3 border-t border-b border-[#E5E0D8] mb-6 sm:mb-8 font-jakarta">
          <span className="text-[12px] font-medium text-[#57534E]">Gewähltes Modell:</span>
          <div className="grid grid-cols-2 w-full sm:w-auto border border-[#E5E0D8] bg-[#FFFFFF] p-[3px] gap-[3px]">
            <button
              type="button"
              onClick={() => handlePickPackage('A')}
              className={`py-2 px-2.5 sm:px-3.5 border-0 rounded-none text-[11px] sm:text-[12px] font-semibold cursor-pointer text-center transition-colors min-h-[38px] flex items-center justify-center ${
                isA ? 'bg-[#0B111E] text-[#F9F8F6]' : 'bg-transparent text-[#57534E]'
              }`}
            >
              Paket A (119 €)
            </button>
            <button
              type="button"
              onClick={() => handlePickPackage('B')}
              className={`py-2 px-2.5 sm:px-3.5 border-0 rounded-none text-[11px] sm:text-[12px] font-semibold cursor-pointer text-center transition-colors min-h-[38px] flex items-center justify-center ${
                !isA ? 'bg-[#0B111E] text-[#F9F8F6]' : 'bg-transparent text-[#57534E]'
              }`}
            >
              Paket B (79 €)
            </button>
          </div>
        </div>

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
                  <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E] mb-2.5">
                    Kragenweite
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`py-3 text-center text-[14px] font-medium border rounded-none font-jakarta cursor-pointer tabular-nums transition-colors ${
                          size === s
                            ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
                            : 'bg-[#FFFFFF] text-[#18181B] border-[#E5E0D8] hover:border-[#9A7B4F]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bevorzugter Schnitt (Nur Paket A) */}
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E] mb-2.5">
                    Bevorzugter Schnitt
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {fits.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFit(f)}
                        className={`py-3 px-2 text-center text-[13px] font-medium border rounded-none font-jakarta cursor-pointer transition-colors ${
                          fit === f
                            ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
                            : 'bg-[#FFFFFF] text-[#18181B] border-[#E5E0D8] hover:border-[#9A7B4F]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Farb-Mix der 5 Wochenhemden (Nur Paket A) */}
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E] mb-2.5">
                    Farb-Mix der 5 Wochenhemden
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {mixes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMix(m)}
                        className={`py-3 px-2 text-center text-[13px] font-medium border rounded-none font-jakarta cursor-pointer transition-colors ${
                          mix === m
                            ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
                            : 'bg-[#FFFFFF] text-[#18181B] border-[#E5E0D8] hover:border-[#9A7B4F]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Welche Hemdenmarke tragen Sie aktuell am liebsten? (Paket A) */}
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E] mb-2.5">
                    Welche Hemdenmarke tragen Sie aktuell am liebsten?
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {brands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBrand(b);
                          setCustomBrand('');
                        }}
                        className={`py-2 px-3.5 border rounded-none font-jakarta text-[12px] font-medium cursor-pointer transition-colors ${
                          brand === b && !customBrand
                            ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
                            : 'bg-[#FFFFFF] text-[#18181B] border-[#E5E0D8] hover:border-[#9A7B4F]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Andere Marke (optional)"
                    value={customBrand}
                    onChange={handleCustomBrandChange}
                    className="w-full p-3.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F]"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Paket B: Erklärender Satz statt Größen/Schnitt/Farb-Mix */}
                <div className="p-4 sm:p-5 bg-[#F2EFE9] border border-[#E5E0D8] text-[13px] sm:text-[14px] leading-[1.65] text-[#57534E] font-jakarta">
                  Da Sie Ihre eigenen Hemden in die Rotation geben, benötigen wir keine Größenangaben.
                </div>

                {/* Paket B: Umbenanntes reines Textfeld für Marken */}
                <div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#57534E] leading-relaxed">
                      Welche Hemdenmarken geben Sie voraussichtlich in unsere Pflege? (Optional, hilft uns bei der Wahl des Schonwaschgangs)
                    </span>
                    <input
                      type="text"
                      placeholder="z. B. Eton, Olymp, Van Laack, Barba Napoli, Maßhemden …"
                      value={customBrand}
                      onChange={handleCustomBrandChange}
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

        {/* STEP 2: Übergabeort */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-cormorant font-medium text-[26px] sm:text-[30px] leading-[1.15] m-0 mb-1 sm:mb-2">
              Wo sollen wir Ihre 5 Hemden <em className="italic">wöchentlich tauschen</em>?
            </h3>

            {/* Radio 1: Privatadresse */}
            <div
              onClick={() => setDropoff('home')}
              className={`flex gap-3.5 sm:gap-4 items-start p-4 sm:p-[22px] bg-[#FFFFFF] border cursor-pointer transition-colors ${
                dropoff === 'home' ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
              }`}
            >
              <span
                className={`w-4 h-4 border flex items-center justify-center shrink-0 mt-[3px] transition-colors ${
                  dropoff === 'home' ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
                }`}
              >
                <span
                  className={`w-2 h-2 ${
                    dropoff === 'home' ? 'bg-[#9A7B4F]' : 'bg-transparent'
                  }`}
                />
              </span>
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[14px] sm:text-[15px] font-semibold text-[#18181B]">
                  Privatadresse an der Wohnungstür
                </span>
                <span className="text-[12px] sm:text-[13px] leading-[1.6] text-[#57534E] italic font-jakarta">
                  Jeden Sonntagabend zwischen 18:00 und 21:00 Uhr – kontaktlos im Kleidersack
                </span>
              </div>
            </div>

            {/* Radio 2: Büro- oder Kanzlei-Empfang */}
            <div
              onClick={() => setDropoff('office')}
              className={`flex gap-3.5 sm:gap-4 items-start p-4 sm:p-[22px] bg-[#FFFFFF] border cursor-pointer transition-colors ${
                dropoff === 'office' ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
              }`}
            >
              <span
                className={`w-4 h-4 border flex items-center justify-center shrink-0 mt-[3px] transition-colors ${
                  dropoff === 'office' ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
                }`}
              >
                <span
                  className={`w-2 h-2 ${
                    dropoff === 'office' ? 'bg-[#9A7B4F]' : 'bg-transparent'
                  }`}
                />
              </span>
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[14px] sm:text-[15px] font-semibold text-[#18181B]">
                  Büro- oder Kanzlei-Empfang
                </span>
                <span className="text-[12px] sm:text-[13px] leading-[1.6] text-[#57534E] italic font-jakarta">
                  Jeden Montagmorgen bis 09:00 Uhr – ideal für Teams &amp; Kanzleien
                </span>
              </div>
            </div>

            {/* B2B Colleagues Checkbox (Only if office selected) */}
            {dropoff === 'office' && (
              <div
                onClick={() => setColleagues(!colleagues)}
                className="flex gap-3 items-start p-3.5 sm:p-4 bg-[#F2EFE9] border border-[#E5E0D8] cursor-pointer"
              >
                <span
                  className={`w-4 h-4 border border-[#9A7B4F] flex items-center justify-center shrink-0 mt-0.5 ${
                    colleagues ? 'bg-[#9A7B4F]' : 'bg-[#FFFFFF]'
                  }`}
                >
                  <Check className="w-3 h-3 text-[#F9F8F6] stroke-[3]" />
                </span>
                <span className="text-[12px] sm:text-[13px] leading-[1.6] text-[#18181B] italic font-jakarta">
                  In meinem Büro/meiner Kanzlei gäbe es potenziell 3+ weitere Kollegen mit Interesse (B2B-Sonderkonditionen).
                </span>
              </div>
            )}

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
              Wir schalten im nächsten Monat die neuen Kurier-Routen in Stuttgart frei. Reservieren Sie sich unverbindlich einen der 50 Plätze und testen Sie den ersten Monat zum halben Preis ({isA ? '59,50 €' : '39,50 €'} statt {isA ? '119 €' : '79 €'}).
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
              {errors.plz && (
                <span className="text-[12px] text-[#9A3412]">{errors.plz}</span>
              )}
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
                onChange={(e) => setName(e.target.value)}
                className={`p-3 sm:p-3.5 bg-[#FFFFFF] border rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F] ${
                  errors.name ? 'border-[#9A3412]' : 'border-[#E5E0D8]'
                }`}
              />
              {errors.name && (
                <span className="text-[12px] text-[#9A3412]">{errors.name}</span>
              )}
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
                onChange={(e) => setEmail(e.target.value)}
                className={`p-3 sm:p-3.5 bg-[#FFFFFF] border rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F] ${
                  errors.email ? 'border-[#9A3412]' : 'border-[#E5E0D8]'
                }`}
              />
              {errors.email && (
                <span className="text-[12px] text-[#9A3412]">{errors.email}</span>
              )}
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
                onChange={(e) => setPhone(e.target.value)}
                className="p-3 sm:p-3.5 bg-[#FFFFFF] border border-[#E5E0D8] rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F]"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-4 sm:py-[18px] px-3 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[11px] sm:text-[12px] font-semibold tracking-[0.06em] sm:tracking-[0.1em] uppercase cursor-pointer hover:bg-[#866941] transition-opacity min-h-[48px] flex items-center justify-center text-center leading-snug ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              {isSubmitting
                ? 'Wird reserviert …'
                : 'Pilotplatz & 50 % Rabatt unverbindlich reservieren'}
            </button>

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
              Ihr Pilotplatz ist <em className="italic">reserviert</em>.
            </h3>

            <p className="m-0 text-[13px] sm:text-[14px] leading-[1.7] text-[#57534E] max-w-[420px] text-pretty font-jakarta">
              Vielen Dank, {confirmedLead.contact.name}. Wir melden uns per E-Mail, sobald Ihre Route in PLZ {confirmedLead.contact.plz} freigeschaltet ist. Ihr erster Monat kostet {confirmedLead.firstMonthPrice.toFixed(2).replace('.', ',')} € statt {confirmedLead.pricePerMonth} €.
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
                    ]
                  : [
                      { k: 'Hemden', v: 'Eigene Hemden (Rotation)' },
                      ...(confirmedLead.preferences.brand && !confirmedLead.preferences.brand.includes('Keine Angabe')
                        ? [{ k: 'Hemdenmarken', v: confirmedLead.preferences.brand }]
                        : []),
                    ]),
                {
                  k: 'Übergabeort',
                  v: `${confirmedLead.handover.location} (${confirmedLead.handover.slot})`,
                },
                ...(confirmedLead.handover.type === 'B2B' &&
                (confirmedLead.handover as any).colleaguesInterested
                  ? [{ k: 'B2B-Interesse', v: '3+ Kollegen' }]
                  : []),
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
