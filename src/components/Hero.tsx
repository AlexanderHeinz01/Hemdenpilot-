import React from 'react';
import { Check } from 'lucide-react';

interface HeroProps {
  onScrollToPackages: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToPackages }) => {
  return (
    <section className="bg-[#0F172A] text-[#F9F8F6] pt-32 pb-24 lg:pt-40 lg:pb-32 border-b border-[#E5E0D8]/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Conversion */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Badge (oben klein) */}
            <div className="mb-8">
              <span className="uppercase tracking-[0.2em] text-xs font-medium text-[#9A7B4F] border border-[#9A7B4F]/40 px-3.5 py-1.5 inline-block bg-[#0F172A]">
                Exklusiver Pilotstart in Stuttgart – Nur 50 Plätze in den PLZ-Gebieten 701–705
              </span>
            </div>

            {/* Headline (H1) */}
            <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-[3.25rem] font-medium tracking-tight text-[#F9F8F6] leading-[1.18] mb-6">
              Jeden Montagmorgen 5 perfekt gebügelte Hemden im Schrank. Ohne Waschen. Ohne Reinigung. Ohne Zeitverlust.
            </h1>

            {/* Subheadline */}
            <p className="text-[#F9F8F6]/80 text-base sm:text-lg leading-relaxed mb-10 max-w-xl font-sans font-normal">
              Der erste vollautomatische Hemden-Autopilot für Führungskräfte, Berater und Partner in Stuttgart. Wir tauschen jeden Sonntagabend kontaktlos an deiner Tür (oder montags am Büro-Empfang) 5 getragene gegen 5 frisch aufbereitete Business-Hemden.
            </p>

            {/* Primärer CTA-Button (scrollt direkt zur Paket-Auswahl in Sektion 4) */}
            <div className="mb-12 w-full sm:w-auto">
              <button
                onClick={onScrollToPackages}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#9A7B4F] hover:bg-[#8A6D43] text-[#F9F8F6] font-sans font-medium text-sm tracking-wide transition-all duration-200 border border-[#9A7B4F] cursor-pointer rounded-none active:scale-[0.99]"
              >
                <span>Verfügbarkeit & Wunsch-Paket prüfen →</span>
              </button>
            </div>

            {/* Trust-Leiste unter dem Button (3 Bullet-Icons in Messing #9A7B4F) */}
            <div className="w-full pt-8 border-t border-[#E5E0D8]/15 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#9A7B4F] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-[#F9F8F6]/90">
                  <strong className="font-semibold text-[#F9F8F6]">100 % Kontaktloser Tausch</strong> (Kein Warten auf Lieferfahrer)
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[#9A7B4F] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-[#F9F8F6]/90">
                  <strong className="font-semibold text-[#F9F8F6]">Hängend aufbereitet</strong> (Keine Legebrüche aus Versandkartons)
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[#9A7B4F] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-[#F9F8F6]/90">
                  <strong className="font-semibold text-[#F9F8F6]">Monatlich kündbar</strong> (Volle Flexibilität bei Urlaub & Projektpausen)
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Edles Produktbild der 5 hängenden Hemden (Quiet Luxury Darstellung) */}
          <div className="lg:col-span-5">
            <div className="relative border border-[#E5E0D8]/15 bg-[#141E33] p-6 sm:p-8 rounded-none">
              
              {/* Luxury Frame Accent */}
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-[#9A7B4F]/20 pointer-events-none"></div>

              {/* Title / Spec Label */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]/10 text-xs text-[#9A7B4F] tracking-[0.2em] uppercase font-medium">
                <span>Wochen-Rotation</span>
                <span>5 Hemden · Hängend</span>
              </div>

              {/* Graphical Bespoke Shirts Visualizer (5 Pressed Shirts on Walnut Hangers) */}
              <div className="py-8 space-y-3">
                {[
                  { color: 'Reinweiß', type: 'Two-Ply Vollzwirn', tone: 'bg-white text-slate-800' },
                  { color: 'Hellblau', type: 'Feiner Twill', tone: 'bg-[#E3EDF7] text-slate-800' },
                  { color: 'Reinweiß', type: 'Royal Oxford', tone: 'bg-white text-slate-800' },
                  { color: 'Hellblau', type: 'Feinstruktur', tone: 'bg-[#E3EDF7] text-slate-800' },
                  { color: 'Reinweiß', type: 'Popeline bügelleicht', tone: 'bg-white text-slate-800' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-[#0F172A] border border-[#E5E0D8]/10 transition-all hover:border-[#9A7B4F]/50"
                  >
                    <div className="flex items-center gap-3">
                      {/* Brass Hanger Hook Indicator */}
                      <span className="w-1.5 h-1.5 rounded-none bg-[#9A7B4F]"></span>
                      <span className="font-serif-luxury text-sm font-medium text-[#F9F8F6]">
                        Hemd 0{idx + 1}
                      </span>
                      <span className="text-xs text-[#F9F8F6]/50">· {item.color}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#9A7B4F] tracking-wider uppercase font-medium">
                        Schrankfertig
                      </span>
                      <span className="w-2 h-2 border border-[#9A7B4F] bg-[#9A7B4F]/20"></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Caption */}
              <div className="pt-4 border-t border-[#E5E0D8]/10 flex items-center justify-between text-xs text-[#F9F8F6]/60">
                <span>Massivholzbügel & Staubschutz</span>
                <span className="text-[#9A7B4F] font-medium">Sonntag 20:00 Uhr</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
