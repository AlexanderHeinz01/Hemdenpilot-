import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { LegalKey } from '../services/legal';
import { DEPOSIT_AMOUNT, SETUP_FEE_A, formatEuro } from '../config/pricing';

interface FooterProps {
  onOpenAdmin?: () => void;
}

type LegalModalKey = LegalKey;

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const [legalKey, setLegalKey] = useState<LegalModalKey | null>(null);

  // Formulare können die Rechtstexte über openLegal() öffnen
  useEffect(() => {
    const handleOpen = (e: Event) => setLegalKey((e as CustomEvent<LegalKey>).detail);
    window.addEventListener('hp:open-legal', handleOpen);
    return () => window.removeEventListener('hp:open-legal', handleOpen);
  }, []);

  useEffect(() => {
    if (legalKey) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [legalKey]);

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

            <div className="flex flex-wrap gap-5 sm:gap-8 text-[11px] font-semibold tracking-[0.16em] uppercase">
              <button
                type="button"
                onClick={() => setLegalKey('impressum')}
                className="bg-transparent border-0 p-1 font-jakarta tracking-[inherit] uppercase text-[#F9F8F6]/72 cursor-pointer hover:text-[#9A7B4F] transition-colors min-h-[36px] flex items-center"
              >
                Impressum
              </button>
              <button
                type="button"
                onClick={() => setLegalKey('datenschutz')}
                className="bg-transparent border-0 p-1 font-jakarta tracking-[inherit] uppercase text-[#F9F8F6]/72 cursor-pointer hover:text-[#9A7B4F] transition-colors min-h-[36px] flex items-center"
              >
                Datenschutz
              </button>
              <button
                type="button"
                onClick={() => setLegalKey('agb')}
                className="bg-transparent border-0 p-1 font-jakarta tracking-[inherit] uppercase text-[#F9F8F6]/72 cursor-pointer hover:text-[#9A7B4F] transition-colors min-h-[36px] flex items-center"
              >
                AGB
              </button>
            </div>
          </div>

          <div className="pt-7 flex flex-wrap justify-between gap-3 text-[10px] tracking-[0.16em] uppercase text-[#F9F8F6]/45">
            <span
              onClick={onOpenAdmin}
              className={onOpenAdmin ? 'cursor-pointer hover:text-[#9A7B4F] transition-colors select-none' : ''}
              title={onOpenAdmin ? 'Diskreter Betreiber-Zugang (Leads)' : undefined}
            >
              © {new Date().getFullYear()} Hemdenpilot – Alexander Heinz. Alle Rechte vorbehalten.
            </span>
            <span>Stuttgart · Executive Valet</span>
          </div>

        </div>
      </footer>

      {/* Legal Modal (Impressum / Datenschutz / AGB) */}
      {legalKey && (
        <div
          onClick={() => setLegalKey(null)}
          className="fixed inset-0 z-[60] bg-[#0B111E]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F9F8F6] border border-[#E5E0D8] max-w-[680px] w-full p-5 sm:p-8 md:p-9 text-[#18181B] my-auto rounded-none font-jakarta shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-[#E5E0D8] shrink-0 gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] sm:tracking-[0.22em] text-[#9A7B4F] uppercase block mb-1">
                  RECHTLICHE HINWEISE
                </span>
                <h3 className="font-cormorant text-[24px] sm:text-[28px] font-medium leading-[1.2] m-0 text-[#18181B]">
                  {legalKey === 'impressum' && 'Impressum'}
                  {legalKey === 'datenschutz' && 'Datenschutzerklärung'}
                  {legalKey === 'agb' && 'Allgemeine Geschäfts- und Teilnahmebedingungen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalKey(null)}
                aria-label="Schließen"
                className="bg-transparent border-0 p-1.5 cursor-pointer text-[#57534E] hover:text-[#18181B] transition-colors flex min-h-[36px] min-w-[36px] items-center justify-center shrink-0"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="py-5 overflow-y-auto pr-1 sm:pr-2 space-y-6 text-[13px] sm:text-[14px] leading-[1.7] text-[#3F3F46]">
              {/* --- IMPRESSUM --- */}
              {legalKey === 'impressum' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#18181B] text-[13px] sm:text-[14px] uppercase tracking-wider mb-2 font-jakarta">
                      Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz):
                    </h4>
                    <p className="m-0 leading-relaxed text-[#18181B]">
                      Hemdenpilot<br />
                      Alexander Heinz<br />
                      Walstieg 3, 21077 Hamburg
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-semibold text-[#18181B] text-[13px] sm:text-[14px] uppercase tracking-wider mb-2 font-jakarta">
                      Kontakt:
                    </h4>
                    <p className="m-0 leading-relaxed">
                      Telefon:{' '}
                      <a href="tel:01753623807" className="text-[#18181B] hover:text-[#9A7B4F] underline">
                        0175-36 23807
                      </a>
                      <br />
                      E-Mail:{' '}
                      <a href="mailto:info@alexander-heinz.de" className="text-[#18181B] hover:text-[#9A7B4F] underline">
                        info@alexander-heinz.de
                      </a>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-semibold text-[#18181B] text-[13px] sm:text-[14px] uppercase tracking-wider mb-2 font-jakarta">
                      Umsatzsteuer-ID:
                    </h4>
                    <p className="m-0 leading-relaxed">
                      Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:{' '}
                      <strong className="text-[#18181B]">DE313787638</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-semibold text-[#18181B] text-[13px] sm:text-[14px] uppercase tracking-wider mb-2 font-jakarta">
                      Verbraucherstreitbeilegung / Universalschlichtungsstelle:
                    </h4>
                    <p className="m-0 leading-relaxed">
                      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                    </p>
                  </div>
                </div>
              )}

              {/* --- AGB --- */}
              {legalKey === 'agb' && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-[#E5E0D8]">
                    <p className="text-[12px] font-semibold text-[#9A7B4F] uppercase tracking-wider m-0">
                      Stand: Oktober 2026 · Pilotphase
                    </p>
                  </div>

                  <div>
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      § 1 Geltungsbereich und Anbieter
                    </h4>
                    <p className="m-0 mb-2">
                      (1) Diese Bedingungen regeln die Nutzung des Online-Konfigurators sowie die unverbindliche Vorreservierung eines Pilotplatzes für den angebotenen Hemden-Service durch Alexander Heinz, Walstieg 3, 21077 Hamburg (nachfolgend „Anbieter“).
                    </p>
                    <p className="m-0">
                      (2) Das Angebot richtet sich gleichermaßen an Verbraucher (§ 13 BGB) und Unternehmer (§ 14 BGB).
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      § 2 Unverbindlichkeit der Pilot-Reservierung (Kein Vertragsschluss)
                    </h4>
                    <p className="m-0 mb-2">
                      (1) Die Darstellung der Service-Pakete („Paket A“ und „Paket B“) auf der Website stellt <strong className="text-[#18181B]">kein rechtlich bindendes Angebot</strong> auf Abschluss eines Dienstleistungs- oder Mietvertrages dar, sondern eine unverbindliche Information im Rahmen einer regionalen Markterkundung und Routenplanung.
                    </p>
                    <p className="m-0 mb-2">
                      (2) Durch das Ausfüllen des 3-Schritte-Konfigurators und das Klicken auf den Button „Pilotplatz unverbindlich sichern“ (bzw. „Pilotplatz &amp; 50 % Rabatt unverbindlich reservieren“) geht der Nutzer <strong className="text-[#18181B]">keine Zahlungsverpflichtung</strong> und <strong className="text-[#18181B]">kein kostenpflichtiges Abonnement</strong> ein.
                    </p>
                    <p className="m-0">
                      (3) Mit der Eintragung bekundet der Nutzer lediglich sein unverbindliches Interesse, bei Freischaltung einer Kurier-Route in seinem Postleitzahlengebiet vom Anbieter kontaktiert zu werden. Ein Rechtsanspruch auf Zuteilung eines Pilotplatzes oder auf spätere Leistungserbringung besteht nicht.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      § 3 Ablauf bei Verfügbarkeit und späterer Vertragsschluss
                    </h4>
                    <p className="m-0 mb-2">
                      (1) Sobald in dem vom Nutzer angegebenen Postleitzahlengebiet eine Kurier-Route eröffnet wird, informiert der Anbieter den Nutzer per E-Mail oder telefonisch über die Verfügbarkeit.
                    </p>
                    <p className="m-0 mb-2">
                      (2) Ein rechtsgültiger, kostenpflichtiger Vertrag über den wöchentlichen Hemden-Service (inklusive des im Rahmen der Vorreservierung vorgemerkten Start-Rabatts von 50 % für den ersten Probemonat) kommt erst dann zustande, wenn der Nutzer nach persönlicher Kontaktaufnahme ein separates, ausdrücklich als solches gekennzeichnetes Vertragsangebot des Anbieters bestätigt.
                    </p>
                    <p className="m-0">
                      (3) Erst im Rahmen dieses späteren Vertragsschlusses gelten die gesonderten Leistungs-, Haftungs- und Textilpflegebedingungen des Anbieters sowie das gesetzliche 14-tägige Widerrufsrecht für Verbraucher.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      § 4 Erstausstattung bei Paket A und freiwillige Anzahlung
                    </h4>
                    <p className="m-0 mb-2">
                      (1) Bei Paket A fällt mit Abschluss des späteren Vertrags (§ 3) einmalig eine Erstausstattung von {formatEuro(SETUP_FEE_A)} für die 15 persönlich zugewiesenen Hemden an. Mit der Vorreservierung entsteht hierfür keine Zahlungspflicht.
                    </p>
                    <p className="m-0 mb-2">
                      (2) Nach der Vorreservierung kann der Nutzer freiwillig eine Anzahlung von {formatEuro(DEPOSIT_AMOUNT)} über den Zahlungsdienstleister Stripe leisten. Nutzer mit Anzahlung werden beim Start der Routen in ihrem Postleitzahlengebiet vorrangig berücksichtigt.
                    </p>
                    <p className="m-0">
                      (3) Die Anzahlung wird bei Vertragsschluss vollständig mit dem ersten Monatsbeitrag verrechnet. Kommt kein Vertrag zustande – gleich aus welchem Grund –, oder verlangt der Nutzer sie vor Vertragsschluss zurück, erstattet der Anbieter sie innerhalb von 14 Tagen vollständig über das ursprüngliche Zahlungsmittel. Eine formlose Nachricht an info@alexander-heinz.de genügt.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      § 5 Haftung
                    </h4>
                    <p className="m-0 mb-2">
                      (1) Für Ansprüche aufgrund von Schäden, die durch uns, unsere gesetzlichen Vertreter oder Erfüllungsgehilfen verursacht wurden, haften wir stets unbeschränkt bei Verletzung des Lebens, des Körpers oder der Gesundheit sowie bei vorsätzlicher oder grob fahrlässiger Pflichtverletzung.
                    </p>
                    <p className="m-0">
                      (2) Im Übrigen ist eine Haftung im Rahmen dieser unentgeltlichen und unverbindlichen Vorreservierungsphase ausgeschlossen.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      § 6 Schlussbestimmungen
                    </h4>
                    <p className="m-0">
                      Es gilt das Recht der Bundesrepublik Deutschland. Sofern der Nutzer Kaufmann ist, ist ausschließlicher Gerichtsstand für alle Streitigkeiten der Sitz des Anbieters.
                    </p>
                  </div>
                </div>
              )}

              {/* --- DATENSCHUTZ --- */}
              {legalKey === 'datenschutz' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      1. Datenschutz auf einen Blick und Verantwortlicher
                    </h4>
                    <p className="m-0 mb-3">
                      Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (insbesondere der DSGVO und des TDDDG) sowie dieser Datenschutzerklärung.
                    </p>
                    <div className="p-3.5 bg-[#F2EFE9] border border-[#E5E0D8] text-[13px]">
                      <strong className="block text-[#18181B] mb-1">
                        Verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                      </strong>
                      Alexander Heinz<br />
                      Walstieg 3, 21077 Hamburg<br />
                      Telefon:{' '}
                      <a href="tel:01753623807" className="text-[#18181B] underline hover:text-[#9A7B4F]">
                        0175-36 23807
                      </a>
                      <br />
                      E-Mail:{' '}
                      <a href="mailto:info@alexander-heinz.de" className="text-[#18181B] underline hover:text-[#9A7B4F]">
                        info@alexander-heinz.de
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      2. Hosting und Bereitstellung der Website
                    </h4>
                    <p className="m-0 mb-2">
                      Diese Website wird bei Google Cloud Run (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland) gehostet. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung; eine Übermittlung in die USA kann nicht ausgeschlossen werden und erfolgt auf Grundlage des EU-US Data Privacy Framework bzw. der EU-Standardvertragsklauseln. Beim Aufruf dieser Website werden durch den Hosting-Anbieter automatisch sogenannte Server-Log-Dateien erhoben und gespeichert, die Ihr Browser automatisch übermittelt. Dies sind:
                    </p>
                    <ul className="list-disc pl-5 m-0 mb-3 space-y-1">
                      <li>IP-Adresse des anfragenden Endgeräts</li>
                      <li>Datum und Uhrzeit der Serveranfrage</li>
                      <li>Browsertyp und Browserversion sowie verwendetes Betriebssystem</li>
                      <li>Referrer URL (die zuvor besuchte Seite)</li>
                    </ul>
                    <p className="m-0">
                      Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer technisch fehlerfreien, sicheren und performanten Darstellung unserer Website).
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      3. Unverbindliche Pilot-Reservierung &amp; Warteliste (Konfigurator)
                    </h4>
                    <p className="m-0 mb-2">
                      Wenn Sie sich über unser Formular (Konfigurator) für den Pilotstart bzw. die Warteliste eintragen, erheben wir die von Ihnen eingegebenen Daten:
                    </p>
                    <ul className="list-disc pl-5 m-0 mb-3 space-y-1">
                      <li>Gewähltes Service-Modell (Paket A oder Paket B)</li>
                      <li>Optionale Angaben zu Hemdengröße, Schnitt, Markenpräferenz sowie bevorzugtem Übergabeort (Haustür oder Büro)</li>
                      <li>Postleitzahl (zur Routenplanung)</li>
                      <li>Vor- und Nachname, E-Mail-Adresse sowie optional Ihre Telefonnummer</li>
                      <li>Optionale Angaben zu Hemdenbestand, heutiger Lösung, ungefähren monatlichen Ausgaben und Interesse an weiteren Kleidungsstücken</li>
                      <li>Bei Firmenanfragen: Unternehmen, Funktion, Standort-PLZ und Anzahl interessierter Mitarbeiter</li>
                      <li>Die Kampagne, über die Sie auf die Seite gekommen sind (UTM-Parameter der Anzeige, verweisende Website), um die Wirksamkeit unserer Werbung je Kanal auszuwerten</li>
                    </ul>
                    <p className="m-0 mb-3">
                      <strong className="text-[#18181B]">Zweck und Rechtsgrundlage:</strong><br />
                      Die Verarbeitung dieser Daten erfolgt ausschließlich zu dem Zweck, die Nachfrage und Routenverfügbarkeit in Ihrem Postleitzahlengebiet zu prüfen und Sie bei Verfügbarkeit eines Pilotplatzes per E-Mail oder Telefon zu kontaktieren.<br />
                      Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage hin) sowie Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung durch das aktive Absenden des Formulars).
                    </p>
                    <p className="m-0">
                      <strong className="text-[#18181B]">Speicherdauer:</strong><br />
                      Die von Ihnen im Rahmen der Warteliste eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (spätestens 6 Monate nach Abschluss der Pilotphase, sofern kein Vertragsverhältnis zustande kommt). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      4. Empfänger Ihrer Reservierungsdaten
                    </h4>
                    <p className="m-0 mb-2">
                      Zur Bearbeitung Ihrer Reservierung bzw. Anfrage setzen wir folgende Dienstleister als Auftragsverarbeiter ein (Art. 28 DSGVO):
                    </p>
                    <ul className="list-disc pl-5 m-0 mb-3 space-y-1">
                      <li>
                        <strong className="text-[#18181B]">Resend</strong> (Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA) für den Versand der Benachrichtigung an uns per E-Mail. Die Übermittlung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln bzw. des EU-US Data Privacy Framework.
                      </li>
                      <li>
                        <strong className="text-[#18181B]">Make</strong> (Celonis s.r.o., Prag, Tschechien) und <strong className="text-[#18181B]">Google Workspace / Google Sheets</strong> (Google Ireland Limited, Dublin, Irland) für die geordnete Ablage der Reservierungen in einer Tabelle.
                      </li>
                      <li>
                        Falls Sie eine Anzahlung leisten: <strong className="text-[#18181B]">Stripe</strong> (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irland) als Zahlungsdienstleister. Dabei gelten zusätzlich die Datenschutzhinweise von Stripe; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      5. Reichweitenmessung ohne Cookies
                    </h4>
                    <p className="m-0 mb-2">
                      Um zu verstehen, wie die Seite genutzt wird, zählen wir auf unserem eigenen Server anonym bestimmte Ereignisse (z. B. Seitenaufruf, Klick auf ein Paket, erreichte Schritte im Konfigurator, Ergebnis der PLZ-Prüfung). Gespeichert wird nur die Anzahl je Ereignis und Tag – ohne IP-Adresse, ohne Cookies und ohne Profilbildung. Damit Sie innerhalb eines Besuchs nicht mehrfach gezählt werden, wird lediglich ein Merker im Sitzungsspeicher Ihres Browsers abgelegt, der beim Schließen des Tabs gelöscht wird.
                    </p>
                    <p className="m-0">
                      Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Auswertung unseres Markttests) bzw. § 25 Abs. 2 Nr. 2 TDDDG für den technisch erforderlichen Sitzungsspeicher.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      6. Schriftarten
                    </h4>
                    <p className="m-0">
                      Die verwendeten Schriftarten sind lokal auf unserem Server eingebunden. Beim Aufruf der Seite findet keine Verbindung zu Servern Dritter (z. B. Google Fonts) statt.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <h4 className="font-cormorant font-semibold text-[18px] sm:text-[20px] text-[#18181B] mb-2">
                      7. Ihre Rechte als betroffene Person
                    </h4>
                    <p className="m-0 mb-2">
                      Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf:
                    </p>
                    <ul className="list-disc pl-5 m-0 mb-3 space-y-1">
                      <li><strong className="text-[#18181B]">Auskunft</strong> über Ihre bei uns gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>
                      <li><strong className="text-[#18181B]">Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
                      <li><strong className="text-[#18181B]">Löschung</strong> Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO)</li>
                      <li><strong className="text-[#18181B]">Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
                      <li><strong className="text-[#18181B]">Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
                      <li><strong className="text-[#18181B]">Widerspruch</strong> gegen die Verarbeitung Ihrer Daten (Art. 21 DSGVO) sowie <strong className="text-[#18181B]">Widerruf</strong> einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO) mit Wirkung für die Zukunft.</li>
                    </ul>
                    <p className="m-0">
                      Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen E-Mail-Adresse an uns wenden. Zudem steht Ihnen ein Beschwerderecht bei der zuständigen Datenschutz-Aufsichtsbehörde zu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t border-[#E5E0D8] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setLegalKey(null)}
                className="w-full sm:w-auto py-3 px-7 bg-[#0B111E] text-[#F9F8F6] border-0 rounded-none font-jakarta text-[11px] font-semibold tracking-[0.16em] uppercase cursor-pointer hover:bg-[#18181B] min-h-[44px] flex items-center justify-center text-center transition-colors"
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
