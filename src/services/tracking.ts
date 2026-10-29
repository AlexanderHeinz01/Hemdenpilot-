import type { TrackingEvent } from '../config/options';

// Cookieloses Tracking: Der Server zählt nur Events pro Tag, ohne IP oder Personenbezug.
export function track(name: TrackingEvent, detail?: string) {
  const body = JSON.stringify(detail ? { name, detail } : { name });
  try {
    if (navigator.sendBeacon?.('/api/events', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    // Fallback unten
  }
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

// Zählt ein Event nur einmal pro Browser-Sitzung (Basis für Raten wie Klicks je Besuch)
function trackOncePerSession(flag: string, name: TrackingEvent) {
  try {
    if (sessionStorage.getItem(flag)) return;
    sessionStorage.setItem(flag, '1');
  } catch {
    // ohne sessionStorage wird jeder Aufruf gezählt
  }
  track(name);
}

export function trackPageViewOnce() {
  trackOncePerSession('hp_pv', 'page_view');
}

// Erste Paketwahl der Sitzung – so bleibt die Klickrate ≤ 100 % und zeigt die spontane Präferenz
export function trackFirstPackageChoice(pkg: 'A' | 'B') {
  trackOncePerSession('hp_pkg', pkg === 'B' ? 'select_package_B' : 'select_package_A');
}
