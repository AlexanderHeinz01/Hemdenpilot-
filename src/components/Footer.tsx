import React, { useState } from 'react';
import { X } from 'lucide-react';

const LEGAL_DATA: Record<string, [string, string[]]> = {
  impressum: [
    'Impressum',
    [
      'Hemdenpilot Services GmbH (in Gründung)',
      'Königstraße 26, 70173 Stuttgart',
      'Vertreten durch die Geschäftsführung.',
      'Kontakt: kontakt@hemdenpilot.de · www.hemdenpilot.de · Tel. +49 711 9253 4400',
      'USt-IdNr.: in Beantragung',
    ],
  ],
  datenschutz: [
    'Datenschutz',
    [
      'Wir verarbeiten Ihre Daten (Name, E-Mail, Telefonnummer, PLZ) ausschließlich zur Prüfung der Routenverfügbarkeit und zur Vorbereitung Ihres persönlichen Hemden-Abonnements gemäß Art. 6 Abs. 1 lit. b DSGVO.',
      'Es erfolgt keine Weitergabe an unbefugte Dritte. Sie können der Speicherung Ihrer Daten jederzeit per E-Mail an datenschutz@hemdenpilot.de widersprechen.',
    ],
  ],
  agb: [
    'AGB',
    [
      '1. Geltungsbereich: Diese Bedingungen gelten für alle Lieferungen und Dienstleistungen des Hemdenpilot-Pilotprogramms auf hemdenpilot.de.',
      '2. Leistungsgegenstand: Wöchentlicher kontaktloser Austausch von 5 Business-Hemden an der vereinbarten Privat- oder Firmenadresse.',
      '3. Laufzeit & Kündigung: Monatlich kündbar mit einer Frist von 7 Tagen zum Monatsende. Urlaubswochen können bis Freitag 12:00 Uhr für die Folgewoche pausiert werden.',
      '4. Versicherung: Eigene Hemden in Paket B sind während des gesamten Obhutsprozesses mit bis zu 150 € je Hemd gegen Beschädigung und Verlust versichert.',
    ],
  ],
};

export const Footer: React.FC = () => {
  const [legalKey, setLegalKey] = useState<'impressum' | 'datenschutz' | 'agb' | null>(null);

  const activeLegal = legalKey ? LEGAL_DATA[legalKey] : null;

  return (
    <>
      <footer className="bg-[#0B111E] text-[#F9F8F6]/60 py-16 text-[12px] font-jakarta">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          
          <div className="flex flex-wrap justify-between items-end gap-8 pb-10 border-b border-[#F9F8F6]/10">
            <div className="flex flex-col gap-2.5 max-w-[420px]">
              <span className="font-cormorant text-[22px] font-semibold tracking-[0.15em] text-[#F9F8F6]">
                HEMDENPILOT
              </span>
              <p className="m-0 leading-[1.7]">
                Der kontaktlose wöchentliche Hemdenservice für Führungskräfte, Berater und Partner in Stuttgart.
              </p>
            </div>

            <div className="flex gap-8 text-[11px] font-semibold tracking-[0.16em] uppercase">
              <button
                type="button"
                onClick={() => setLegalKey('impressum')}
                className="bg-transparent border-0 p-0 font-jakarta tracking-[inherit] uppercase text-[#F9F8F6]/72 cursor-pointer hover:text-[#9A7B4F] transition-colors"
              >
                Impressum
              </button>
              <button
                type="button"
                onClick={() => setLegalKey('datenschutz')}
                className="bg-transparent border-0 p-0 font-jakarta tracking-[inherit] uppercase text-[#F9F8F6]/72 cursor-pointer hover:text-[#9A7B4F] transition-colors"
              >
                Datenschutz
              </button>
              <button
                type="button"
                onClick={() => setLegalKey('agb')}
                className="bg-transparent border-0 p-0 font-jakarta tracking-[inherit] uppercase text-[#F9F8F6]/72 cursor-pointer hover:text-[#9A7B4F] transition-colors"
              >
                AGB
              </button>
            </div>
          </div>

          <div className="pt-7 flex flex-wrap justify-between gap-3 text-[10px] tracking-[0.16em] uppercase text-[#F9F8F6]/45">
            <span>
              © {new Date().getFullYear()} Hemdenpilot (hemdenpilot.de). Alle Rechte vorbehalten.
            </span>
            <span>Stuttgart · Executive Valet</span>
          </div>

        </div>
      </footer>

      {/* Legal Modal */}
      {activeLegal && (
        <div
          onClick={() => setLegalKey(null)}
          className="fixed inset-0 z-[60] bg-[#0B111E]/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F9F8F6] border border-[#E5E0D8] max-w-[520px] w-full p-8 text-[#18181B]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E0D8] mb-5">
              <span className="font-cormorant text-[24px] font-semibold">
                {activeLegal[0]}
              </span>
              <button
                type="button"
                onClick={() => setLegalKey(null)}
                className="bg-transparent border-0 p-1 cursor-pointer text-[#57534E] flex"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-[13px] leading-[1.7] text-[#57534E] max-h-[300px] overflow-y-auto font-jakarta">
              {activeLegal[1].map((line, i) => (
                <p key={i} className="m-0">
                  {line}
                </p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E0D8] flex justify-end">
              <button
                type="button"
                onClick={() => setLegalKey(null)}
                className="py-3 px-6 bg-[#0B111E] text-[#F9F8F6] border-0 rounded-none font-jakarta text-[11px] font-semibold tracking-[0.16em] uppercase cursor-pointer hover:bg-[#18181B]"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
