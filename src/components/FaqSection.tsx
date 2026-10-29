import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { PILOT_SPOTS, formatEuro, getPricing } from '../config/pricing';
import { getPriceVariant } from '../services/session';

const buildFaqs = () => {
  const pricingA = getPricing(getPriceVariant(), 'A');
  return [
    {
      q: `Trage ich bei Paket A (${formatEuro(pricingA.monthly)}) Hemden, die vorher ein anderer Kunde anhatte?`,
      a: "Nein, ausgeschlossen. Wir arbeiten nach dem 'Dedicated-Leasing'-Prinzip: Zum Start Ihres Abos weisen wir Ihnen 15 fabrikneue Hemden in Ihrer exakten Kragenweite und Schnittform fest zu, digital per Chip im Etikett erfasst. Sie tragen ausschließlich Ihre persönliche Rotation – wir übernehmen Pflege und den Austausch bei Verschleiß.",
    },
    {
      q: `Wofür ist die einmalige Erstausstattung von ${formatEuro(pricingA.setupFee)} bei Paket A?`,
      a: 'Damit finanzieren wir einen Teil Ihrer 15 fabrikneuen, persönlich zugewiesenen Markenhemden. Bei Paket B mit Ihren eigenen Hemden fällt keine Einrichtungsgebühr an.',
    },
    {
      q: 'Wie funktioniert die Übergabe, wenn ich nicht zu Hause bin?',
      a: 'Vollkommen kontaktlos über unser 2-Sack-Prinzip: Sie erhalten zwei hochwertige, wasserabweisende Kleidersäcke mit Sicherheitshaken für Ihre Wohnungstür. Alternativ übergeben wir an Ihren Concierge, in den Paketraum Ihres Gebäudes oder montags am Empfang Ihres Büros. Den Wochentermin wählen Sie im Konfigurator.',
    },
    {
      q: 'Was passiert bei Urlaub oder längeren Auslandsreisen?',
      a: 'Eine kurze Nachricht per E-Mail oder WhatsApp bis Freitag 12:00 Uhr genügt, und wir pausieren die Rotation für die Folgewoche.',
    },
    {
      q: `Warum ist die Zahl der Pilotplätze auf ${PILOT_SPOTS} begrenzt?`,
      a: 'Um Pünktlichkeit und Bügelqualität ab Tag 1 zu garantieren, starten wir mit wenigen Kunden und bauen die Kurier-Routen schrittweise nach Postleitzahl-Clustern aus. Weitere Stuttgarter Stadtteile folgen, sobald dort genügend Vormerkungen vorliegen.',
    },
  ];
};

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqs = buildFaqs();

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      data-screen-label="FAQ"
      className="bg-[#F9F8F6] py-[clamp(96px,10vw,128px)]"
    >
      <div className="max-w-[880px] mx-auto px-5 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-14">
          <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-[18px] font-jakarta">
            EXECUTIVE FAQ
          </span>
          <h2 className="font-cormorant font-medium text-[clamp(34px,4.2vw,50px)] leading-[1.1] m-0 text-[#18181B]">
            Ihre Fragen, <em className="italic">klar beantwortet</em>
          </h2>
        </div>

        {/* Accordion */}
        <div className="border-t border-[#E5E0D8]">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border-b border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-7 bg-transparent border-0 flex justify-between items-start gap-6 text-left cursor-pointer font-jakarta text-[#18181B] hover:text-[#9A7B4F] transition-colors"
                >
                  <span className="font-cormorant font-semibold text-[clamp(20px,2.2vw,24px)] leading-[1.3] text-inherit">
                    {faq.q}
                  </span>
                  <span className="shrink-0 mt-1 text-[#9A7B4F]">
                    {isOpen ? (
                      <Minus className="w-5 h-5 stroke-[1.5]" />
                    ) : (
                      <Plus className="w-5 h-5 stroke-[1.5]" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <p className="m-0 pr-12 pb-8 text-[15px] leading-[1.75] text-[#57534E] text-pretty font-jakarta">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
