import React from 'react';

export const ProblemComparison: React.FC = () => {
  return (
    <section
      id="vergleich"
      data-screen-label="Problem"
      className="bg-[#F9F8F6] py-[clamp(96px,10vw,128px)] border-b border-[#E5E0D8]"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        
        {/* Header */}
        <div className="max-w-[760px] mb-16">
          <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-[18px] font-jakarta">
            WARUM BESTEHENDE LÖSUNGEN SCHEITERN
          </span>
          <h2 className="font-cormorant font-medium text-[clamp(34px,4.2vw,50px)] leading-[1.1] m-0 text-[#18181B] text-balance">
            Ihre Zeit ist zu kostbar für Öffnungszeiten und Paketstationen.
          </h2>
        </div>

        {/* 3-Column Grid with Hairlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E0D8] border border-[#E5E0D8]">
          
          {/* Card 01 */}
          <div className="bg-[#FFFFFF] p-[clamp(32px,4vw,48px)] flex flex-col gap-5">
            <span className="font-cormorant text-[22px] text-[#9A7B4F]">01</span>
            <h3 className="font-cormorant font-semibold text-[26px] leading-[1.2] m-0 text-[#18181B]">
              Selbst waschen &amp; bügeln
            </h3>
            <p className="m-0 text-[15px] leading-[1.7] text-[#57534E] flex-1 text-pretty font-jakarta">
              Ein Hemd perfekt zu bügeln kostet 8 Minuten. Bei 20 Hemden im Monat opfern Sie über 3 Stunden Ihrer Wochenend-Freizeit am Bügelbrett.
            </p>
            <div className="pt-[18px] border-t border-[#E5E0D8] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#18181B] flex items-center gap-2.5 font-jakarta">
              <span className="w-4 h-px bg-[#9A7B4F] inline-block" />
              ~ 3,5 Std. Zeitverlust / Monat
            </div>
          </div>

          {/* Card 02 */}
          <div className="bg-[#FFFFFF] p-[clamp(32px,4vw,48px)] flex flex-col gap-5">
            <span className="font-cormorant text-[22px] text-[#9A7B4F]">02</span>
            <h3 className="font-cormorant font-semibold text-[26px] leading-[1.2] m-0 text-[#18181B]">
              Die lokale Reinigung
            </h3>
            <p className="m-0 text-[15px] leading-[1.7] text-[#57534E] flex-1 text-pretty font-jakarta">
              Parkplatzsuche vor 18:30 Uhr, Kassenzettel aufbewahren und samstags wieder abholen. Vergessen Sie es einmal, fehlt am Montagmorgen das frische Hemd.
            </p>
            <div className="pt-[18px] border-t border-[#E5E0D8] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#18181B] flex items-center gap-2.5 font-jakarta">
              <span className="w-4 h-px bg-[#9A7B4F] inline-block" />
              8 Wege &amp; Terminstress / Monat
            </div>
          </div>

          {/* Card 03 */}
          <div className="bg-[#FFFFFF] p-[clamp(32px,4vw,48px)] flex flex-col gap-5">
            <span className="font-cormorant text-[22px] text-[#9A7B4F]">03</span>
            <h3 className="font-cormorant font-semibold text-[26px] leading-[1.2] m-0 text-[#18181B]">
              Paket-Versanddienste
            </h3>
            <p className="m-0 text-[15px] leading-[1.7] text-[#57534E] flex-1 text-pretty font-jakarta">
              Hemden kommen gefaltet im Pappkarton zurück – inklusive unschöner Legebrüche auf der Brust. Den Karton müssen Sie trotzdem selbst zur Packstation bringen.
            </p>
            <div className="pt-[18px] border-t border-[#E5E0D8] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#18181B] flex items-center gap-2.5 font-jakarta">
              <span className="w-4 h-px bg-[#9A7B4F] inline-block" />
              Legebrüche &amp; Paket-Aufwand
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
