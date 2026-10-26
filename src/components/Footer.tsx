import React, { useState } from 'react';
import { X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [legalModal, setLegalModal] = useState<'impressum' | 'datenschutz' | 'agb' | null>(null);

  return (
    <>
      <footer className="py-16 bg-[#0F172A] border-t border-[#E5E0D8]/15 text-xs text-[#F9F8F6]/60 font-sans">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#E5E0D8]/10">
            <div>
              <span className="font-serif-luxury text-xl font-normal tracking-[0.15em] text-[#F9F8F6] uppercase block">
                HEMDENPILOT
              </span>
              <p className="text-[#F9F8F6]/60 text-xs mt-2 max-w-md leading-relaxed">
                Der kontaktlose wöchentliche Hemdenservice für Führungskräfte, Berater und Partner in Stuttgart.
              </p>
            </div>

            <div className="flex items-center gap-8 text-xs uppercase tracking-[0.15em] font-medium text-[#F9F8F6]/70">
              <button
                onClick={() => setLegalModal('impressum')}
                className="hover:text-[#9A7B4F] transition-colors cursor-pointer"
              >
                Impressum
              </button>
              <button
                onClick={() => setLegalModal('datenschutz')}
                className="hover:text-[#9A7B4F] transition-colors cursor-pointer"
              >
                Datenschutz
              </button>
              <button
                onClick={() => setLegalModal('agb')}
                className="hover:text-[#9A7B4F] transition-colors cursor-pointer"
              >
                AGB
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#F9F8F6]/40 uppercase tracking-[0.15em]">
            <div>© {new Date().getFullYear()} Hemdenpilot (hemdenpilot.de). Alle Rechte vorbehalten.</div>
            <div>Stuttgart · Savile Row Ästhetik & Concierge-Service</div>
          </div>

        </div>
      </footer>

      {/* Legal Modal (Quiet Luxury Style) */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#F9F8F6] max-w-lg w-full border border-[#E5E0D8] p-8 shadow-none text-[#1C1917] rounded-none">
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E0D8] mb-6">
              <h4 className="font-serif-luxury text-xl font-medium capitalize text-[#1C1917]">{legalModal}</h4>
              <button
                onClick={() => setLegalModal(null)}
                className="text-[#57534E] hover:text-[#1C1917] p-1 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="text-xs text-[#57534E] space-y-4 max-h-72 overflow-y-auto leading-relaxed font-sans">
              {legalModal === 'impressum' && (
                <>
                  <p><strong>Hemdenpilot Services GmbH (in Gründ.)</strong></p>
                  <p>Königstraße 26, 70173 Stuttgart</p>
                  <p>Vertreten durch die Geschäftsführung.</p>
                  <p>Kontakt: kontakt@hemdenpilot.de | Website: www.hemdenpilot.de | Tel: +49 711 9253 4400</p>
                  <p>USt-IdNr.: In Beantragung</p>
                </>
              )}
              {legalModal === 'datenschutz' && (
                <>
                  <p>Wir verarbeiten deine Daten (Name, E-Mail, Telefonnummer, PLZ) ausschließlich zur Prüfung der Routenverfügbarkeit und Vorbereitung deines persönlichen Hemden-Abonnements gemäß Art. 6 Abs. 1 lit. b DSGVO.</p>
                  <p>Es erfolgt keine Weitergabe an unbefugte Dritte. Du kannst der Speicherung deiner Daten jederzeit per E-Mail an datenschutz@hemdenpilot.de widersprechen.</p>
                </>
              )}
              {legalModal === 'agb' && (
                <>
                  <p><strong>1. Geltungsbereich:</strong> Diese Bedingungen gelten für alle Lieferungen und Dienstleistungen des Hemdenpilot Pilotprogramms auf hemdenpilot.de.</p>
                  <p><strong>2. Leistungsgegenstand:</strong> Wöchentlicher kontaktloser Austausch von 5 Business-Hemden an der vereinbarten Privat- oder Firmenadresse.</p>
                  <p><strong>3. Laufzeit & Kündigung:</strong> Monatlich kündbar mit einer Frist von 7 Tagen zum Monatsende. Urlaubswochen können bis freitags 12:00 Uhr für die Folgewoche pausiert werden.</p>
                  <p><strong>4. Versicherung:</strong> Eigene Hemden in Paket B sind während des gesamten Obhutsprozesses mit bis zu 150 € je Hemd gegen Beschädigung und Verlust versichert.</p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E0D8] text-right">
              <button
                onClick={() => setLegalModal(null)}
                className="px-6 py-2.5 bg-[#0F172A] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#1C1917] transition-colors cursor-pointer rounded-none"
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
