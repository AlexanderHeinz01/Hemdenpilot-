# Hemdenpilot – Landingpage & Smoke-Test (Pilot Stuttgart)

Single-Page-Landingpage für den Business-Hemden-Service **Hemdenpilot**. Sie misst im Smoke-Test, welches Modell Interessenten wählen (Paket B mit eigenen Hemden oder Paket A inkl. 15 Hemden), welche Übergabe sie wünschen und ob sich an Büro-Standorten genug Nutzer bündeln lassen. Hintergrund und Maßnahmen: [`docs/IMPLEMENTIERUNGSPLAN.md`](docs/IMPLEMENTIERUNGSPLAN.md).

Stack: React 19, Vite 8, Tailwind v4, lucide-react, Express-Server (`server.ts`, gestartet mit `tsx`).

## Lokal starten

```bash
npm install
cp .env.example .env   # Werte eintragen, mindestens ADMIN_TOKEN
npm run dev            # http://localhost:3000
```

Prüfen vor jedem Push: `npm run lint` (TypeScript) und `npm run build`.

## Konfiguration (Umgebungsvariablen)

| Variable | Zweck |
|---|---|
| `ADMIN_TOKEN` | Zugang zum Lead Management Center. Mindestens 32 Zeichen (`openssl rand -hex 32`). Ohne Token sind alle Admin-Routen gesperrt. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | E-Mail-Benachrichtigung je Lead über Resend. Ohne verifizierte Absenderadresse läuft Resend im Sandbox-Modus und stellt nur an `RESEND_ACCOUNT_EMAIL` (Adresse des Resend-Kontos) zu. |
| `LEAD_NOTIFICATION_EMAIL` | Empfänger der Benachrichtigungen (Produktivmodus). |
| `LEAD_WEBHOOK_URL` | **Dauerhafte Ablage der Leads**, z. B. Make-Szenario „Custom Webhook → Google Sheets: Add a Row“. Der Server sendet `{ type: 'private' \| 'company', lead }`. |
| `STRIPE_DEPOSIT_URL` | Stripe Payment Link für die erstattbare Anzahlung (19 €). Ohne Wert wird die Anzahlung nicht angeboten. Der Link erhält `client_reference_id` (= Reservierungs-ID) und `prefilled_email`. |
| `DATA_DIR` | Ablage von `leads.json` und `events.json`. Standard `./data` (nicht im Repo). |

**Wichtig zum Hosting:** Auf Cloud Run (AI Studio) ist das Dateisystem flüchtig. `leads.json` und die Event-Zähler gehen bei jedem Neustart verloren, wenn `DATA_DIR` nicht auf ein persistentes Volume (Cloud-Storage-Volume-Mount) zeigt. Leads sind über Webhook und E-Mail trotzdem gesichert, die Kennzahlen im Admin aber nicht. Für den Smoke-Test also entweder ein Volume einrichten oder die Ad-Plattform-Zahlen (Landingpage-Aufrufe) als Basis nehmen.

## Lead Management Center

Aufruf über `?admin`, `#admin`, Strg/Cmd + Shift + L oder Klick auf das Copyright im Footer. Das Modal verlangt das `ADMIN_TOKEN` (gespeichert nur im `sessionStorage`).

- **Reservierungen / Firmenanfragen:** Suche, Filter, Status und Notizen (auf dem Server gespeichert), CSV-Export, Test-Mail.
- **Kennzahlen:** Go/Stop-Ampel (Anzahlungs-Klicks ≥ 5, Firmen-Cluster ≥ 4 Interessenten, Entscheidung bei 250 € Budget), Cost per Lead, Klickrate, Funnel, Firmen-Cluster (nach Firmenname bzw. geschäftlicher E-Mail-Domain), Umfrage-Auswertung, Quellen und Preistest.

## Preistest und Kampagnen-Tracking

- Preise stehen ausschließlich in `src/config/pricing.ts`. Der Server setzt die Preise im Lead selbst.
- `?p=b89` bzw. `?p=b99` zeigt Paket B zu 89 € bzw. 99 € (Variante wird im Lead gespeichert).
- UTM-Parameter (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) werden beim ersten Aufruf übernommen und im Lead gespeichert. Anzeigen-Links deshalb immer mit UTM-Parametern versehen.

## API

| Route | Zugriff | Zweck |
|---|---|---|
| `POST /api/leads` | öffentlich, 5 / 10 min je IP | Reservierung aus dem Konfigurator (serverseitige Validierung, Honeypot `website`) |
| `POST /api/company-leads` | öffentlich, 5 / 10 min je IP | Firmenanfrage aus der B2B-Sektion |
| `POST /api/events` | öffentlich, 120 / 10 min je IP | Cookieloses Tracking, nur erlaubte Event-Namen, nur Tageszähler |
| `GET /api/stats`, `GET /api/config` | öffentlich | Anzahl Reservierungen (Header), Anzahlungs-Link |
| `/api/admin/*` | `Authorization: Bearer <ADMIN_TOKEN>` | Leads lesen/ändern/löschen, Events, Status, Test-Mail |

## Code-Struktur

- `server.ts`: Routen. `server/validation.ts` (Validierung, ID, Preise), `server/storage.ts` (Dateien), `server/notify.ts` (Resend, Webhook, HTML-Escaping), `server/security.ts` (Admin-Token, Rate-Limit).
- `src/config/`: Preise und Auswahloptionen, gemeinsam für Client und Server.
- `src/services/`: Lead-Versand und Admin-API, Tracking, Sitzung (UTM, Preistest), Kennzahlen, Rechtstexte öffnen.
- `src/components/`: Sektionen der Seite, Konfigurator (`FunnelModal.tsx`), B2B-Sektion (`B2BSection.tsx`), Admin (`LeadManagementModal.tsx`, `admin/KpiPanel.tsx`).
- Rechtstexte (Impressum, Datenschutz, Teilnahmebedingungen) stehen in `src/components/Footer.tsx`.
- Schriften sind lokal über `@fontsource` eingebunden (keine Verbindung zu Google Fonts).

## Grundsätze („Quiet Luxury“)
- Keine Radien (`rounded-none`). Ausnahme: der runde Puls-Punkt im Header.
- Keine Schatten (`shadow-none`). Stattdessen 1px-Haarlinien in `#E5E0D8` (hell) bzw. `rgba(249,248,246,0.1–0.14)` (dunkel).
- Viel Weißraum: Sektionen `py-24` bis `py-32`, Karten `p-8` bis `p-12`.
- Anrede durchgehend **Sie**.
- Container: `max-w-[1200px] mx-auto px-5 md:px-8`. Ausnahmen: Pakete `max-w-5xl`, PLZ-Check `max-w-5xl`, FAQ `max-w-[880px]`.

## Design Tokens

### Farben
| Token | Hex | Verwendung |
|---|---|---|
| bg-primary | `#F9F8F6` | Helle Sektionen, Modal |
| bg-secondary | `#F2EFE9` | Ablauf, PLZ-Check, Hinweisboxen |
| surface-dark | `#0B111E` | Header (95 % + Blur), Hero, Paket-A-Karte, Footer, aktive Auswahl |
| surface-card | `#FFFFFF` | Helle Karten, Inputs |
| text-primary | `#18181B` | Text auf hell, Paket-B-Button |
| text-secondary | `#57534E` | Fließtext auf hell |
| text-on-dark | `#F9F8F6` | Text auf dunkel |
| text-on-dark-muted | `#D6D3D1` | Fließtext auf dunkel |
| accent | `#9A7B4F` | Messing: Labels, Icons, Rahmen, Primär-Buttons |
| accent-hover | `#866941` | Hover Primär-Button |
| accent-hover-light | `#B08F60` | Hover Paket-A-Button |
| accent-italic-hero | `#D9C3A0` | Kursiv-Wort in der H1 |
| line | `#E5E0D8` | Haarlinien |
| error | `#9A3412` | Validierungsfehler |

### Typografie
Schriften (lokal via @fontsource): `Cormorant Garamond` (500, 600, jeweils regular + italic) und `Plus Jakarta Sans` (400, 500, 600).
| Rolle | Font | Größe / Gewicht / Zeilenhöhe |
|---|---|---|
| H1 | Cormorant 500 | `clamp(40px, 5.4vw, 64px)` / 1.1 / tracking −0.01em |
| H2 | Cormorant 500 | `clamp(34px, 4.2vw, 50px)` / 1.1 |
| H3 Karten | Cormorant 600 | 24–26px (Problem, Ablauf), 34px (Pakete) |
| Römische Zahlen | Cormorant 500 | 48px, `#9A7B4F` |
| Preise | Cormorant 500 | 56px / 1 |
| Modal-Headline | Cormorant 500 | 30px / 1.15 |
| FAQ-Frage | Cormorant 600 | `clamp(20px, 2.2vw, 24px)` |
| Micro-Label | Jakarta 600 | 11px, uppercase, tracking 0.22em, `#9A7B4F` |
| Body | Jakarta 400 | 15–18px / 1.65–1.75 |
| Buttons | Jakarta 600 | 12px, uppercase, tracking 0.12–0.16em |
| Form-Labels | Jakarta 600 | 11px, uppercase, tracking 0.16em, `#57534E` |

Schlüsselwörter in Headlines werden in *Italic* gesetzt (`<em>`).

