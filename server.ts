import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, '[]', 'utf-8');
}

// Helper to determine the target email address safely
function resolveTargetEmail(): string {
  const envVal = (process.env.LEAD_NOTIFICATION_EMAIL || '').trim();
  // Protect against misconfiguration where the API key was pasted into the email field
  if (envVal && !envVal.startsWith('re_') && envVal.includes('@')) {
    return envVal;
  }
  return 'info@alexander-heinz.de';
}

// -----------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------

// Get all leads (synced across all devices - phone & desktop)
app.get('/api/leads', (_req, res) => {
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    const leads = JSON.parse(raw || '[]');
    res.json(leads);
  } catch (err) {
    console.error('Failed to read leads:', err);
    res.status(500).json({ error: 'Failed to read leads' });
  }
});

// Check Resend Status
app.get('/api/resend-status', (_req, res) => {
  const hasKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_'));
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const isSandbox = fromEmail.includes('resend.dev');
  const targetEmail = isSandbox ? 'alexander84.heinz@googlemail.com' : resolveTargetEmail();
  res.json({
    configured: hasKey,
    recipient: targetEmail,
    mode: isSandbox ? 'sandbox' : 'production',
  });
});

// Post a new lead -> saves centrally + sends email via Resend
app.post('/api/leads', async (req, res) => {
  const lead = req.body;
  if (!lead || !lead.id) {
    return res.status(400).json({ error: 'Ungültige Lead-Daten' });
  }

  // 1. Save centrally on server (accessible from all devices)
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    const existingLeads: any[] = JSON.parse(raw || '[]');
    const deduplicated = existingLeads.filter((l) => l.id !== lead.id);
    const updated = [lead, ...deduplicated];
    fs.writeFileSync(LEADS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`[Server] Lead ${lead.id} saved to central leads.json`);
  } catch (err) {
    console.error('[Server] Failed to save lead locally:', err);
  }

  // 2. Dispatch via Resend REST API if API key is provided
  const resendApiKey = process.env.RESEND_API_KEY;
  let emailSent = false;
  let emailError: string | null = null;
  let resendId: string | null = null;
  let recipientUsed = '';

  if (resendApiKey) {
    try {
      const isA = lead.package === 'A';
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const isSandbox = fromEmail.includes('resend.dev');
      
      // In Resend sandbox mode, only verified account holder email is accepted
      recipientUsed = isSandbox ? 'alexander84.heinz@googlemail.com' : resolveTargetEmail();

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #F9F8F6; padding: 32px; border: 1px solid #E5E0D8;">
          <div style="border-bottom: 2px solid #9A7B4F; padding-bottom: 16px; margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #9A7B4F; display: block; margin-bottom: 4px;">
              HEMDENPILOT STUTTGART · NEUE RESERVIERUNG
            </span>
            <h2 style="color: #0B111E; font-size: 26px; margin: 0; font-weight: 600;">
              Neuer Pilotplatz reserviert
            </h2>
          </div>

          <p style="font-size: 15px; color: #18181B; margin-bottom: 20px;">
            Ein neuer Interessent hat sich soeben für den Hemdenpilot eingetragen:
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #18181B; background: #FFFFFF; border: 1px solid #E5E0D8;">
            <tr style="border-bottom: 1px solid #F2EFE9;">
              <td style="padding: 12px 16px; color: #57534E; width: 170px;">Reservierungs-ID:</td>
              <td style="padding: 12px 16px; font-weight: 700; color: #0B111E;">${lead.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9; background: #FBFBFA;">
              <td style="padding: 12px 16px; color: #57534E;">Gewähltes Modell:</td>
              <td style="padding: 12px 16px; font-weight: 700; color: #9A7B4F;">${lead.packageName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9;">
              <td style="padding: 12px 16px; color: #57534E;">Monatspreis / Start:</td>
              <td style="padding: 12px 16px;">${lead.pricePerMonth} € / Monat (1. Probemonat: ${lead.firstMonthPrice} €)</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9; background: #FBFBFA;">
              <td style="padding: 12px 16px; color: #57534E;">Kunde Name:</td>
              <td style="padding: 12px 16px; font-weight: 700;">${lead.contact?.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9;">
              <td style="padding: 12px 16px; color: #57534E;">E-Mail:</td>
              <td style="padding: 12px 16px;"><a href="mailto:${lead.contact?.email}" style="color: #9A7B4F; font-weight: 600;">${lead.contact?.email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9; background: #FBFBFA;">
              <td style="padding: 12px 16px; color: #57534E;">Telefon:</td>
              <td style="padding: 12px 16px;">${lead.contact?.phone || 'Keine Angabe'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9;">
              <td style="padding: 12px 16px; color: #57534E;">PLZ / Region:</td>
              <td style="padding: 12px 16px; font-weight: 600;">${lead.contact?.plz} Stuttgart</td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9; background: #FBFBFA;">
              <td style="padding: 12px 16px; color: #57534E;">Übergabeort:</td>
              <td style="padding: 12px 16px;">${lead.handover?.location} (${lead.handover?.slot})</td>
            </tr>
            ${
              lead.handover?.type === 'B2B' && lead.handover?.colleaguesInterested
                ? `
            <tr style="border-bottom: 1px solid #F2EFE9;">
              <td style="padding: 12px 16px; color: #57534E;">B2B Multiplikator:</td>
              <td style="padding: 12px 16px; color: #9A7B4F; font-weight: 700;">✓ 3+ Kollegen in Kanzlei/Firma interessiert</td>
            </tr>`
                : ''
            }
            <tr style="border-bottom: 1px solid #F2EFE9; background: #FBFBFA;">
              <td style="padding: 12px 16px; color: #57534E;">Passform &amp; Setup:</td>
              <td style="padding: 12px 16px;">
                ${
                  isA
                    ? `Kragenweite ${lead.preferences?.collarSize} · ${lead.preferences?.fit} · Mix: ${lead.preferences?.colorMix}`
                    : 'Eigene Hemden (Keine Größenangaben nötig)'
                }
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #F2EFE9;">
              <td style="padding: 12px 16px; color: #57534E;">Marken:</td>
              <td style="padding: 12px 16px;">${lead.preferences?.brand || 'Keine Angabe'}</td>
            </tr>
            <tr style="background: #FBFBFA;">
              <td style="padding: 12px 16px; color: #57534E;">Eingangsdatum:</td>
              <td style="padding: 12px 16px;">${new Date(lead.createdAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</td>
            </tr>
          </table>

          <div style="margin-top: 28px; text-align: center;">
            <a href="mailto:${lead.contact?.email}?subject=Ihre%20Hemdenpilot-Reservierung%20in%20Stuttgart%20(${lead.id})&body=Guten%20Tag%20${encodeURIComponent(lead.contact?.name || '')}," 
               style="display: inline-block; background: #0B111E; color: #F9F8F6; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
              Lead per E-Mail kontaktieren →
            </a>
          </div>

          <p style="font-size: 11px; color: #78716C; text-align: center; margin-top: 24px;">
            Hemdenpilot · Alexander Heinz · Walstieg 3, 21077 Hamburg
          </p>
        </div>
      `;

      // Direct REST API call - zero SDK noise or unwanted console.errors
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipientUsed,
          subject: `Neuer Hemdenpilot Lead: ${lead.contact?.name} (${lead.contact?.plz} Stuttgart · Paket ${lead.package})`,
          html: htmlBody,
          reply_to: lead.contact?.email,
        }),
      });

      const resData = (await resendRes.json()) as any;

      if (resendRes.ok && resData && resData.id) {
        emailSent = true;
        resendId = resData.id;
        console.log(`[Resend] Successfully delivered to ${recipientUsed} (ID: ${resendId})`);
      } else {
        emailError = resData?.message || 'Send error';
        console.log(`[Resend] Notice:`, resData?.message);
      }
    } catch (err) {
      emailError = (err as Error).message;
    }
  } else {
    console.log('[Server] RESEND_API_KEY is not set. Lead saved to central storage.');
  }

  res.json({
    success: true,
    savedCentrally: true,
    emailSent,
    resendId,
    recipientUsed,
    emailError,
  });
});

// -----------------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC PROD SERVING
// -----------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hemdenpilot] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
});
