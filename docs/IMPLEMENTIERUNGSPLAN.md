# Implementierungsplan Hemdenpilot

**Stand:** 29.10.2026 · **Basis:** kritische Projektanalyse + Code-Review von `main` (Commit `5922029`)
**Ziel:** Die Landingpage so umbauen, dass der Smoke-Test (1) rechtssicher läuft, (2) die richtigen Annahmen misst (B2B-Bündelung, echte Zahlungsbereitschaft) und (3) das Angebot an die wirtschaftlich tragfähige Variante angepasst ist.

Reihenfolge: **Phase 0 muss vor dem ersten Euro Werbebudget fertig sein.** Phase 1 und 2 vor dem Ad-Start, Phase 3 läuft parallel außerhalb des Codes.

---

## Phase 0 – Blocker: Sicherheit, Datenschutz, Wettbewerbsrecht

| # | Maßnahme | Dateien | Aufwand |
|---|---|---|---|
| 0.1 | Lead-API absichern | `server.ts`, `src/services/leadService.ts`, `src/components/LeadManagementModal.tsx`, `.env.example` | 2 h |
| 0.2 | Lead-Annahme serverseitig härten | `server.ts`, `src/components/FunnelModal.tsx` | 3 h |
| 0.3 | `leads.json` aus dem Repo, persistente Speicherung | `.gitignore`, `data/`, `server.ts` | 2 h |
| 0.4 | Client-Versand bereinigen (FormSubmit, Webhook) | `src/services/leadService.ts`, `LeadManagementModal.tsx` | 1 h |
| 0.5 | Datenschutz: Hinweis, Erklärung, Fonts lokal | `FunnelModal.tsx`, `Footer.tsx`, `index.html`, `src/index.css`, `public/assets/aistudio/Datenschutzerkl_rung_*.txt` | 2 h |
| 0.6 | Irreführende Angaben entfernen | `App.tsx`, `Header.tsx`, `PlzCheckerSection.tsx`, `src/data/mockRoutes.ts`, `TeamSection.tsx`, `FaqSection.tsx` | 2 h |

### 0.1 Lead-API absichern
**Befund:** `GET /api/leads` (`server.ts:43`) liefert Name, E-Mail und Telefon aller Leads ohne Authentifizierung. `GET /api/resend-status` gibt die private Empfängeradresse preis. Das Admin-Modal öffnet sich für jeden über `?admin`, `?pilot`, `#leads` oder Strg+Shift+L.
**Umsetzung:**
- Neue Env-Variable `ADMIN_TOKEN` (mind. 32 Zeichen, in `.env.example` dokumentiert, ohne echten Wert).
- Middleware `requireAdmin`: prüft `Authorization: Bearer <token>` mit `crypto.timingSafeEqual`, sonst `401`. Gilt für `GET /api/leads`, `GET /api/resend-status` und alle neuen Admin-Routen.
- Ist `ADMIN_TOKEN` nicht gesetzt, liefern Admin-Routen `503` (fail closed) statt offener Daten.
- Admin-Modal: Token-Eingabe beim Öffnen, Ablage nur in `sessionStorage`, bei `401` Token verwerfen und erneut fragen.
- `fetchCentralLeads` schickt den Header mit und mischt keine fremden `localStorage`-Daten mehr ein.

**Abnahme:** `curl /api/leads` ohne Token → 401. Mit Token → Liste. Ohne gesetztes Env → 503.

### 0.2 Lead-Annahme serverseitig härten
**Befunde:**
- Der Server übernimmt den Request-Body ungeprüft, auch Preise und ID vom Client.
- Name, E-Mail und Marke werden unescaped in die HTML-Benachrichtigung eingesetzt (HTML-Injection in die Betreiber-Mail).
- Die ID `HP-<PLZ>-<4 Ziffern>` kann kollidieren. Der Server dedupliziert per ID und **überschreibt dann einen bestehenden Lead**.
- Es gibt keinen Spam-Schutz. Bots verfälschen so die KPIs.

**Umsetzung:**
- `express.json({ limit: '10kb' })`.
- Validierungsfunktion `validateLead(body)`:
  - Pflichtfelder, PLZ `^\d{5}$`, E-Mail-Regex, Längenlimits (Name ≤ 100, Marke ≤ 80, Telefon ≤ 30).
  - Enum-Prüfung für `package` und `handover.type`.
  - Bei Fehlern `400` mit Feldliste.
- Server setzt `id` (`HP-<PLZ>-<crypto.randomUUID().slice(0,8)>`), `createdAt`, `pricePerMonth` und `firstMonthPrice` selbst aus der Preis-Config (siehe 2.2). Client-Werte werden ignoriert.
- Funktion `escapeHtml()` für alle Werte im Mail-Template. `encodeURIComponent` für den `mailto`-Link.
- Honeypot-Feld (`website`, unsichtbar, `tabIndex=-1`, `autocomplete="off"`) im Funnel. Ist es gefüllt, gibt der Server `200` zurück, ohne zu speichern.
- Einfaches In-Memory-Rate-Limit: max. 5 POSTs pro IP pro 10 Minuten → `429`.
- Der Funnel zeigt die Bestätigung erst bei `success: true` vom Server. Sonst kommt eine Fehlermeldung mit Retry. Heute wird auch bei Fehlschlag „bestätigt“.

**Abnahme:**
- POST mit `<script>` im Namen erscheint escaped in der Mail.
- POST ohne E-Mail → 400.
- 6. POST in 10 min → 429.
- Gefüllter Honeypot → nichts gespeichert.

### 0.3 `leads.json` aus dem Repo, persistente Speicherung
**Befunde:**
- `data/leads.json` ist eingecheckt und enthält 5 Leads mit Kontaktdaten.
- Auf Cloud Run (AI-Studio-Hosting) ist das Dateisystem flüchtig. Leads gehen bei jedem Neustart oder Deploy verloren.

**Umsetzung:**
- `git rm --cached data/leads.json`, `data/` in `.gitignore`. Der Server legt die Datei weiter bei Bedarf an (lokale Entwicklung).
- Produktiv-Speicher **(Entscheidung E1)**: Empfehlung ist ein serverseitiger Webhook `LEAD_WEBHOOK_URL` (Make/n8n → Google Sheet). Der Server sendet jeden validierten Lead dorthin. Die Resend-Mail bleibt als zweiter, unabhängiger Kanal.
- Das Antwortfeld `savedCentrally` meldet nur dann `true`, wenn der Webhook mit 2xx geantwortet hat.
- **Entscheidung E2:** Echte Personendaten aus der Git-Historie entfernen (`git filter-repo` + Force-Push auf `main`). Nur nötig, wenn die 5 Einträge echte Personen sind oder das Repo öffentlich ist bzw. wird.

**Abnahme:** `git ls-files data` ist leer. Ein Test-Lead erscheint im Sheet und per Mail. Nach einem Server-Neustart ist im Sheet nichts verloren.

### 0.4 Client-Versand bereinigen
**Befunde:**
- Der Webhook wird aus dem `localStorage` **des Besuchers** gelesen (`leadService.ts:160`). Echte Besucher haben dort nichts gespeichert. Der Webhook feuert also nie und funktioniert nur im Browser des Betreibers.
- Der FormSubmit-Fallback schickt Personendaten an einen weiteren Dienstleister, mit `_captcha: false` und mit der Empfängeradresse im Client-Code.

**Umsetzung:**
- `dispatchLead` macht nur noch `POST /api/leads`. FormSubmit und der Client-Webhook entfallen. Der Webhook liegt jetzt serverseitig (0.3).
- Im Admin-Modal entfällt die Webhook-Konfiguration bzw. sie wird durch eine Statusanzeige „Webhook konfiguriert: ja/nein“ vom Server ersetzt.
- Der `localStorage` des Besuchers speichert keine Leads mehr (auch keine Datenkopie im fremden Browser).

### 0.5 Datenschutz
- **Hinweis unter dem Submit-Button** im Funnel: „Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Reservierung verarbeiten. Details in der Datenschutzerklärung.“ Dazu ein Link zum vorhandenen Modal.
- **Google Fonts lokal einbinden** (`@fontsource/cormorant-garamond`, `@fontsource/plus-jakarta-sans`), `<link>` zu `fonts.googleapis.com` aus `index.html` entfernen. Grund: Urteil LG München I, 20.01.2022, 3 O 17493/20 (Abmahnrisiko).
- **Datenschutzerklärung ergänzen** (in `Footer.tsx` und in der `.txt`-Kopie):
  - Hosting konkret benennen statt „z. B.“
  - Resend (E-Mail-Versand, Drittlandtransfer USA, Rechtsgrundlage, EU-US Data Privacy Framework)
  - Make/Google Sheets (E1)
  - Analytics (1.1)
  - Speicherdauer der Reservierungen (Vorschlag: Löschung 6 Monate nach Ende der Pilotphase)
  - Absatz zu Google Fonts streichen.
- Hinweis: Die Texte ersetzen keine Rechtsberatung. Vor dem Ad-Start sollte ein Generator (z. B. eRecht24) oder ein Anwalt drüberschauen.

### 0.6 Irreführende Angaben entfernen (UWG § 5)
**Befunde:**
- Header zeigt hart codiert „14 von 50“ freien Plätzen (`App.tsx`: `spotsFree={14}`).
- Der PLZ-Check meldet „Pilot-Route aktiv · noch 8 Plätze frei“ aus Mock-Daten (`mockRoutes.ts`), obwohl keine Route existiert.
- Die Team-Sektion zeigt 3 Co-Founder plus Advisory Board.

**Umsetzung:**
- `spotsFree` aus der echten Lead-Anzahl berechnen: neuer öffentlicher Endpoint `GET /api/stats` → `{ reserved: n }`, keine Personendaten. Alternativ den Zähler ganz entfernen.
- Statustexte im PLZ-Check auf den Wahrheitsgehalt umstellen:
  - `active` → „Pilotgebiet · Start geplant“
  - `prep` → „Vormerkung möglich“
  - Erfundene Platzzahlen (`n`) entfernen.
- **Entscheidung E3:** Sind alle 4 Personen der Team-Sektion real und mit Namen und Foto einverstanden? Wenn nicht: Person entfernen oder Sektion auf die realen Gründer reduzieren. Fiktive Personen zur Vertrauensbildung sind irreführend.
- FAQ „Warum nur 50 Pilotplätze?“ an die tatsächliche Kapazität anpassen.

---

## Phase 1 – Messbarkeit des Smoke-Tests

| # | Maßnahme | Dateien | Aufwand |
|---|---|---|---|
| 1.1 | Event-Tracking ohne Cookies | `server.ts`, neu `src/services/tracking.ts`, `App.tsx`, `FunnelModal.tsx`, `PlzCheckerSection.tsx` | 3 h |
| 1.2 | UTM-Attribution im Lead | `types.ts`, `FunnelModal.tsx`, `server.ts` | 1 h |
| 1.3 | KPI-Ansicht im Admin-Modal | `LeadManagementModal.tsx`, `server.ts` | 3 h |
| 1.4 | Hero-CTA korrigieren | `App.tsx`, `Hero.tsx` | 0,5 h |

### 1.1 Event-Tracking
**Befund:** Der Code ruft `window.gtag` auf, aber gtag ist nirgends eingebunden. Die Go-KPI „Klickrate auf Paket-Buttons > 8–10 %“ ist **heute nicht messbar**.
**Umsetzung (Entscheidung E4, Empfehlung: eigener Endpoint):**
- `POST /api/events` nimmt `{ name, props }` mit einer festen Liste erlaubter Event-Namen an.
- Gespeichert werden nur aggregierte Zähler pro Tag und Event, keine IP und keine Cookies. Damit ist kein Consent-Banner nötig.
- Events:
  - `page_view`
  - `select_package_A`, `select_package_B`
  - `funnel_step_1` bis `funnel_step_3`
  - `lead_reserved`
  - `plz_check` (mit PLZ-Bereich und Status `active`/`prep`/`outside`)
  - `b2b_form_submitted` (2.3)
- Alternative: Plausible oder Umami (EU-gehostet, ca. 9 €/Monat).

### 1.2 UTM-Attribution
- `utm_source`, `utm_medium`, `utm_campaign` und `utm_content` beim ersten Seitenaufruf in `sessionStorage` sichern und im Lead als `attribution` mitsenden.
- Damit lässt sich der Cost per Lead pro Kanal (Meta vs. LinkedIn) und pro Anzeigenmotiv berechnen.

### 1.3 KPI-Ansicht im Admin-Modal
Kennzahlen direkt aus Leads und Events:
- Funnel: Seitenaufrufe → Paket-Klick → Schritt 1–3 → Lead, jeweils mit Conversion-Rate
- Anteil Paket A vs. B
- Anteil B2B-Übergabe
- Leads pro PLZ
- **B2B-Cluster:** Leads gruppiert nach E-Mail-Domain bzw. Firmenname (2.3), Hervorhebung ab 3 Personen pro Firma
- Ampel gegen die Go/Stop-Kriterien (Phase 3.5) mit eingetragenem Werbebudget

### 1.4 Hero-CTA
- Der Haupt-CTA öffnet heute fest Paket A (`handleHeroCta` → `'A'`). Das widerspricht der Strategie „Paket B als Zugpferd“.
- Neu: Der CTA scrollt zur Paketauswahl (`#pakete`) statt ein Paket vorzugeben. So misst die Paket-Klickrate eine echte Wahl.

---

## Phase 2 – Angebot und Funnel an das tragfähige Modell anpassen

| # | Maßnahme | Dateien | Aufwand |
|---|---|---|---|
| 2.1 | Paket B als Hauptangebot, Paket A neu konditioniert | `Packages.tsx`, `FunnelModal.tsx`, `FaqSection.tsx` | 2 h |
| 2.2 | Zentrale Preis-Config inkl. Preistest-Variante | neu `src/config/pricing.ts`, `types.ts`, `Packages.tsx`, `FunnelModal.tsx`, `server.ts` | 2 h |
| 2.3 | B2B-Firmenanfrage (eigener Einstieg) | neu `src/components/B2BSection.tsx`, `App.tsx`, `server.ts`, `types.ts` | 4 h |
| 2.4 | Validierungsfragen im Funnel | `FunnelModal.tsx`, `types.ts`, `server.ts` | 2 h |
| 2.5 | Übergabe-Alternativen testen | `FunnelModal.tsx`, `types.ts`, `FaqSection.tsx` | 1 h |
| 2.6 | Verbindliches Signal (Anzahlung) | `FunnelModal.tsx`, `server.ts`, `.env.example` | 2 h |

### 2.1 Paketdarstellung
- Paket B kommt als empfohlenes Paket nach vorn bzw. wird hervorgehoben. Paket A bleibt als Preisanker sichtbar.
- Paket A bekommt die Konditionen aus der Risiko-Mitigation:
  - „zzgl. einmalig 149 € Erstausstattung“ **oder**
  - „12 Monate Laufzeit“ (Variante per Config, E5).
- Der Satz „Keine Mindestvertragslaufzeit“ (`Packages.tsx`) gilt dann nur noch für Paket B und wird entsprechend formuliert.
- Paket-B-Text: „15 eigene Hemden“ als Voraussetzung klar nennen (Puffer-Prinzip).

### 2.2 Preis-Config
- Eine Quelle `src/config/pricing.ts` für:
  - Monatspreise
  - Rabatt erster Monat
  - Setup-Gebühr bzw. Laufzeit Paket A
  - Pilotplätze
- Wird genutzt von `Packages`, `FunnelModal`, `FaqSection` und vom Server (Preis im Lead wird serverseitig gesetzt, 0.2).
- Heute stehen die Preise in 5 Dateien hart im Code, inkl. Union-Typen `119 | 79` in `types.ts`.
- Optionaler Preistest: URL-Parameter `?p=b89` zeigt Paket B zu 89 €. Die Variante wird im Lead als `priceVariant` gespeichert. Erlaubte Varianten serverseitig whitelisten.

### 2.3 B2B-Firmenanfrage
- Neue Sektion „Für Kanzleien & Unternehmen“ zwischen Paketen und Team:
  - Sammel-Übergabe am Empfang
  - Arbeitgeberzuschuss als Benefit, Hinweis „steuerliche Behandlung mit Ihrem Steuerberater klären“, keine pauschale Steuerfrei-Zusage (50-€-Freigrenze, § 8 Abs. 2 S. 11 EStG)
- Formular:
  - Firma, Ansprechpartner, Funktion, E-Mail, Telefon
  - Standort-PLZ
  - Anzahl interessierter Mitarbeiter (Zahl)
  - Interesse an Arbeitgeberzuschuss (ja/nein/unklar)
- Speichert einen Lead vom Typ `company` (neuer Diskriminator in `types.ts`), gleiche Validierung und Absicherung wie 0.2.
- Im Privat-Funnel, Schritt 2 (B2B-Übergabe): Firmenname und **Anzahl** interessierter Kollegen (statt Checkbox „3+ Kollegen“) abfragen. Das speist das Clustering in 1.3.

### 2.4 Validierungsfragen im Funnel (je 1 Klick, optional)
- „Wie viele Business-Hemden besitzen Sie?“ (< 10 / 10–14 / 15+). Das zeigt, ob Paket B überhaupt geht.
- „Wie lösen Sie das heute?“ (selbst / Partner(in) / Reinigung / Haushaltshilfe / anderes)
- „Was geben Sie dafür ungefähr im Monat aus?“ (0 / < 30 € / 30–60 € / > 60 €)
- Checkbox „Auch Sakkos, Anzüge und Hosen mitgeben“: misst die Nachfrage nach dem größeren Warenkorb pro Stopp.

### 2.5 Übergabe-Alternativen
- Neben „Sonntag 18–21 Uhr Wohnungstür“ und „Montag bis 09 Uhr Empfang“ zusätzlich anbieten:
  - „Werktagabend (Di oder Mi, 19–21 Uhr)“
  - „Concierge / Paketraum im Gebäude“
- Ziel: messen, ob die teure Sonntagstour wirklich gewünscht ist.
- `handover.slot` wird vom festen Literal-Typ auf eine Enum-Liste umgestellt.

### 2.6 Verbindliches Signal (Entscheidung E6)
- Nach der Reservierung optional: „Platz verbindlich sichern – 19 € Anzahlung, wird mit dem ersten Monat verrechnet, jederzeit erstattbar“.
- Umsetzung über einen Stripe Payment Link (`STRIPE_DEPOSIT_URL` in Env, kein Stripe-SDK nötig). Event `deposit_clicked`.
- Bestätigungen gleicht man manuell im Stripe-Dashboard ab.
- Voraussetzungen: Stripe-Konto, Ergänzung der Teilnahmebedingungen (Erstattung) und der Datenschutzerklärung.
- Diese Kennzahl ersetzt „unverbindliche Reservierung“ als Haupt-Go-Kriterium.

---

## Phase 3 – Außerhalb des Codes (Geschäftsmodell und Validierung)

| # | Aufgabe | Ergebnis / Kriterium |
|---|---|---|
| 3.1 | 2–3 schriftliche Angebote von Wäschereien in Stuttgart (Hemd gewaschen, hängend gebügelt, mit Abholung) | Kosten pro Hemd belegt. **Kill, wenn > 2,00 € netto** |
| 3.2 | Gespräch mit 2 Stuttgarter Lieferreinigungen über Partnerschaft (sie fahren, Hemdenpilot liefert Kunden) | Kosten pro Stopp belegt, keine eigene Flotte |
| 3.3 | B2B-Direktansprache: 20 Kanzleien/Beratungen in 70173/70174 (Office-Manager, HR) | **Ziel: 3 Absichtserklärungen (LOI) mit je ≥ 4 Nutzern** |
| 3.4 | Steuerberater: Behandlung als Sachbezug bzw. Arbeitgeberleistung klären | Belastbare Aussage für die B2B-Sektion |
| 3.5 | Go/Stop-Kriterien neu festlegen (ersetzen Dossier Abschnitt 9) | Go: ≥ 5 Anzahlungen **und** ≥ 1 Firmenstandort mit ≥ 4 Interessenten **und** Reinigung ≤ 2 €/Hemd. Stop: eines davon verfehlt nach 250 € Budget |
| 3.6 | Werbung eingrenzen: LinkedIn nach Branche (Recht, Beratung, Finanzen) + Arbeitsort Stuttgart. Meta nur auf Ziel-PLZ | Höherer Anteil passender Leads |
| 3.7 | Reinigungs-AGB mit Haftungsgrenze, Betriebshaftpflicht | Vor dem ersten echten Kundenhemd |
| 3.8 | Arbeitszeitrecht bei Sonntagsfahrten klären (ArbZG § 9/10) bzw. Werktag-Variante wählen | Rechtssichere Tour |

## Phase 4 – Dossier korrigieren (`projektstatus_hemdenpilot.md`)
- **6.2 Paket B:** Amortisation B2C **9–18 Monate** (nicht 3–5). 3–5 Monate gelten nur bei B2B-Bündelung.
- **6.1 Paket A:** Abschreibung 22–27 €/Monat (330 € über 12–15 Monate), nicht 14 €. Widerspruch „35 Wäschen“ vs. „12–15 Monate“ auflösen.
- **Neue Zeile Fixkosten** und die Zahl der Kunden bis zum Break-even (Faustregel: 100 Kunden je 1.000 € Fixkosten bei 10 € Deckungsbeitrag).
- **Sensitivität:** Reinigung 1,60 / 2,00 / 2,50 € pro Hemd.
- **Risiko 4** aktualisieren: Die Speicherung läuft nicht mehr über `localStorage`. Die neuen Punkte aus Phase 0 aufnehmen.
- **§ 8 EStG** als Freigrenze (nicht Freibetrag) korrekt darstellen.

## Aufräumen (geringe Priorität)
- `package.json`: `name` von `react-example` auf `hemdenpilot` ändern. Die ungenutzte Abhängigkeit `@google/genai` entfernen und `GEMINI_API_KEY` aus `.env.example` streichen (kein Aufruf im Code).
- `Hemdenpilot Landing.dc.html`, `support.js`, `image-slot.js`: alter Prototyp mit eigener `localStorage`-Lead-Logik. Nach `archive/` verschieben oder löschen (E7).
- `.aistudio/artifacts/.../.tempmediaStorage/` (12 temporäre Bilder) aus dem Repo nehmen und in `.gitignore` aufnehmen.

---

## Offene Entscheidungen (vor Umsetzung)

| ID | Frage | Empfehlung |
|---|---|---|
| E1 | Wohin werden Leads produktiv gespeichert? | Server-Webhook → Make → Google Sheet (kostenlos, sofort einsehbar) |
| E2 | Leads aus der Git-Historie entfernen (Force-Push auf `main`)? | Ja, falls echte Personen oder Repo öffentlich |
| E3 | Sind alle Team-Mitglieder real und einverstanden? | Nur reale Personen zeigen |
| E4 | Tracking: eigener Endpoint oder Plausible? | Eigener Endpoint (kein Consent-Banner, 0 €) |
| E5 | Paket A: Setup-Gebühr 149 € oder 12-Monats-Vertrag? | Setup-Gebühr (B2C verständlicher), 12 Monate nur B2B |
| E6 | Anzahlung über Stripe einbauen? | Ja, 19 € erstattbar |
| E7 | Alten Prototyp (`*.dc.html`) löschen oder archivieren? | Löschen (liegt in der Git-Historie) |

## Umsetzungsreihenfolge und Prüfung

1. Phase 0 (≈ 12 h): ein Commit pro Maßnahme, danach `npm run lint` (tsc) und `npm run build`. Manueller Test der Abnahmekriterien per `curl` und im Browser (Playwright).
2. Phase 1 + 2 (≈ 21 h): danach ein kompletter Funnel-Durchlauf je Paket und Übergabeart, B2B-Formular, KPI-Ansicht mit Testdaten.
3. Erst danach Ad-Start. Phase 3 läuft parallel. Phase 4 vor der nächsten Gremiumssitzung.

**Gesamtaufwand Code:** ca. 33 h (+ Aufräumen ca. 1 h).
**Externe Kosten:** 0 € (Plausible ca. 9 €/Monat bei E4-Alternative; Stripe nur Transaktionsgebühren).
