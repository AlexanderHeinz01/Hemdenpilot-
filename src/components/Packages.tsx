import React from 'react';
import { PackageType } from '../types';

interface PackagesProps {
  onSelectPackage: (pkg: PackageType) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  return (
    <section id="pakete" className="py-24 lg:py-32 bg-[#F9F8F6] border-b border-[#E5E0D8]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="uppercase tracking-[0.2em] text-xs font-medium text-[#9A7B4F] block mb-3">
            Modellvergleich
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-[#1C1917] tracking-tight">
            Wähle dein Modell für den Pilotstart
          </h2>
        </div>

        {/* Zwei nebeneinanderstehende Premium-Karten */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          
          {/* PAKET B (Helles #FFFFFF mit feinem Rahmen) */}
          <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-8 sm:p-10 flex flex-col justify-between transition-all duration-200">
            <div>
              {/* Header */}
              <div className="pb-6 border-b border-[#E5E0D8] mb-8">
                <span className="uppercase tracking-[0.2em] text-xs font-medium text-[#57534E] block mb-2">
                  Deine eigenen Hemden
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#1C1917] mb-2">
                  PAKET B: Der Logistik-Autopilot
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed font-sans">
                  Du liebst deine eigenen Hemden, willst aber nie wieder waschen, bügeln oder zur Reinigung fahren.
                </p>
              </div>

              {/* Price */}
              <div className="pb-6 border-b border-[#E5E0D8] mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif-luxury text-4xl sm:text-5xl font-medium text-[#1C1917] tabular-nums">
                    79 €
                  </span>
                  <span className="text-sm font-medium text-[#57534E]">
                    / Monat (inkl. MwSt. & aller Kurierfahrten)
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-6 text-sm text-[#1C1917] mb-10 font-sans">
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-[#57534E] mb-1 font-medium">
                    Die Hemden
                  </div>
                  <p className="text-sm text-[#1C1917] leading-relaxed">
                    Du gibst <strong className="font-semibold">15 deiner eigenen Hemden</strong> in unseren Rotations-Kreislauf.
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-[#57534E] mb-1 font-medium">
                    Wöchentlicher Service
                  </div>
                  <p className="text-sm text-[#1C1917] leading-relaxed">
                    Jeden Sonntag/Montag: <strong className="font-semibold">5 frisch gebügelte Hemden</strong> hängend geliefert, 5 getragene abgeholt.
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-[#57534E] mb-1 font-medium">
                    Verschleiß & Garantie
                  </div>
                  <p className="text-sm text-[#1C1917] leading-relaxed">
                    Kostenloser Knopf-Nähservice inklusive.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onSelectPackage('paket-b')}
              className="w-full py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-[#1C1917] bg-transparent border border-[#1C1917] hover:bg-[#1C1917] hover:text-[#F9F8F6] transition-all duration-200 cursor-pointer rounded-none active:scale-[0.99]"
            >
              Paket B (Eigene Hemden) wählen
            </button>
          </div>

          {/* PAKET A (Dunkles #0F172A mit Messing-Akzent #9A7B4F) */}
          <div className="bg-[#0F172A] border border-[#9A7B4F]/40 p-8 sm:p-10 text-[#F9F8F6] flex flex-col justify-between relative shadow-none">
            
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 right-0 border-b border-l border-[#9A7B4F]/40 bg-[#9A7B4F]/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-[#9A7B4F]">
              Inklusive Premium-Hemden
            </div>

            <div>
              {/* Header */}
              <div className="pb-6 border-b border-[#E5E0D8]/15 mb-8">
                <span className="uppercase tracking-[0.2em] text-xs font-medium text-[#9A7B4F] block mb-2">
                  Full-Service
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#F9F8F6] mb-2">
                  PAKET A: Die Full-Service-Flatrate
                </h3>
                <p className="text-sm text-[#F9F8F6]/80 leading-relaxed font-sans">
                  Du willst dich um gar nichts mehr kümmern – weder um den Hemdenkauf noch um Verschleiß oder Pflege.
                </p>
              </div>

              {/* Price */}
              <div className="pb-6 border-b border-[#E5E0D8]/15 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif-luxury text-4xl sm:text-5xl font-medium text-[#F9F8F6] tabular-nums">
                    119 €
                  </span>
                  <span className="text-sm font-medium text-[#F9F8F6]/70">
                    / Monat (inkl. MwSt., Hemden & Kurierfahrten)
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-6 text-sm text-[#F9F8F6] mb-10 font-sans">
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-[#9A7B4F] mb-1 font-medium">
                    Die Hemden
                  </div>
                  <p className="text-sm text-[#F9F8F6]/90 leading-relaxed">
                    Wir stellen dir <strong className="font-semibold text-white">15 neue Marken-Hemden</strong> (100 % Baumwolle, bügelleicht, Weiß & Hellblau) in deiner exakten Passform – <strong className="font-semibold text-[#9A7B4F]">exklusiv für dich reserviert & codiert (kein offener Fremd-Pool)</strong>.
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-[#9A7B4F] mb-1 font-medium">
                    Wöchentlicher Service
                  </div>
                  <p className="text-sm text-[#F9F8F6]/90 leading-relaxed">
                    Jeden Sonntag/Montag: <strong className="font-semibold text-white">5 frisch gebügelte Hemden</strong> hängend geliefert, 5 getragene abgeholt.
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-[#9A7B4F] mb-1 font-medium">
                    Verschleiß & Garantie
                  </div>
                  <p className="text-sm text-[#F9F8F6]/90 leading-relaxed">
                    <strong className="font-semibold text-white">Verschleiß-Flatrate:</strong> Ausgefranste Manschetten oder Flecken? Wir tauschen das Hemd kostenlos gegen ein neues aus.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onSelectPackage('paket-a')}
              className="w-full py-4 text-center font-sans font-medium text-xs uppercase tracking-[0.15em] text-white bg-[#9A7B4F] hover:bg-[#8A6D43] border border-[#9A7B4F] transition-all duration-200 cursor-pointer rounded-none active:scale-[0.99]"
            >
              Paket A (Inkl. Hemden) wählen
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
