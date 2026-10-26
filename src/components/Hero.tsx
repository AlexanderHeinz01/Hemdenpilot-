import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Shirt, Clock, Image as ImageIcon, Upload, X } from 'lucide-react';

interface HeroProps {
  onOpenHero: () => void;
}

const STORAGE_KEY = 'hemdenpilot_hero_image';

export const Hero: React.FC<HeroProps> = ({ onOpenHero }) => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate image from localStorage or check for public image assets
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHeroImage(stored);
        return;
      }
    } catch {
      // Ignore localStorage errors
    }

    // Check if an image file was placed in /hero-shirts.jpg or /assets/hero-shirts.jpg
    const testImg = new Image();
    testImg.onload = () => {
      setHeroImage('/hero-shirts.jpg');
    };
    testImg.src = '/hero-shirts.jpg';
  }, []);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setHeroImage(result);
        try {
          localStorage.setItem(STORAGE_KEY, result);
        } catch {
          // LocalStorage quota may be exceeded for large images
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroImage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <section
      id="top"
      data-screen-label="Hero"
      className="bg-[#0B111E] text-[#F9F8F6] pt-[clamp(136px,14vw,176px)] pb-[clamp(96px,10vw,128px)] border-b border-white/[0.08] overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 grid grid-cols-1 min-[900px]:grid-cols-2 gap-[clamp(56px,7vw,96px)] items-center">
        
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start">
          <span className="inline-block border border-[#9A7B4F]/50 py-[7px] px-3.5 text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-9 font-jakarta">
            EXKLUSIVER PILOTSTART IN STUTTGART
          </span>

          <h1 className="font-cormorant font-medium text-[clamp(40px,5.4vw,64px)] leading-[1.1] tracking-[-0.01em] mb-7 text-balance">
            Jeden Montagmorgen fünf <em className="italic text-[#D9C3A0]">makellos gebügelte</em> Hemden im Schrank.
          </h1>

          <p className="text-[18px] leading-[1.65] text-[#D6D3D1] mb-11 max-w-[560px] font-jakarta">
            Der erste vollautomatische Hemden-Autopilot für Partner, Berater und Führungskräfte in Stuttgart. Wir tauschen jeden Sonntagabend kontaktlos an Ihrer Tür – oder montags am Empfang Ihrer Kanzlei – fünf getragene gegen fünf frisch aufbereitete Business-Hemden.
          </p>

          <button
            onClick={onOpenHero}
            className="inline-flex items-center gap-3 py-[18px] px-8 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[12px] font-semibold tracking-[0.12em] uppercase cursor-pointer mb-12 hover:bg-[#866941] transition-colors"
          >
            Wunsch-Modell &amp; PLZ prüfen →
          </button>

          {/* Trust-Leiste */}
          <div className="w-full pt-7 border-t border-[#F9F8F6]/12 flex flex-wrap gap-x-8 gap-y-4 text-[13px] text-[#F9F8F6]/88 font-jakarta">
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

        {/* Right Column: Visual / Image Slot Showcase */}
        <div className="relative pb-8 pl-8">
          <div
            className={`relative aspect-[4/5] w-full border-l border-[#9A7B4F]/35 bg-[#141B2B] overflow-hidden transition-colors ${
              isDragging ? 'ring-2 ring-[#9A7B4F] bg-[#1a2338]' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Hidden file input for file browsing */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleInputChange}
              className="hidden"
            />

            {heroImage ? (
              /* Filled State: Active Image */
              <div className="relative w-full h-full group">
                <img
                  src={heroImage}
                  alt="5 gestärkte weiße & hellblaue Hemden auf dunklen Walnussholzbügeln, warmes Licht"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
                
                {/* Subtle top-right hover controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Bild ersetzen"
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-[#0B111E]/85 backdrop-blur text-white text-[11px] font-jakarta font-medium border border-white/15 hover:border-[#9A7B4F] hover:text-[#9A7B4F] transition-all cursor-pointer rounded-none"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ersetzen</span>
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    title="Bild entfernen"
                    className="p-1.5 bg-[#0B111E]/85 backdrop-blur text-white/70 hover:text-white text-[11px] border border-white/15 hover:border-red-400/50 transition-all cursor-pointer rounded-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Empty State: Quiet Luxury Dashed Placeholder */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer group select-none"
              >
                {/* Dashed frame border */}
                <div
                  className={`absolute inset-4 border border-dashed transition-colors duration-200 pointer-events-none ${
                    isDragging
                      ? 'border-[#9A7B4F] bg-[#9A7B4F]/10'
                      : 'border-white/15 group-hover:border-[#9A7B4F]/50'
                  }`}
                />

                <div className="relative z-10 flex flex-col items-center max-w-[320px] px-4">
                  <ImageIcon className="w-8 h-8 text-[#D6D3D1] opacity-45 mb-4 group-hover:opacity-75 transition-opacity stroke-[1.5]" />
                  <p className="font-jakarta text-[13px] font-medium leading-[1.4] text-[#D6D3D1]/80 mb-2">
                    Hero-Bild: 5 gestärkte weiße &amp; hellblaue Hemden auf dunklen Walnussholzbügeln, warmes Licht
                  </p>
                  <p className="font-jakarta text-[11px] text-[#D6D3D1]/60 group-hover:text-[#D6D3D1] transition-colors">
                    or <u className="underline underline-offset-2">browse files</u>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Overlapping Quote Badge (Pinned to bottom-left corner) */}
          <div className="absolute left-0 bottom-0 max-w-[300px] bg-[#0B111E] border border-[#9A7B4F]/40 p-5 pointer-events-none z-10 shadow-2xl">
            <p className="m-0 font-cormorant italic font-medium text-[20px] leading-[1.3] text-[#F9F8F6]">
              „0 Minuten Zeitaufwand pro Woche. Kein Buchen. Kein Kassenzettel.“
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
