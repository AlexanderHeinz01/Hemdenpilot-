import React from 'react';

interface HeaderProps {
  onScrollToPackages: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollToPackages }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E5E0D8]/10 transition-all">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Brand Wordmark (Savile Row / Concierge Aesthetic) */}
        <a href="#" className="flex items-center gap-2 tracking-[0.2em] uppercase text-sm sm:text-base font-medium text-[#F9F8F6] whitespace-nowrap shrink-0">
          <span className="font-serif-luxury text-lg tracking-[0.15em] font-normal">HEMDENPILOT</span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-[0.15em] text-[#F9F8F6]/70">
          <a href="#vorteile" className="hover:text-[#9A7B4F] transition-colors whitespace-nowrap shrink-0">Problem & Kontrast</a>
          <a href="#ablauf" className="hover:text-[#9A7B4F] transition-colors whitespace-nowrap shrink-0">So funktioniert's</a>
          <a href="#pakete" className="hover:text-[#9A7B4F] transition-colors whitespace-nowrap shrink-0">Paket-Auswahl</a>
          <a href="#faq" className="hover:text-[#9A7B4F] transition-colors whitespace-nowrap shrink-0">FAQ</a>
        </nav>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onScrollToPackages}
            className="px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-medium text-[#F9F8F6] bg-transparent border border-[#9A7B4F] hover:bg-[#9A7B4F] hover:text-white transition-all duration-200 rounded-none cursor-pointer whitespace-nowrap shrink-0"
          >
            Paket-Auswahl
          </button>
        </div>

      </div>
    </header>
  );
};
