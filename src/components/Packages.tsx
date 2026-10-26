import React from 'react';
import { Check } from 'lucide-react';
import { PackageType } from '../types';

interface PackagesProps {
  onSelectPackage: (pkg: PackageType) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const featuresB = [
    {
      t: 'Wöchentlicher 5er-Tausch:',
      d: 'Jeden Sonntag/Montag 5 frisch gebügelte Hemden hängend geliefert, 5 getragene abgeholt (20 Reinigungen/Monat).',
    },
    {
      t: 'Ihre eigenen Hemden:',
      d: 'Sie geben Ihre bestehenden Hemden in unseren geschlossenen Pflege-Kreislauf.',
    },
    {
      t: 'Inklusive Kleidersack-System:',
      d: '2 hochwertige, wasserabweisende Canvas-Kleidersäcke für den kontaktlosen Tür-Tausch.',
    },
    {
      t: 'Knopf-Garantie:',
      d: 'Lockere oder fehlende Knöpfe werden automatisch ersetzt.',
    },
  ];

  const featuresA = [
    {
      t: '15 neue Marken-Hemden inklusive:',
      d: '100 % zweifädig gewebte Baumwolle (Two-Ply Twill/Poplin, bügelleicht) in Weiß & Hellblau nach Ihrer Wunsch-Passform.',
    },
    {
      t: '100 % Persönliche Zuweisung (Kein Fremd-Pool):',
      d: 'Ihre 15 Hemden werden per Chip im Etikett exklusiv für Sie codiert. Sie tragen niemals das Hemd eines Fremden.',
    },
    {
      t: 'Wöchentlicher 5er-Tausch:',
      d: 'Jeden Sonntag/Montag 5 frisch aufbereitete Hemden geliefert, 5 getragene abgeholt.',
    },
    {
      t: 'Verschleiß-Flatrate inklusive:',
      d: 'Ausgefranste Manschetten durch Armbanduhren oder nicht lösbare Flecken? Wir tauschen das Hemd kostenlos gegen ein neues aus.',
    },
  ];

  return (
    <section
      id="pakete"
      data-screen-label="Pakete"
      className="bg-[#F9F8F6] py-[clamp(96px,10vw,128px)] border-b border-[#E5E0D8]"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        
        {/* Header */}
        <div className="max-w-[720px] mx-auto mb-16 text-center">
          <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-[18px] font-jakarta">
            KONFIGURATION FÜR DEN PILOTSTART
          </span>
          <h2 className="font-cormorant font-medium text-[clamp(34px,4.2vw,50px)] leading-[1.1] m-0 mb-5 text-[#18181B]">
            Wählen Sie Ihr bevorzugtes <em className="italic">Rotations-Modell</em>
          </h2>
          <p className="m-0 text-[16px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
            Beide Modelle beinhalten sämtliche wöchentlichen Kurierfahrten in Stuttgart sowie unsere Knopf- und Kragenpflege. Keine Mindestvertragslaufzeit.
          </p>
        </div>

        {/* 2 Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Paket B */}
          <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-[clamp(32px,4vw,48px)] flex flex-col justify-between">
            <div>
              <span className="self-start inline-block border border-[#E5E0D8] py-1.5 px-3 text-[10px] font-semibold tracking-[0.22em] text-[#57534E] mb-7 font-jakarta">
                EIGENER BESTAND
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-2 font-jakarta">
                PAKET B
              </span>
              <h3 className="font-cormorant font-semibold text-[34px] leading-[1.1] m-0 mb-3.5 text-[#18181B]">
                Der Logistik-Autopilot
              </h3>
              <p className="m-0 mb-7 text-[14px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
                Ideal, wenn Sie bereits 15 perfekte Lieblingshemden im Schrank haben, aber nie wieder waschen, bügeln oder zur Reinigung fahren möchten.
              </p>

              <div className="flex items-baseline flex-wrap gap-2.5 py-6 border-t border-b border-[#E5E0D8] mb-8 font-jakarta">
                <span className="font-cormorant font-medium text-[56px] leading-none text-[#18181B] tabular-nums">
                  79 €
                </span>
                <span className="text-[13px] text-[#57534E]">
                  / Monat (inkl. MwSt. &amp; Kurier)
                </span>
              </div>

              <div className="flex flex-col gap-5 mb-10">
                {featuresB.map((f, i) => (
                  <div key={i} className="flex gap-3.5 items-start">
                    <Check className="w-4 h-4 text-[#9A7B4F] shrink-0 mt-[3px] stroke-[2]" />
                    <p className="m-0 text-[14px] leading-[1.65] text-[#57534E] font-jakarta">
                      <strong className="text-[#18181B] font-semibold">{f.t}</strong> {f.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPackage('B')}
              className="w-full py-[18px] px-4 bg-[#18181B] text-[#FFFFFF] border-0 rounded-none font-jakarta text-[12px] font-semibold tracking-[0.16em] uppercase cursor-pointer hover:bg-[#292524] transition-colors"
            >
              Paket B (Eigene Hemden) wählen →
            </button>
          </div>

          {/* Paket A */}
          <div className="relative bg-[#0B111E] text-[#F9F8F6] border border-[#9A7B4F]/60 p-[clamp(32px,4vw,48px)] flex flex-col justify-between">
            <span className="absolute top-0 right-0 bg-[#9A7B4F] text-[#0B111E] py-[7px] px-3.5 text-[10px] font-semibold tracking-[0.18em] font-jakarta">
              RUNDUM-SORGLOS • KEIN FREMDPOOL
            </span>

            <div>
              <span className="self-start inline-block border border-[#9A7B4F]/50 py-1.5 px-3 text-[10px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-7 font-jakarta">
                INKL. 15 PREMIUM-HEMDEN
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-2 font-jakarta">
                PAKET A
              </span>
              <h3 className="font-cormorant font-semibold text-[34px] leading-[1.1] m-0 mb-3.5 text-[#F9F8F6]">
                Die Executive-Rotation
              </h3>
              <p className="m-0 mb-7 text-[14px] leading-[1.7] text-[#D6D3D1] text-pretty font-jakarta">
                Sie kümmern sich um nichts mehr – weder um den Hemdenkauf noch um Verschleiß, Kragenabrieb oder Pflege.
              </p>

              <div className="flex items-baseline flex-wrap gap-2.5 py-6 border-t border-b border-white/[0.14] mb-8 font-jakarta">
                <span className="font-cormorant font-medium text-[56px] leading-none text-[#F9F8F6] tabular-nums">
                  119 €
                </span>
                <span className="text-[13px] text-[#D6D3D1]">
                  / Monat (inkl. MwSt., Hemden &amp; Kurier)
                </span>
              </div>

              <div className="flex flex-col gap-5 mb-10">
                {featuresA.map((f, i) => (
                  <div key={i} className="flex gap-3.5 items-start">
                    <Check className="w-4 h-4 text-[#9A7B4F] shrink-0 mt-[3px] stroke-[2]" />
                    <p className="m-0 text-[14px] leading-[1.65] text-[#D6D3D1] font-jakarta">
                      <strong className="text-[#F9F8F6] font-semibold">{f.t}</strong> {f.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPackage('A')}
              className="w-full py-[18px] px-4 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[12px] font-semibold tracking-[0.16em] uppercase cursor-pointer hover:bg-[#B08F60] transition-colors"
            >
              Paket A (Inkl. Hemden) wählen →
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
