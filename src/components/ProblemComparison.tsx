import React from 'react';

export const ProblemComparison: React.FC = () => {
  return (
    <section id="vorteile" className="py-24 lg:py-32 bg-[#F9F8F6] border-b border-[#E5E0D8]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-[#1C1917] tracking-tight leading-tight mb-5">
            Deine Zeit ist zu teuer für Öffnungszeiten und Paketstationen.
          </h2>
          <p className="text-[#57534E] text-base sm:text-lg leading-relaxed font-sans">
            Du trägst fünf Tage die Woche Weiß oder Hellblau. Bisher hattest du drei Optionen – und jede davon kostet dich Nerven:
          </p>
        </div>

        {/* Strukturierte Vergleichstabelle / 3-spaltiges Grid mit feinen 1px-Rahmenlinien (#E5E0D8) */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] mb-12 overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 bg-[#F2EFE9] border-b border-[#E5E0D8] text-xs uppercase tracking-[0.15em] text-[#57534E] font-medium">
            <div className="col-span-5 p-5 border-r border-[#E5E0D8]">
              Die alten Optionen
            </div>
            <div className="col-span-7 p-5">
              Warum sie im Arbeitsalltag scheitern
            </div>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#E5E0D8] p-6 md:p-0">
            <div className="col-span-5 md:p-6 md:border-r border-[#E5E0D8] flex items-center">
              <h3 className="font-serif-luxury text-lg md:text-xl font-medium text-[#1C1917]">
                1. Selbst waschen & bügeln
              </h3>
            </div>
            <div className="col-span-7 md:p-6 mt-2 md:mt-0 flex items-center">
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans">
                Kostet dich jeden Sonntag wertvolle Freizeit. Ein Hemd perfekt zu bügeln dauert 8 Minuten – macht über 3 Stunden Lebenszeit pro Monat.
              </p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#E5E0D8] p-6 md:p-0">
            <div className="col-span-5 md:p-6 md:border-r border-[#E5E0D8] flex items-center">
              <h3 className="font-serif-luxury text-lg md:text-xl font-medium text-[#1C1917]">
                2. Die lokale Reinigung
              </h3>
            </div>
            <div className="col-span-7 md:p-6 mt-2 md:mt-0 flex items-center">
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans">
                Du musst vor 18:30 Uhr dort sein, Parkplätze suchen, Kassenzettel aufbewahren und samstags wieder hin. Vergisst du es, stehst du montags ohne Hemd da.
              </p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 md:p-0">
            <div className="col-span-5 md:p-6 md:border-r border-[#E5E0D8] flex items-center">
              <h3 className="font-serif-luxury text-lg md:text-xl font-medium text-[#1C1917]">
                3. Paket-Reinigungsdienste
              </h3>
            </div>
            <div className="col-span-7 md:p-6 mt-2 md:mt-0 flex items-center">
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-sans">
                Hemden kommen gefaltet im Pappkarton zurück – inklusive unschöner Legebrüche. Und den Karton musst du trotzdem selbst zur Packstation schleppen.
              </p>
            </div>
          </div>

        </div>

        {/* Kontrast-Satz (hervorgehoben unter der Tabelle) */}
        <div className="bg-[#F2EFE9] border border-[#E5E0D8] p-8 sm:p-10 text-center">
          <p className="text-[#1C1917] text-base sm:text-lg leading-relaxed font-sans">
            <strong className="font-bold text-[#1C1917]">Unser Prinzip: Einmal einrichten, nie wieder daran denken.</strong>{' '}
            Kein Buchen von Einzelfahrten, kein Mindestbestellwert-Rechnen, kein Kassenzettel.
          </p>
        </div>

      </div>
    </section>
  );
};
