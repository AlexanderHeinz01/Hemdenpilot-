import React from 'react';

interface HeaderProps {
  spotsFree?: number;
  onNavigate: (id: string, e: React.MouseEvent) => void;
  onGoPakete: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  spotsFree = 14,
  onNavigate,
  onGoPakete,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-[#0B111E]/95 backdrop-blur-md border-b border-white/10 text-[#F9F8F6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Lockup */}
        <a
          href="#top"
          onClick={(e) => onNavigate('top', e)}
          className="flex flex-col gap-0.5 text-[#F9F8F6] shrink-0"
        >
          <span className="font-cormorant text-[18px] sm:text-[20px] font-semibold tracking-[0.12em] sm:tracking-[0.15em] leading-none">
            HEMDENPILOT
          </span>
          <span className="text-[8px] sm:text-[9px] font-medium tracking-[0.16em] sm:tracking-[0.22em] text-[#F9F8F6]/55 font-jakarta">
            EXECUTIVE VALET • STUTTGART
          </span>
        </a>

        {/* Navigation Links (visible >= 1080px) */}
        <nav className="hidden min-[1080px]:flex items-center gap-8 text-[12px] font-medium text-[#F9F8F6]/72 font-jakarta">
          <a
            href="#ablauf"
            onClick={(e) => onNavigate('ablauf', e)}
            className="text-inherit hover:text-[#9A7B4F] transition-colors whitespace-nowrap"
          >
            Das Prinzip
          </a>
          <a
            href="#vergleich"
            onClick={(e) => onNavigate('vergleich', e)}
            className="text-inherit hover:text-[#9A7B4F] transition-colors whitespace-nowrap"
          >
            Leistungsvergleich
          </a>
          <a
            href="#pakete"
            onClick={(e) => onNavigate('pakete', e)}
            className="text-inherit hover:text-[#9A7B4F] transition-colors whitespace-nowrap"
          >
            Modelle &amp; Preise
          </a>
          <a
            href="#team"
            onClick={(e) => onNavigate('team', e)}
            className="text-inherit hover:text-[#9A7B4F] transition-colors whitespace-nowrap"
          >
            Team
          </a>
          <a
            href="#faq"
            onClick={(e) => onNavigate('faq', e)}
            className="text-inherit hover:text-[#9A7B4F] transition-colors whitespace-nowrap"
          >
            FAQ
          </a>
        </nav>

        {/* Right Zone: Pulsing Status & Action */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0 font-jakarta">
          <div className="hidden min-[1080px]:flex items-center gap-2 text-[11px] text-[#F9F8F6]/72 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7B4F] inline-block animate-hp-pulse" />
            <span>
              Pilotphase Stuttgart:{' '}
              <strong className="text-[#F9F8F6] font-semibold">
                {spotsFree} von 50
              </strong>{' '}
              Plätzen frei
            </span>
          </div>

          <button
            onClick={onGoPakete}
            className="py-2 sm:py-2.5 px-3 sm:px-[18px] bg-transparent border border-[#9A7B4F] text-[#F9F8F6] text-[10px] sm:text-[11px] font-semibold tracking-[0.08em] sm:tracking-[0.14em] uppercase cursor-pointer rounded-none hover:bg-[#9A7B4F] transition-colors whitespace-nowrap min-h-[40px] flex items-center justify-center shrink-0"
          >
            Verfügbarkeit prüfen
          </button>
        </div>

      </div>
    </header>
  );
};
