import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Trage ich bei Paket A Hemden, die vorher ein Fremder anhatte?',
    a: 'Nein. Zum Start deines Abos weisen wir dir 15 fabrikneue Premium-Hemden in deiner Kragenweite und Schnittform fest zu (digital per Chip im Etikett erfasst). Du trägst ausschließlich deine persönliche Rotation – nur dass wir Anschaffung, Pflege und den Austausch bei Verschleiß übernehmen.'
  },
  {
    q: 'Wie funktioniert die Übergabe, wenn ich sonntags nicht zu Hause bin?',
    a: 'Du erhältst von uns zwei hochwertige, wasserabweisende Kleidersäcke mit Sicherheitshaken für deine Wohnungstür (oder wir vereinbaren einen trockenen Ablageort bzw. die Abgabe am Empfang deines Büros).'
  },
  {
    q: 'Was passiert, wenn ich im Urlaub oder auf Geschäftsreise bin?',
    a: 'Per Klick in deinem Kundenkonto oder kurzer WhatsApp-Nachricht bis Freitag 12:00 Uhr pausierst du die Lieferung für die Folgewoche.'
  }
];

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#F9F8F6] border-b border-[#E5E0D8]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="uppercase tracking-[0.2em] text-xs font-medium text-[#9A7B4F] block mb-3">
            Transparenz & Details
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-[#1C1917] tracking-tight">
            Häufig gestellte Fragen
          </h2>
        </div>

        {/* Minimalistisches Akkordeon mit feinen horizontalen 1px-Trennlinien (#E5E0D8) */}
        <div className="border-t border-[#E5E0D8]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border-b border-[#E5E0D8]">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-6 sm:py-8 text-left flex items-start justify-between gap-6 cursor-pointer group"
                >
                  <span className="font-serif-luxury text-lg sm:text-xl font-medium text-[#1C1917] group-hover:text-[#9A7B4F] transition-colors leading-snug">
                    {faq.q}
                  </span>
                  <span className="text-[#9A7B4F] shrink-0 mt-1">
                    {isOpen ? (
                      <Minus className="w-5 h-5 stroke-[1.5]" />
                    ) : (
                      <Plus className="w-5 h-5 stroke-[1.5]" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-8 text-sm sm:text-base text-[#57534E] leading-relaxed font-sans pr-8">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
