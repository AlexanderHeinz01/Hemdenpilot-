import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="ablauf"
      data-screen-label="Ablauf"
      className="bg-[#F2EFE9] py-[clamp(96px,10vw,128px)] border-b border-[#E5E0D8]"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        
        {/* Header */}
        <div className="max-w-[760px] mb-[72px]">
          <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-[18px] font-jakarta">
            DER WÖCHENTLICHE RHYTHMUS
          </span>
          <h2 className="font-cormorant font-medium text-[clamp(34px,4.2vw,50px)] leading-[1.1] m-0 text-[#18181B]">
            Einmal einrichten. <em className="italic">Nie wieder</em> daran denken.
          </h2>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Step I */}
          <div className="border-t border-[#9A7B4F]/45 pt-8">
            <div className="font-cormorant font-medium text-[48px] leading-none text-[#9A7B4F] mb-7">
              I.
            </div>
            <h3 className="font-cormorant font-semibold text-[24px] m-0 mb-3.5 text-[#18181B]">
              Persönliches Setup wählen
            </h3>
            <p className="m-0 text-[15px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
              Sie entscheiden einmalig, ob Sie Ihre eigenen Lieblingshemden in unseren Kreislauf geben oder sich 15 fabrikneue Premium-Hemden (Weiß &amp; Hellblau) exklusiv von uns bereitstellen lassen.
            </p>
          </div>

          {/* Step II */}
          <div className="border-t border-[#9A7B4F]/45 pt-8">
            <div className="font-cormorant font-medium text-[48px] leading-none text-[#9A7B4F] mb-7">
              II.
            </div>
            <h3 className="font-cormorant font-semibold text-[24px] m-0 mb-3.5 text-[#18181B]">
              Kontaktloser Tausch am Fixtag
            </h3>
            <p className="m-0 text-[15px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
              Jeden Sonntagabend (an Ihrer Wohnungstür im blickdichten Canvas-Kleidersack) oder Montagmorgen (am Empfang Ihres Büros) tauschen wir 5 getragene gegen 5 frisch gebügelte Hemden.
            </p>
          </div>

          {/* Step III */}
          <div className="border-t border-[#9A7B4F]/45 pt-8">
            <div className="font-cormorant font-medium text-[48px] leading-none text-[#9A7B4F] mb-7">
              III.
            </div>
            <h3 className="font-cormorant font-semibold text-[24px] m-0 mb-3.5 text-[#18181B]">
              Makellos durch die Arbeitswoche
            </h3>
            <p className="m-0 text-[15px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
              Jedes Hemd wird schonend gewaschen, von Hand nachgebügelt und auf Qualitätsbügeln geliefert. Lockere Knöpfe nähen wir automatisch und kostenlos nach.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
