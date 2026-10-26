import React from 'react';
import { ShieldCheck, Shirt, Clock } from 'lucide-react';

interface HeroProps {
  onOpenHero: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenHero }) => {
  return (
    <section
      id="top"
      data-screen-label="Hero"
      className="bg-[#0B111E] text-[#F9F8F6] pt-[clamp(136px,14vw,176px)] pb-[clamp(96px,10vw,128px)] border-b border-white/[0.08] overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 grid grid-cols-1 min-[900px]:grid-cols-2 gap-[clamp(56px,7vw,96px)] items-center">
        
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start w-full">
          <span className="inline-block border border-[#9A7B4F]/50 py-[6px] sm:py-[7px] px-3 sm:px-3.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] sm:tracking-[0.22em] text-[#9A7B4F] mb-6 sm:mb-9 font-jakarta">
            EXKLUSIVER PILOTSTART IN STUTTGART
          </span>

          <h1 className="font-cormorant font-medium text-[clamp(32px,5.4vw,64px)] leading-[1.1] tracking-[-0.01em] mb-5 sm:mb-7 text-balance">
            Jeden Montagmorgen fünf <em className="italic text-[#D9C3A0]">makellos gebügelte</em> Hemden im Schrank.
          </h1>

          <p className="text-[16px] sm:text-[18px] leading-[1.65] text-[#D6D3D1] mb-8 sm:mb-11 max-w-[560px] font-jakarta">
            Der erste vollautomatische Hemden-Autopilot für Partner, Berater und Führungskräfte in Stuttgart. Wir tauschen jeden Sonntagabend kontaktlos an Ihrer Tür – oder montags am Empfang Ihrer Kanzlei – fünf getragene gegen fünf frisch aufbereitete Business-Hemden.
          </p>

          <button
            onClick={onOpenHero}
            className="w-full sm:w-auto inline-flex items-center justify-center text-center gap-3 py-4 sm:py-[18px] px-6 sm:px-8 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[11px] sm:text-[12px] font-semibold tracking-[0.08em] sm:tracking-[0.12em] uppercase cursor-pointer mb-10 sm:mb-12 hover:bg-[#866941] transition-colors min-h-[48px]"
          >
            Wunsch-Modell &amp; PLZ prüfen →
          </button>

          {/* Trust-Leiste */}
          <div className="w-full pt-6 sm:pt-7 border-t border-[#F9F8F6]/12 flex flex-wrap gap-x-8 gap-y-3.5 text-[12px] sm:text-[13px] text-[#F9F8F6]/88 font-jakarta">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-[18px] h-[18px] text-[#9A7B4F] shrink-0 stroke-[1.5]" />
              <span>100 % Kontaktloser Tausch</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Shirt className="w-[18px] h-[18px] text-[#9A7B4F] shrink-0 stroke-[1.5]" />
              <span>Hängend geliefert (Keine Legebrüche)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-[18px] h-[18px] text-[#9A7B4F] shrink-0 stroke-[1.5]" />
              <span>Monatlich flexibel pausier- &amp; kündbar</span>
            </div>
          </div>
        </div>

        {/* Right Column: Fixed Hero Image Visual */}
        <div className="relative pb-4 sm:pb-8 pl-0 sm:pl-8 mt-4 sm:mt-0 w-full">
          <div className="relative aspect-[4/5] w-full border border-[#9A7B4F]/30 bg-[#141B2B] overflow-hidden shadow-2xl">
            <img
              src="/assets/aistudio/Luxuri_se_ETON-Hemden_im_Kleiderschrank_f5851551.png"
              onError={(e) => {
                e.currentTarget.src = '/hero-shirts.png';
              }}
              alt="Fünf luxuriöse ETON Business-Hemden auf dunklen Holzbügeln im Schrank – Frisch aufbereitet für die Arbeitswoche"
              className="w-full h-full object-cover object-top select-none"
              loading="eager"
              decoding="async"
              draggable={false}
            />
            {/* Subtle atmospheric vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B111E]/75 via-transparent to-[#0B111E]/15 pointer-events-none" />
          </div>

          {/* Overlapping Quote Badge (Pinned to bottom-left corner on desktop, clear on mobile) */}
          <div className="sm:absolute relative sm:left-0 sm:bottom-0 mt-3 sm:mt-0 max-w-full sm:max-w-[300px] bg-[#0B111E] border border-[#9A7B4F]/40 p-4 sm:p-5 pointer-events-none z-10 shadow-2xl">
            <p className="m-0 font-cormorant italic font-medium text-[17px] sm:text-[20px] leading-[1.3] text-[#F9F8F6]">
              „0 Minuten Zeitaufwand pro Woche. Kein Buchen. Kein Kassenzettel.“
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

