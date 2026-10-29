export type LegalKey = 'impressum' | 'datenschutz' | 'agb';

// Öffnet das Rechtstext-Modal im Footer von überall auf der Seite (z. B. aus Formularen).
export function openLegal(key: LegalKey) {
  window.dispatchEvent(new CustomEvent<LegalKey>('hp:open-legal', { detail: key }));
}
