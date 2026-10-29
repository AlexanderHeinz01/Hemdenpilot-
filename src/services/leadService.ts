import { LeadData } from '../types';

export const RECIPIENT_EMAIL = 'info@alexander-heinz.de';
export const STORAGE_KEY = 'hemdenpilot_leads';
export const WEBHOOK_KEY = 'hemdenpilot_webhook_url';

export interface DispatchResult {
  emailSent: boolean;
  webhookSent: boolean;
  savedCentrally: boolean;
  resendId?: string;
  error?: string;
}

/**
 * Fetch all leads from central server storage (accessible from both phone and laptop)
 * Falls back to localStorage if offline.
 */
export async function fetchCentralLeads(): Promise<LeadData[]> {
  try {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const serverLeads: LeadData[] = await res.json();
      if (Array.isArray(serverLeads) && serverLeads.length > 0) {
        // Merge with local storage
        const local: LeadData[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const ids = new Set(serverLeads.map((l) => l.id));
        const combined = [...serverLeads];
        local.forEach((l) => {
          if (!ids.has(l.id)) combined.push(l);
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.log('[LeadService] Server fetch notice (using local storage):', err);
  }

  // Fallback to local storage
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

/**
 * Check if Resend is configured on the backend
 */
export async function checkResendStatus(): Promise<{ configured: boolean; recipient: string }> {
  try {
    const res = await fetch('/api/resend-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[LeadService] Error checking Resend status:', err);
  }
  return { configured: false, recipient: RECIPIENT_EMAIL };
}

/**
 * Dispatches a new lead:
 * 1. Saves to server /api/leads which triggers Resend transactional email
 * 2. Saves to localStorage archive
 * 3. Falls back to FormSubmit if Resend is not yet configured with an API key
 * 4. Dispatches to custom Webhook if configured
 */
export async function dispatchLead(lead: LeadData): Promise<DispatchResult> {
  const result: DispatchResult = {
    emailSent: false,
    webhookSent: false,
    savedCentrally: false,
  };

  // 1. Save to local storage archive immediately
  try {
    const existing: LeadData[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const deduplicated = existing.filter((item) => item.id !== lead.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([lead, ...deduplicated]));
  } catch (err) {
    console.error('[LeadService] LocalStorage archive error:', err);
  }

  // 2. Send to Server Endpoint (/api/leads) for Central Storage & Resend Email
  try {
    const serverRes = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });

    if (serverRes.ok) {
      const serverData = await serverRes.json();
      result.savedCentrally = Boolean(serverData.savedCentrally);
      if (serverData.emailSent) {
        result.emailSent = true;
        result.resendId = serverData.resendId;
        console.log('[LeadService] Lead sent via Resend API!');
      }
    }
  } catch (serverErr) {
    console.warn('[LeadService] Server dispatch notice:', serverErr);
  }

  // 3. If email not sent via Resend, attempt FormSubmit relay as secondary channel
  if (!result.emailSent) {
    const isA = lead.package === 'A';
    const emailPayload = {
      _subject: `Neuer Hemdenpilot Lead: ${lead.contact.name} (${lead.contact.plz} Stuttgart · Paket ${lead.package})`,
      _template: 'table',
      _captcha: 'false',
      _replyto: lead.contact.email,
      Reservierungs_ID: lead.id,
      Paket: lead.packageName,
      Monatspreis: `${lead.pricePerMonth} € / Monat`,
      Probemonat_Rabattpreis: `${lead.firstMonthPrice} € (50 % Pilot-Vorteil)`,
      Kunde_Name: lead.contact.name,
      Kunde_Email: lead.contact.email,
      Kunde_Telefon: lead.contact.phone || 'Keine Angabe',
      PLZ_Stadt: `${lead.contact.plz} Stuttgart`,
      Uebergabe_Ort: lead.handover.location,
      Uebergabe_Zeitfenster: lead.handover.slot,
      B2B_Kollegen_Interesse:
        lead.handover.type === 'B2B' && (lead.handover as any).colleaguesInterested
          ? 'Ja (3+ Kollegen im Büro/Kanzlei)'
          : 'Nein / Privatadresse',
      Passform_und_Groesse: isA
        ? `${lead.preferences.collarSize} · ${lead.preferences.fit}`
        : 'Eigene Hemden (Keine Größenangaben nötig)',
      Farb_Mix: lead.preferences.colorMix || 'Eigene Hemden',
      Hemden_Marke: lead.preferences.brand || 'Keine Angabe',
      Eingangsdatum: new Date(lead.createdAt).toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (response.ok) {
        result.emailSent = true;
      }
    } catch (e) {
      console.warn('[LeadService] FormSubmit notice:', e);
    }
  }

  // 4. Optional Webhook dispatch (Zapier, Make, n8n, Google Sheets)
  try {
    const webhookUrl = localStorage.getItem(WEBHOOK_KEY);
    if (webhookUrl && webhookUrl.startsWith('http')) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
        mode: 'no-cors',
      });
      result.webhookSent = true;
    }
  } catch (webhookErr) {
    console.warn('[LeadService] Webhook dispatch notice:', webhookErr);
  }

  return result;
}
