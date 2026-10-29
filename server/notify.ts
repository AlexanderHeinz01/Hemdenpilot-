import type { CompanyLead, LeadData, StoredLead } from '../src/types';
import { formatEuro } from '../src/config/pricing';
import {
  CURRENT_SOLUTION_OPTIONS,
  MONTHLY_SPEND_OPTIONS,
  SHIRT_COUNT_OPTIONS,
  SUBSIDY_OPTIONS,
} from '../src/config/options';

const DEFAULT_RECIPIENT = 'info@alexander-heinz.de';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveTargetEmail(): string {
  const envVal = (process.env.LEAD_NOTIFICATION_EMAIL || '').trim();
  // Schutz gegen versehentlich eingetragenen API-Key statt E-Mail-Adresse
  if (envVal && !envVal.startsWith('re_') && envVal.includes('@')) return envVal;
  return DEFAULT_RECIPIENT;
}

export function getNotificationStatus() {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY?.startsWith('re_'));
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const isSandbox = fromEmail.includes('resend.dev');
  // Im Resend-Sandbox-Modus akzeptiert Resend nur die E-Mail-Adresse des Resend-Kontos
  const sandboxRecipient = (process.env.RESEND_ACCOUNT_EMAIL || '').trim() || resolveTargetEmail();
  return {
    resendConfigured,
    mode: isSandbox ? 'sandbox' : 'production',
    recipient: isSandbox ? sandboxRecipient : resolveTargetEmail(),
    fromEmail,
    webhookConfigured: Boolean(process.env.LEAD_WEBHOOK_URL?.startsWith('https://')),
    depositConfigured: Boolean(process.env.STRIPE_DEPOSIT_URL?.startsWith('https://')),
  };
}

function row(label: string, value: string, highlight = false): string {
  return `
    <tr style="border-bottom: 1px solid #F2EFE9;">
      <td style="padding: 12px 16px; color: #57534E; width: 190px; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 12px 16px; ${highlight ? 'font-weight: 700; color: #9A7B4F;' : 'color: #18181B;'}">${value}</td>
    </tr>`;
}

function layout(kicker: string, title: string, rows: string, email: string, subjectForReply: string): string {
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subjectForReply)}`;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #F9F8F6; padding: 32px; border: 1px solid #E5E0D8;">
      <div style="border-bottom: 2px solid #9A7B4F; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #9A7B4F; display: block; margin-bottom: 4px;">${escapeHtml(kicker)}</span>
        <h2 style="color: #0B111E; font-size: 26px; margin: 0; font-weight: 600;">${escapeHtml(title)}</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: #FFFFFF; border: 1px solid #E5E0D8;">${rows}</table>
      <div style="margin-top: 28px; text-align: center;">
        <a href="${escapeHtml(mailto)}" style="display: inline-block; background: #0B111E; color: #F9F8F6; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">Kontakt aufnehmen →</a>
      </div>
      <p style="font-size: 11px; color: #78716C; text-align: center; margin-top: 24px;">Hemdenpilot · Alexander Heinz · Walstieg 3, 21077 Hamburg</p>
    </div>`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
}

function privateLeadMail(lead: LeadData) {
  const isA = lead.package === 'A';
  const h = lead.handover;
  const s = lead.survey;
  const priceText =
    `${formatEuro(lead.pricePerMonth)} / Monat (1. Monat: ${formatEuro(lead.firstMonthPrice)})` +
    (lead.setupFee ? ` + ${formatEuro(lead.setupFee)} Erstausstattung` : '') +
    (lead.priceVariant !== 'standard' ? ` · Preistest ${lead.priceVariant}` : '');

  const rows = [
    row('Reservierungs-ID', escapeHtml(lead.id)),
    row('Modell', escapeHtml(lead.packageName), true),
    row('Preis', escapeHtml(priceText)),
    row('Name', escapeHtml(lead.contact.name)),
    row('E-Mail', escapeHtml(lead.contact.email)),
    row('Telefon', escapeHtml(lead.contact.phone || 'Keine Angabe')),
    row('PLZ', `${escapeHtml(lead.contact.plz)} Stuttgart`),
    row('Übergabe', escapeHtml(`${h.location} (${h.slot})`)),
    h.type === 'B2B'
      ? row(
          'Firma / Kollegen',
          escapeHtml(`${h.company || 'Keine Angabe'} · ${h.colleaguesCount ?? 0}+ interessierte Kollegen`),
          (h.colleaguesCount ?? 0) >= 3
        )
      : '',
    row(
      'Passform & Marke',
      escapeHtml(
        isA
          ? `Kragenweite ${lead.preferences.collarSize} · ${lead.preferences.fit} · ${lead.preferences.colorMix || '-'} · ${lead.preferences.brand}`
          : `Eigene Hemden · ${lead.preferences.brand}`
      )
    ),
    row(
      'Umfrage',
      escapeHtml(
        [
          s.shirtCount ? `Hemden: ${SHIRT_COUNT_OPTIONS[s.shirtCount]}` : null,
          s.currentSolution ? `Heute: ${CURRENT_SOLUTION_OPTIONS[s.currentSolution]}` : null,
          s.monthlySpend ? `Ausgaben: ${MONTHLY_SPEND_OPTIONS[s.monthlySpend]}` : null,
          s.wantsSuits ? 'Interesse an Sakkos/Anzügen' : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'Keine Angaben'
      )
    ),
    row('Quelle', escapeHtml(lead.attribution.utm_source ? `${lead.attribution.utm_source} / ${lead.attribution.utm_campaign || '-'}` : 'Direkt / unbekannt')),
    row('Eingang', escapeHtml(formatDate(lead.createdAt))),
  ].join('');

  return {
    subject: `Neuer Hemdenpilot Lead: ${lead.contact.name} (${lead.contact.plz} · Paket ${lead.package})`,
    html: layout('Hemdenpilot Stuttgart · Neue Reservierung', 'Neuer Pilotplatz reserviert', rows, lead.contact.email, `Ihre Hemdenpilot-Reservierung (${lead.id})`),
    replyTo: lead.contact.email,
  };
}

function companyLeadMail(lead: CompanyLead) {
  const rows = [
    row('Anfrage-ID', escapeHtml(lead.id)),
    row('Unternehmen', escapeHtml(lead.company), true),
    row('Ansprechpartner', escapeHtml(`${lead.contactName}${lead.role ? ` (${lead.role})` : ''}`)),
    row('E-Mail', escapeHtml(lead.email)),
    row('Telefon', escapeHtml(lead.phone || 'Keine Angabe')),
    row('Standort-PLZ', `${escapeHtml(lead.plz)} Stuttgart`),
    row('Interessierte Mitarbeiter', escapeHtml(String(lead.employeesInterested)), lead.employeesInterested >= 4),
    row('Arbeitgeberzuschuss', escapeHtml(SUBSIDY_OPTIONS[lead.employerSubsidy])),
    row('Nachricht', escapeHtml(lead.message || '-')),
    row('Eingang', escapeHtml(formatDate(lead.createdAt))),
  ].join('');

  return {
    subject: `Neue Firmenanfrage Hemdenpilot: ${lead.company} (${lead.employeesInterested} Mitarbeiter)`,
    html: layout('Hemdenpilot Stuttgart · Firmenanfrage', 'Neue B2B-Anfrage', rows, lead.email, `Ihre Hemdenpilot-Anfrage (${lead.id})`),
    replyTo: lead.email,
  };
}

export async function sendLeadMail(lead: StoredLead): Promise<boolean> {
  const status = getNotificationStatus();
  if (!status.resendConfigured) {
    console.log('[Mail] RESEND_API_KEY nicht gesetzt – keine E-Mail versendet.');
    return false;
  }

  const mail = lead.kind === 'company' ? companyLeadMail(lead) : privateLeadMail(lead);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: status.fromEmail,
        to: status.recipient,
        subject: mail.subject.replace(/[\r\n]+/g, ' '),
        html: mail.html,
        reply_to: mail.replyTo,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (res.ok && data.id) return true;
    console.warn('[Mail] Resend-Fehler:', data.message || res.status);
  } catch (err) {
    console.warn('[Mail] Versand fehlgeschlagen:', (err as Error).message);
  }
  return false;
}

// Leitet den Lead an einen Webhook (z. B. Make → Google Sheet) weiter. Das ist die
// dauerhafte Ablage, falls das Dateisystem des Hostings flüchtig ist.
export async function forwardToWebhook(lead: StoredLead): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url?.startsWith('https://')) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: lead.kind, lead }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return true;
    console.warn('[Webhook] Antwort', res.status);
  } catch (err) {
    console.warn('[Webhook] Fehlgeschlagen:', (err as Error).message);
  }
  return false;
}
