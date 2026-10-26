import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="ablauf" className="py-24 lg:py-32 bg-[#F2EFE9] border-b border-[#E5E0D8]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="uppercase tracking-[0.2em] text-xs font-medium text-[#9A7B4F] block mb-3">
            Concierge-Ablauf
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-[#1C1917] tracking-tight">
            Auf Autopilot in 3 einfachen Schritten
          </h2>
        </div>

        {/* 3 Spalten mit klarer Nummerierung (1., 2., 3.) in großer Serifenschrift */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Schritt 1 */}
          <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#9A7B4F] mb-6">
                1.
              </div>
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans">
                <strong className="text-[#1C1917] font-semibold">Einmalig Setup wählen:</strong>{' '}
                Du entscheidest, ob du deine eigenen Lieblingshemden in unseren Kreislauf gibst oder dir einen exklusiven Satz neuer Premium-Hemden (Weiß / Hellblau) von uns bereitstellen lässt.
              </p>
            </div>
          </div>

          {/* Schritt 2 */}
          <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#9A7B4F] mb-6">
                2.
              </div>
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans">
                <strong className="text-[#1C1917] font-semibold">Kontaktloser Tausch am festen Wochentag:</strong>{' '}
                Jeden Sonntagabend (oder montags direkt am Empfang deiner Kanzlei/Firma) nimmt unser Kurier deinen blickdichten Kleidersack mit den 5 getragenen Hemden mit und hängt 5 frisch gebügelte Hemden an deinen festen Übergabepunkt. Du musst nicht zu Hause sein.
              </p>
            </div>
          </div>

          {/* Schritt 3 */}
          <div className="bg-[#FFFFFF] border border-[#E5E0D8] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#9A7B4F] mb-6">
                3.
              </div>
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans">
                <strong className="text-[#1C1917] font-semibold">Perfekt durch die Woche:</strong>{' '}
                Knöpfe werden bei Bedarf automatisch nachgenäht, Kragen und Manschetten schonend vorbehandelt.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
