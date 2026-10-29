import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { LeadStatus, StoredLead } from './src/types';
import { DEPOSIT_AMOUNT, PILOT_SPOTS } from './src/config/pricing';
import { validateCompanyLead, validateEvent, validatePrivateLead, type ValidationResult } from './server/validation';
import { clearLeads, readEvents, readLeads, recordEvent, saveLead, updateLead } from './server/storage';
import { forwardToWebhook, getNotificationStatus, sendLeadMail } from './server/notify';
import { rateLimit, requireAdmin } from './server/security';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Hinter dem Load Balancer (Cloud Run) die echte Client-IP für das Rate-Limit verwenden
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));

const LEAD_STATUSES: LeadStatus[] = ['neu', 'kontaktiert', 'in_route', 'abgeschlossen'];

// -----------------------------------------------------------------------
// ÖFFENTLICHE ROUTEN
// -----------------------------------------------------------------------

app.get('/api/config', (_req, res) => {
  const depositUrl = process.env.STRIPE_DEPOSIT_URL;
  res.json({
    depositUrl: depositUrl?.startsWith('https://') ? depositUrl : null,
    depositAmount: DEPOSIT_AMOUNT,
  });
});

// Echte Anzahl Reservierungen für die Platz-Anzeige im Header (keine personenbezogenen Daten)
app.get('/api/stats', (_req, res) => {
  const reserved = readLeads().filter((l) => l.kind === 'private').length;
  res.json({ reserved, spots: PILOT_SPOTS });
});

async function acceptLead<T extends StoredLead>(result: ValidationResult<T>, res: express.Response) {
  if (!result.ok) {
    return res.status(400).json({ success: false, errors: result.errors });
  }

  const lead = result.value;
  if (result.isSpam) {
    // Honeypot gefüllt: Bot bekommt eine normale Antwort, es wird nichts gespeichert
    return res.json({ success: true, lead });
  }

  let saved = false;
  try {
    saveLead(lead);
    saved = true;
  } catch (err) {
    console.error('[Server] Lead konnte nicht gespeichert werden:', err);
  }
  const [webhookSent, emailSent] = await Promise.all([forwardToWebhook(lead), sendLeadMail(lead)]);
  console.log(`[Server] Lead ${lead.id} angenommen (Datei: ${saved}, Webhook: ${webhookSent}, E-Mail: ${emailSent})`);

  if (!saved && !webhookSent && !emailSent) {
    return res.status(500).json({ success: false, errors: { server: 'Speichern fehlgeschlagen.' } });
  }
  res.json({ success: true, lead, delivered: { file: saved, webhook: webhookSent, email: emailSent } });
}

app.post('/api/leads', rateLimit(5, 10 * 60 * 1000), (req, res) => {
  void acceptLead(validatePrivateLead(req.body), res);
});

app.post('/api/company-leads', rateLimit(5, 10 * 60 * 1000), (req, res) => {
  void acceptLead(validateCompanyLead(req.body), res);
});

app.post('/api/events', rateLimit(120, 10 * 60 * 1000), (req, res) => {
  const key = validateEvent(req.body);
  if (!key) return res.status(400).json({ error: 'Unbekanntes Event.' });
  try {
    recordEvent(key);
  } catch (err) {
    console.error('[Server] Event konnte nicht gezählt werden:', err);
  }
  res.status(204).end();
});

// -----------------------------------------------------------------------
// ADMIN-ROUTEN (Bearer-Token)
// -----------------------------------------------------------------------

const admin = express.Router();
admin.use(requireAdmin);

admin.get('/leads', (_req, res) => {
  res.json(readLeads());
});

admin.patch('/leads/:id', (req, res) => {
  const patch: { status?: LeadStatus; notes?: string } = {};
  if (LEAD_STATUSES.includes(req.body?.status)) patch.status = req.body.status;
  if (typeof req.body?.notes === 'string') patch.notes = req.body.notes.slice(0, 2000);

  const updated = updateLead(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Lead nicht gefunden.' });
  res.json(updated);
});

admin.delete('/leads', (_req, res) => {
  clearLeads();
  res.status(204).end();
});

admin.get('/events', (_req, res) => {
  res.json(readEvents());
});

admin.get('/status', (_req, res) => {
  res.json(getNotificationStatus());
});

admin.post('/test-mail', async (_req, res) => {
  const result = validatePrivateLead({
    package: 'B',
    priceVariant: 'standard',
    preferences: { brand: 'Test' },
    handover: { option: 'office_monday', company: 'Testkanzlei', colleaguesCount: 3 },
    survey: {},
    contact: { plz: '70173', name: 'Test-Interessent', email: 'test@example.com', phone: null },
    attribution: { utm_source: 'admin-test' },
  });
  if (!result.ok) return res.status(500).json({ error: 'Test-Lead ungültig.' });
  const emailSent = await sendLeadMail(result.value);
  res.json({ emailSent, recipient: getNotificationStatus().recipient });
});

app.use('/api/admin', admin);

// Unbekannte API-Pfade (z. B. das frühere offene GET /api/leads) nicht als SPA-HTML beantworten
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Nicht gefunden.' });
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
