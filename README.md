# Handoff: Hemdenpilot Landingpage (A/B-Smoke-Test, Stuttgart)

## Overview
Single-Page-Landingpage für den Business-Hemden-Service **Hemdenpilot** (Pilotstart Stuttgart). Ziel ist ein A/B-Smoke-Test: Über einen 3-Schritte-Konfigurator (Modal) wird gemessen, ob Nutzer **Paket B (Eigene Hemden, 79 €/Monat)** oder **Paket A (inkl. 15 Premium-Hemden, 119 €/Monat)** bevorzugen. Zusätzlich wird B2C (Wohnungstür) vs. B2B (Büro-Empfang) getestet.

Zielrepo: `AlexanderHeinz01/Hemdenpilot-` (React 19, Vite, Tailwind v4, lucide-react). Die bestehenden Komponenten in `src/components/` sollen ersetzt bzw. überarbeitet werden. Struktur und Dateinamen bleiben erhalten.

## About the Design Files
`Hemdenpilot Landing.dc.html` ist eine **Design-Referenz in HTML**. Sie ist ein Prototyp, der Aussehen und Verhalten zeigt, und kein Produktionscode zum Kopieren. Aufgabe: Das Design im bestehenden Repo nachbauen, mit React, Tailwind-Klassen und `lucide-react`-Icons. Die Datei läuft lokal im Browser, wenn `support.js` und `image-slot.js` im selben Ordner liegen. Alle Styles stehen inline. Die Logik steht im `<script data-dc-script>`-Block (Klasse `Component`, `renderVals()`).

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Copy und Interaktionen sind final. Bitte pixelgenau umsetzen.

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
Google Fonts: `Cormorant Garamond` (500, 600, jeweils regular + italic) und `Plus Jakarta Sans` (400, 500, 600).
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

## Screens / Sektionen (Reihenfolge = `App.tsx`)

### 1. Header (`Header.tsx`), fixed, h-20
- `bg-[#0B111E]/95 backdrop-blur-md border-b border-white/10`.
- Links: Wortmarke „HEMDENPILOT“ (Cormorant 600, 20px, tracking 0.15em). Darunter „EXECUTIVE VALET • STUTTGART“ (9px, tracking 0.22em, 55 % Deckkraft).
- Mitte (ab 1080px): „Das Prinzip“ → `#ablauf`, „Leistungsvergleich“ → `#vergleich`, „Modelle & Preise“ → `#pakete`, „FAQ“ → `#faq`. 12px, 72 % Deckkraft, Hover in Messing.
- Rechts (ab 1080px): pulsierender Messing-Punkt (6px, Keyframe opacity 1 → .35 und scale 1 → .7, 2s infinite) + „Pilotphase Stuttgart: **14 von 50** Plätzen frei“. Die Zahl ist konfigurierbar.
- Button „Verfügbarkeit prüfen“: transparenter Hintergrund, 1px Rahmen in Messing, Hover mit Messing-Fläche. Scrollt zu `#pakete`.
- Scroll-Offset für alle Anker: −80px wegen des fixen Headers.

### 2. Hero (`Hero.tsx`), `bg-[#0B111E]`
- Grid mit zwei Spalten ab etwa 900px, gap 56–96px.
- Badge: „EXKLUSIVER PILOTSTART IN STUTTGART“ mit Rahmen `#9A7B4F/50`.
- H1: „Jeden Montagmorgen fünf *makellos gebügelte* Hemden im Schrank.“
- Subline (18px, `#D6D3D1`, max-w 560px): „Der erste vollautomatische Hemden-Autopilot für Partner, Berater und Führungskräfte in Stuttgart. Wir tauschen jeden Sonntagabend kontaktlos an Ihrer Tür – oder montags am Empfang Ihrer Kanzlei – fünf getragene gegen fünf frisch aufbereitete Business-Hemden.“
- CTA „Wunsch-Modell & PLZ prüfen →“: `bg-[#9A7B4F] text-[#0B111E] px-8 py-[18px]`. **Öffnet das Modal** mit dem vorgewählten Paket (Standard A).
- Trust-Leiste (border-top, flex-wrap, gap 16/32), Icons 18px, stroke 1.5, Messing:
  - `ShieldCheck`: 100 % Kontaktloser Tausch
  - `Shirt`: Hängend geliefert (Keine Legebrüche)
  - `Clock`: Monatlich flexibel pausier- & kündbar
- Rechts: Bild im Format 4:5 mit linker Haarlinie `#9A7B4F/35`. Motiv: 5 gestärkte weiße und hellblaue Hemden auf Walnussbügeln, warmes Licht. Detail-Badge unten links überlappend: `bg-[#0B111E] border-[#9A7B4F]/40 p-5`, Cormorant italic 20px: „„0 Minuten Zeitaufwand pro Woche. Kein Buchen. Kein Kassenzettel.““

### 3. Problem (`ProblemComparison.tsx`), `id="vergleich"`, `bg-[#F9F8F6]`
- Label „WARUM BESTEHENDE LÖSUNGEN SCHEITERN“, H2 „Ihre Zeit ist zu kostbar für Öffnungszeiten und Paketstationen.“ (linksbündig, max-w 760px).
- 3-spaltiges Grid mit `gap-px bg-[#E5E0D8] border` (ergibt Haarlinien zwischen den Zellen). Zellen weiß, padding 32–48px.
- Jede Karte: Nummer 01–03 (Cormorant 22px, Messing), H3, Text, Verlust-Indikator unten (border-top, 11px uppercase, 16px-Messinglinie davor).
  1. Selbst waschen & bügeln | „Ein Hemd perfekt zu bügeln kostet 8 Minuten. Bei 20 Hemden im Monat opfern Sie über 3 Stunden Ihrer Wochenend-Freizeit am Bügelbrett.“ | `~ 3,5 Std. Zeitverlust / Monat`
  2. Die lokale Reinigung | „Parkplatzsuche vor 18:30 Uhr, Kassenzettel aufbewahren und samstags wieder abholen. Vergessen Sie es einmal, fehlt am Montagmorgen das frische Hemd.“ | `8 Wege & Terminstress / Monat`
  3. Paket-Versanddienste | „Hemden kommen gefaltet im Pappkarton zurück – inklusive unschöner Legebrüche auf der Brust. Den Karton müssen Sie trotzdem selbst zur Packstation bringen.“ | `Legebrüche & Paket-Aufwand`

### 4. Ablauf (`HowItWorks.tsx`), `id="ablauf"`, `bg-[#F2EFE9]`
- Label „DER WÖCHENTLICHE RHYTHMUS“, H2 „Einmal einrichten. *Nie wieder* daran denken.“
- 3 Spalten (gap 48px), jeweils `border-top 1px rgba(154,123,79,.45) pt-8`. Römische Zahl, H3, Text:
  - I. Persönliches Setup wählen: „Sie entscheiden einmalig, ob Sie Ihre eigenen Lieblingshemden in unseren Kreislauf geben oder sich 15 fabrikneue Premium-Hemden (Weiß & Hellblau) exklusiv von uns bereitstellen lassen.“
  - II. Kontaktloser Tausch am Fixtag: „Jeden Sonntagabend (an Ihrer Wohnungstür im blickdichten Canvas-Kleidersack) oder Montagmorgen (am Empfang Ihres Büros) tauschen wir 5 getragene gegen 5 frisch gebügelte Hemden.“
  - III. Makellos durch die Arbeitswoche: „Jedes Hemd wird schonend gewaschen, von Hand nachgebügelt und auf Qualitätsbügeln geliefert. Lockere Knöpfe nähen wir automatisch und kostenlos nach.“

### 5. Pakete (`Packages.tsx`), `id="pakete"`, `bg-[#F9F8F6]`
- Zentriert: Label „KONFIGURATION FÜR DEN PILOTSTART“, H2 „Wählen Sie Ihr bevorzugtes *Rotations-Modell*“. Subline: „Beide Modelle beinhalten sämtliche wöchentlichen Kurierfahrten in Stuttgart sowie unsere Knopf- und Kragenpflege. Keine Mindestvertragslaufzeit.“
- `grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch`. Karten als flex-col, die Feature-Liste füllt den Raum (`flex-1`), damit die Buttons auf einer Linie stehen.
- Aufbau je Karte: Tag → „PAKET X“ (Label) → H3 34px → Untertitel → Preisblock (border-top/bottom, py-6) → 4 Features (`Check` 16px, Messing, Titel fett) → Button volle Breite (py-[18px]).
- **Paket B, links:** weiß, `border-[#E5E0D8]`. Tag „EIGENER BESTAND“ (grauer Rahmen). Titel „Der Logistik-Autopilot“, 79 € „/ Monat (inkl. MwSt. & Kurier)“. Button `bg-[#18181B] text-white hover:bg-stone-800`: „Paket B (Eigene Hemden) wählen →“.
- **Paket A, rechts:** `bg-[#0B111E] border-[#9A7B4F]/60`. Eck-Badge oben rechts (`bg-[#9A7B4F] text-[#0B111E]`, 10px): „RUNDUM-SORGLOS • KEIN FREMDPOOL“. Tag „INKL. 15 PREMIUM-HEMDEN“. Titel „Die Executive-Rotation“, 119 € „/ Monat (inkl. MwSt., Hemden & Kurier)“. Button `bg-[#9A7B4F] text-[#0B111E] hover:bg-[#b08f60]`: „Paket A (Inkl. Hemden) wählen →“.
- Feature-Texte: siehe `featuresA` / `featuresB` im Logic-Block der Referenzdatei. Sie stehen dort wörtlich.

### 6. PLZ-Check (`PlzCheckerSection.tsx`), `id="plz-check"`, `bg-[#F2EFE9]`
- Vollständig in die neue Ästhetik übertragen: keine Sky-, Emerald- oder Amber-Farben und keine Radien mehr.
- Input und Button direkt aneinander, max-w 560px. Input weiß, Fokus-Rahmen in Messing. Button „Prüfen“ `bg-[#0B111E]`.
- Ergebnis-Karte bei 5 Ziffern (live): „PLZ xxxxx · Stadtteil“ plus Status. Aktiv: Messing-Text und -Rahmen, „Pilot-Route aktiv · noch n Plätze frei“. In Vorbereitung: grau, „… noch n Reservierungen bis zum Tour-Start“. Außerhalb: „Aktuell nur in Stuttgart aktiv · Vormerkung möglich“. Button „Reservieren →“ öffnet das Modal mit vorausgefüllter PLZ.
- Darunter ein 2-Spalten-Grid mit `gap-px`: „Aktive Pilot-Touren / SOFORT BUCHBAR“ und „In Vorbereitung / START AB 15 VORMERKUNGEN“, jeweils mit PLZ-Chips. Klick auf einen Chip füllt die Suche.
- Daten: `src/data/mockRoutes.ts` unverändert weiterverwenden.

### 7. FAQ (`FaqSection.tsx`), `id="faq"`
- Label „EXECUTIVE FAQ“, H2 „Ihre Fragen, *klar beantwortet*“.
- Akkordeon mit `border-t` plus `border-b` je Eintrag. Button py-7, Frage links, `Plus`/`Minus` (20px, stroke 1.5, Messing) rechts. Erste Frage standardmäßig offen, immer nur eine offen.
- Texte der 4 Fragen und Antworten: Array `FAQS` in der Referenzdatei.

### 8. Footer (`Footer.tsx`), `bg-[#0B111E]`
- Wortmarke, Claim, Links Impressum / Datenschutz / AGB. Sie öffnen ein Legal-Modal (Inhalte: `LEGAL` in der Referenzdatei, jetzt in Sie-Form).
- Copyright-Zeile 10px uppercase, 45 % Deckkraft.

## Konfigurator-Modal (`FunnelModal.tsx`)
- Overlay `fixed inset-0 z-50 bg-[#0B111E]/72 backdrop-blur`, scrollbar. Ein Klick außerhalb schließt das Modal. Während das Modal offen ist, gilt `body overflow:hidden`.
- Panel: `bg-[#F9F8F6] border-[#E5E0D8] max-w-xl w-full p-7 md:p-10`.
- Kopf: „SCHRITT X VON 3“ bzw. „BESTÄTIGUNG“ (Label), X-Button. Darunter 3 Fortschrittsbalken (2px hoch, erreichte Schritte in Messing, sonst `#E5E0D8`).
- Paket-Toggle: „Gewählt:“ plus eine Segment-Gruppe (weiß, Rahmen, p-[3px]) mit „Paket A (119 €)“ und „Paket B (79 €)“. Aktiv: `bg-[#0B111E] text-[#F9F8F6]`. Ein Wechsel feuert `package_switched`.
- Auswahl-Buttons allgemein: inaktiv weiß mit `border-[#E5E0D8]`, aktiv `bg-[#0B111E] text-[#F9F8F6]`, Hover-Rahmen in Messing.

**Schritt 1 – „Ihre Passform & *Marken-Präferenz*“**
- Kragenweite: 7er-Grid `38 39 40 41 42 43 44+` (Standard 40).
- Schnitt: `Slim Fit | Modern / Tailored Fit | Regular Fit` (Standard Modern).
- Nur bei Paket A, Farb-Mix: `5x Weiß | 3x Weiß / 2x Hellblau | 5x Hellblau` (Standard Mix).
- Marke: Chips `Eton Olymp Eterna Seidensticker Maßhemd` plus freies Feld „Andere Marke (optional)“. Ist das Feld befüllt, wird kein Chip als aktiv markiert.
- Button „Weiter zum Übergabeort →“.

**Schritt 2 – „Wo sollen wir Ihre 5 Hemden *wöchentlich tauschen*?“**
- 2 Radio-Cards (weiß, p-[22px], ausgewählt mit Messing-Rahmen, eckiger Radio-Indikator 16px mit 8px-Füllung):
  - Privatadresse an der Wohnungstür: „Jeden Sonntagabend zwischen 18:00 und 21:00 Uhr – kontaktlos im Kleidersack“
  - Büro- oder Kanzlei-Empfang: „Jeden Montagmorgen bis 09:00 Uhr – ideal für Teams & Kanzleien“
- Nur bei „Büro“: Checkbox-Box (`bg-[#F2EFE9]`) mit dem Text „In meinem Büro/meiner Kanzlei gäbe es potenziell 3+ weitere Kollegen mit Interesse (B2B-Sonderkonditionen).“
- Buttons im Raster 1:2: „← Zurück“ (weiß) und „Weiter zur PLZ-Prüfung →“.

**Schritt 3 – „Sichern Sie sich Ihren Pilotplatz mit *50 % Start-Vorteil*.“**
- Subtext: „Wir schalten im nächsten Monat die neuen Kurier-Routen in Stuttgart frei. Reservieren Sie sich unverbindlich einen der 50 Plätze und testen Sie den ersten Monat zum halben Preis (39,50 € bzw. 59,50 €).“
- Felder: PLZ* (nur Ziffern, max. 5), Vor- und Nachname*, E-Mail*, Mobilnummer (optional).
- Validierung beim Absenden (`noValidate`):
  - PLZ `^\d{5}$`, sonst „Bitte eine 5-stellige Postleitzahl eingeben.“
  - Name mindestens 3 Zeichen, sonst „Bitte Vor- und Nachnamen eingeben.“
  - E-Mail per einfacher Regex, sonst „Bitte eine gültige E-Mail-Adresse eingeben.“
  - Bei Fehler: Rahmen und Fehlertext in `#9A3412` direkt unter dem Feld.
- Submit „Pilotplatz & 50 % Rabatt unverbindlich reservieren“. Ladezustand „Wird reserviert …“ mit opacity .6 und 500 ms simulierter Latenz. Darunter der Textlink „← Zurück zum Übergabeort“.

**Schritt 4 – Bestätigung**
- Check-Icon in einem 56px-Quadrat mit Messing-Rahmen, „Ihr Pilotplatz ist *reserviert*.“, persönlicher Text mit Name, PLZ und Preis des ersten Monats.
- Zusammenfassungstabelle: ID, Modell, Kragenweite & Schnitt, Farb-Mix (nur A), Marke, Übergabeort, B2B-Interesse (falls angehakt), PLZ.
- Button „Schließen“ in `#0B111E`.

## Tracking und Datenmodell
Events (`console.log` plus `window.gtag`, falls vorhanden):
- `select_package_A` / `select_package_B` beim Öffnen des Modals, auch über den Hero-CTA und den PLZ-Check.
- `package_switched` beim Wechsel im Modal.
- `lead_reserved` mit dem vollständigen Payload beim Absenden.

Neues `LeadData` (ersetzt den Typ in `src/types.ts`):
```ts
type PackageType = 'A' | 'B';
interface LeadData {
  id: string;                 // `HP-${plz}-${4 Ziffern}`
  event: 'lead_reserved';
  package: PackageType;
  packageName: string;        // 'Paket A – Die Executive-Rotation' | 'Paket B – Der Logistik-Autopilot'
  pricePerMonth: 119 | 79;
  firstMonthPrice: 59.5 | 39.5;
  preferences: { collarSize: string; fit: string; colorMix: string | null; brand: string };
  handover:
    | { type: 'B2C'; location: string; slot: 'Sonntag 18:00–21:00' }
    | { type: 'B2B'; location: string; slot: 'Montag bis 09:00'; colleaguesInterested: boolean };
  contact: { plz: string; name: string; email: string; phone: string | null };
  city: 'Stuttgart';
  createdAt: string;          // ISO
}
```
Speicherung: `localStorage['hemdenpilot_leads']`, neueste zuerst. In der Produktion kommt ein Webhook oder Supabase-Insert an dieselbe Stelle in `handleSubmit`.

## State (App-Ebene)
`isFunnelOpen`, `selectedPackage`, optional `prefillPlz` (aus dem PLZ-Check), `lastUpdatedLeads`.
Im Modal: `step (1–4)`, `size`, `fit`, `mix`, `brand`, `customBrand`, `dropoff ('home'|'office')`, `colleagues`, `plz`, `name`, `email`, `phone`, `errors`, `isSubmitting`, `confirmedLead`. Beim Öffnen werden `step=1` und `confirmedLead=null` gesetzt. Die Eingaben bleiben erhalten, die PLZ wird gegebenenfalls vorausgefüllt.

## Admin-Lead-Drawer (`AdminLeadDrawer.tsx`)
Unten rechts fixiert. Geschlossen: Button `bg-[#0B111E]` mit `Database`-Icon, „Pilot-Leads (n)“. Geöffnet: Panel 360px mit Lead-Liste (ID, PLZ, Name · E-Mail, Paket · Größe · Übergabe), „CSV-Export“ (UTF-8 mit BOM, alle Felder) und „Löschen“ (mit Rückfrage). Für die Produktion hinter einem Flag (`?admin=1`) verstecken.

## Responsive
- Ab 1080px: Nav-Links und Plätze-Indikator im Header sichtbar.
- Grids nutzen `repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`, in Tailwind etwa `md:grid-cols-3` (Problem, Ablauf), `lg:grid-cols-2` (Hero, Pakete) und `md:grid-cols-2` (PLZ-Listen).
- Seitenränder `clamp(20px, 4vw, 32px)`, Sektionsabstand `clamp(96px, 10vw, 128px)`.

## Assets
- Icons: `lucide-react` (ShieldCheck, Shirt, Clock, Check, Plus, Minus, X, Database).
- Hero-Bild: **noch offen**. Hochformat 4:5, mindestens 1200×1500 px. Motiv siehe oben. In der Referenz ist es ein Platzhalter (`image-slot.js`), in der Produktion wird daraus ein `<img>` mit `object-cover`.
- Fonts über Google Fonts in `index.html`: Cormorant Garamond und Plus Jakarta Sans. Playfair Display und JetBrains Mono werden nicht mehr gebraucht.
- `index.css`: Die Heading-Font auf `'Cormorant Garamond'` umstellen, Body-Farbe `#18181B`.

## Files
- `Hemdenpilot Landing.dc.html`: vollständige Referenz (Markup, Copy, Logik, Validierung, Tracking).
- `support.js`, `image-slot.js`: nur nötig, um die Referenz lokal im Browser zu öffnen.
