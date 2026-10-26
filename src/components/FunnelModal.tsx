import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { PackageType, ShirtPreferences, LeadData } from '../types';

interface FunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PackageType;
  onLeadSubmitted: (lead: LeadData) => void;
}

export const FunnelModal: React.FC<FunnelModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onLeadSubmitted,
}) => {
  const [modalStep, setModalStep] = useState<number>(1);

  // Abfrage 1: Hemdengröße / Marke
  const [size, setSize] = useState<string>('39');
  const [fit, setFit] = useState<'Slim' | 'Modern' | 'Regular'>('Modern');
  const [brand, setBrand] = useState<string>('Olymp');
  const [customBrand, setCustomBrand] = useState<string>('');

  // Abfrage 2: Übergabeort
  const [dropoff, setDropoff] = useState<'Privatadresse (Sonntagabend, 18–21 Uhr)' | 'Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)'>('Privatadresse (Sonntagabend, 18–21 Uhr)');

  // Abschluss-Schritt (Warteliste)
  const [plz, setPlz] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedLead, setConfirmedLead] = useState<LeadData | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModalStep(1);
      setConfirmedLead(null);
    }
  }, [isOpen, selectedPackage]);

  if (!isOpen) return null;

  const pkgTitle = selectedPackage === 'paket-a' ? 'PAKET A: Die Full-Service-Flatrate' : 'PAKET B: Der Logistik-Autopilot';
  const pkgPrice = selectedPackage === 'paket-a' ? 119 : 79;

  const handleNextToStep2 = () => {
    setModalStep(2);
  };

  const handleNextToStep3 = () => {
    setModalStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plz || !email) return;

    setIsSubmitting(true);

    const lead: LeadData = {
      id: `HP-${plz}-${Math.floor(1000 + Math.random() * 9000)}`,
      packageType: selectedPackage,
      packageName: pkgTitle,
      pricePerMonth: pkgPrice,
      preferences: {
        size: `Kragenweite ${size}`,
        fit,
        brand: customBrand.trim() ? customBrand.trim() : brand,
        dropoffLocation: dropoff,
      },
      plz,
      email,
      phone: phone.trim() ? phone.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      // Save locally for tester/admin review
      try {
        const stored = JSON.parse(localStorage.getItem('hemdenpilot_leads') || '[]');
        localStorage.setItem('hemdenpilot_leads', JSON.stringify([lead, ...stored]));
      } catch (err) {
        console.error('LocalStorage write error', err);
      }

      // Track lead event
      if (typeof window !== 'undefined') {
        console.log('✅ NEUER LEAD ERFASST (Event: lead_reserved):', lead);
        // @ts-ignore
        if (typeof window.gtag === 'function') {
          // @ts-ignore
          window.gtag('event', 'lead_reserved', lead);
        }
      }

      onLeadSubmitted(lead);
      setConfirmedLead(lead);
      setIsSubmitting(false);
      setModalStep(4);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#F9F8F6] w-full max-w-lg border border-[#E5E0D8] rounded-none shadow-none overflow-hidden my-8 text-[#1C1917]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#F2EFE9] border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <span className="uppercase tracking-[0.2em] text-[10px] font-medium text-[#9A7B4F] block mb-1">
              {modalStep === 4 ? 'Bestätigung' : `Schritt ${modalStep} von 3`}
            </span>
            <h3 className="font-serif-luxury text-base sm:text-lg font-medium text-[#1C1917]">
              {selectedPackage === 'paket-a' ? 'Paket A: Full-Service-Flatrate (119 € / Mt.)' : 'Paket B: Logistik-Autopilot (79 € / Mt.)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#57534E] hover:text-[#1C1917] p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* STEP 1: Abfrage 1: Welche Hemdengröße / Marke trägst du aktuell am liebsten? */}
        {modalStep === 1 && (
          <div className="p-6 sm:p-8">
            <h4 className="font-serif-luxury text-xl font-medium text-[#1C1917] mb-6">
              Welche Hemdengröße / Marke trägst du aktuell am liebsten?
            </h4>

            <div className="space-y-6 mb-8 font-sans">
              
              {/* Kragenweite 38–44 */}
              <div>
                <label className="block uppercase tracking-[0.15em] text-xs font-medium text-[#57534E] mb-2">
                  Kragenweite (38–44)
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {['38', '39', '40', '41', '42', '43', '44'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-2.5 text-center text-sm font-medium border transition-colors cursor-pointer ${
                        size === s
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:border-[#9A7B4F]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schnitt: Slim / Modern / Regular */}
              <div>
                <label className="block uppercase tracking-[0.15em] text-xs font-medium text-[#57534E] mb-2">
                  Passform / Schnitt
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Slim', 'Modern', 'Regular'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`py-2.5 text-center text-sm font-medium border transition-colors cursor-pointer ${
                        fit === f
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:border-[#9A7B4F]'
                      }`}
                    >
                      {f} Fit
                    </button>
                  ))}
                </div>
              </div>

              {/* Eingabefeld/Auswahl für Lieblingsmarke */}
              <div>
                <label className="block uppercase tracking-[0.15em] text-xs font-medium text-[#57534E] mb-2">
                  Lieblingsmarke
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {['Olymp', 'Eton', 'Eterna', 'Seidensticker'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBrand(b);
                        setCustomBrand('');
                      }}
                      className={`py-2 text-center text-xs font-medium border transition-colors cursor-pointer ${
                        brand === b && !customBrand
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:border-[#9A7B4F]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Andere Marke eingeben (optional)"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E5E0D8] text-sm text-[#1C1917] focus:outline-none focus:border-[#9A7B4F] rounded-none"
                />
              </div>

            </div>

            <button
              onClick={handleNextToStep2}
              className="w-full py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-white bg-[#9A7B4F] hover:bg-[#8A6D43] transition-colors cursor-pointer rounded-none active:scale-[0.99]"
            >
              Weiter zu Schritt 2 →
            </button>
          </div>
        )}

        {/* STEP 2: Abfrage 2: Wo wäre dein idealer Übergabeort für den wöchentlichen Tausch? */}
        {modalStep === 2 && (
          <div className="p-6 sm:p-8">
            <h4 className="font-serif-luxury text-xl font-medium text-[#1C1917] mb-6">
              Wo wäre dein idealer Übergabeort für den wöchentlichen Tausch?
            </h4>

            <div className="space-y-4 mb-8 font-sans">
              
              {/* Option 1 */}
              <label
                onClick={() => setDropoff('Privatadresse (Sonntagabend, 18–21 Uhr)')}
                className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors ${
                  dropoff === 'Privatadresse (Sonntagabend, 18–21 Uhr)'
                    ? 'bg-white border-[#9A7B4F]'
                    : 'bg-white border-[#E5E0D8] hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="dropoff-option"
                  checked={dropoff === 'Privatadresse (Sonntagabend, 18–21 Uhr)'}
                  onChange={() => setDropoff('Privatadresse (Sonntagabend, 18–21 Uhr)')}
                  className="mt-1 accent-[#9A7B4F]"
                />
                <div>
                  <span className="font-medium text-[#1C1917] text-sm block">
                    Privatadresse (Sonntagabend, 18–21 Uhr)
                  </span>
                  <span className="text-xs text-[#57534E] mt-1 block">
                    Kontaktlos an deiner Wohnungstür mit unserem wetterfesten Kleidersack & Sicherheitshaken.
                  </span>
                </div>
              </label>

              {/* Option 2 */}
              <label
                onClick={() => setDropoff('Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)')}
                className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors ${
                  dropoff === 'Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)'
                    ? 'bg-white border-[#9A7B4F]'
                    : 'bg-white border-[#E5E0D8] hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="dropoff-option"
                  checked={dropoff === 'Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)'}
                  onChange={() => setDropoff('Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)')}
                  className="mt-1 accent-[#9A7B4F]"
                />
                <div>
                  <span className="font-medium text-[#1C1917] text-sm block">
                    Büro / Kanzlei-Empfang (Montagmorgen bis 09:00 Uhr)
                  </span>
                  <span className="text-xs text-[#57534E] mt-1 block">
                    Montagmorgen pünktlich an die Garderobe oder den Empfang deiner Kanzlei/Firma geliefert.
                  </span>
                </div>
              </label>

            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className="w-1/3 py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-[#57534E] bg-white border border-[#E5E0D8] hover:bg-slate-50 transition-colors cursor-pointer rounded-none"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={handleNextToStep3}
                className="w-2/3 py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-white bg-[#9A7B4F] hover:bg-[#8A6D43] transition-colors cursor-pointer rounded-none"
              >
                Weiter zu Schritt 3 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Abschluss-Schritt (Warteliste) */}
        {modalStep === 3 && (
          <div className="p-6 sm:p-8 font-sans">
            
            <div className="mb-6">
              <h4 className="font-serif-luxury text-xl sm:text-2xl font-medium text-[#1C1917] mb-2">
                Fast geschafft! Wir starten nächsten Monat die neue Route in deiner Postleitzahl.
              </h4>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                Trag deine Postleitzahl und E-Mail-Adresse ein, um dir einen der 50 Pilotplätze inklusive <strong className="font-semibold text-[#1C1917]">50 % Rabatt im ersten Probemonat</strong> unverbindlich zu reservieren.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block uppercase tracking-[0.15em] text-xs font-medium text-[#57534E] mb-1.5">
                  PLZ
                </label>
                <input
                  type="text"
                  required
                  placeholder="z. B. 70173 oder 70192"
                  maxLength={5}
                  value={plz}
                  onChange={(e) => setPlz(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 bg-white border border-[#E5E0D8] text-sm text-[#1C1917] focus:outline-none focus:border-[#9A7B4F] rounded-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-[0.15em] text-xs font-medium text-[#57534E] mb-1.5">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@kanzlei-beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E5E0D8] text-sm text-[#1C1917] focus:outline-none focus:border-[#9A7B4F] rounded-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-[0.15em] text-xs font-medium text-[#57534E] mb-1.5">
                  Telefonnummer (optional für Rückfragen)
                </label>
                <input
                  type="tel"
                  placeholder="+49 170 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E5E0D8] text-sm text-[#1C1917] focus:outline-none focus:border-[#9A7B4F] rounded-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalStep(2)}
                  className="w-1/3 py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-[#57534E] bg-white border border-[#E5E0D8] hover:bg-slate-50 transition-colors cursor-pointer rounded-none"
                >
                  ← Zurück
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-white bg-[#9A7B4F] hover:bg-[#8A6D43] transition-colors cursor-pointer rounded-none disabled:opacity-60"
                >
                  {isSubmitting ? 'Wird reserviert...' : 'Pilotplatz unverbindlich sichern'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STEP 4: Bestätigungs-Screen */}
        {modalStep === 4 && confirmedLead && (
          <div className="p-8 sm:p-10 text-center font-sans">
            <div className="w-12 h-12 bg-[#9A7B4F]/15 text-[#9A7B4F] border border-[#9A7B4F]/30 flex items-center justify-center mx-auto mb-6">
              <Check className="w-6 h-6 stroke-[2]" />
            </div>

            <h4 className="font-serif-luxury text-2xl font-medium text-[#1C1917] mb-3">
              Pilotplatz erfolgreich reserviert!
            </h4>
            <p className="text-sm text-[#57534E] mb-6 leading-relaxed">
              Vielen Dank. Dein unverbindlicher Pilotplatz für PLZ <strong>{confirmedLead.plz}</strong> inklusive <strong>50 % Rabatt im ersten Probemonat</strong> wurde erfasst.
            </p>

            <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-5 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-[#E5E0D8] pb-2">
                <span className="text-[#57534E]">Reservierungs-ID:</span>
                <span className="font-mono font-semibold text-[#1C1917]">{confirmedLead.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Gewähltes Modell:</span>
                <span className="font-medium text-[#1C1917]">{confirmedLead.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Größe & Schnitt:</span>
                <span className="text-[#1C1917]">{confirmedLead.preferences.size} · {confirmedLead.preferences.fit} Fit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Übergabe:</span>
                <span className="text-[#1C1917]">{confirmedLead.preferences.dropoffLocation.split('(')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">E-Mail-Bestätigung:</span>
                <span className="text-[#1C1917]">{confirmedLead.email}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-[#1C1917] bg-[#F2EFE9] border border-[#E5E0D8] hover:bg-white transition-colors cursor-pointer rounded-none"
            >
              Schließen
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
