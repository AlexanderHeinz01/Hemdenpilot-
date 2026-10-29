import type {
  CompanyLead,
  CompanyLeadSubmission,
  LeadData,
  LeadStatus,
  PrivateLeadSubmission,
  StoredLead,
} from '../types';

export const CONTACT_EMAIL = 'info@alexander-heinz.de';

export type SubmitResult<T> =
  | { ok: true; lead: T }
  | { ok: false; errors: Record<string, string> };

async function submit<T>(url: string, payload: unknown): Promise<SubmitResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.lead) return { ok: true, lead: data.lead as T };
    if (res.status === 429) {
      return { ok: false, errors: { server: 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.' } };
    }
    return { ok: false, errors: data.errors || { server: 'Die Übermittlung ist fehlgeschlagen.' } };
  } catch {
    return { ok: false, errors: { server: 'Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.' } };
  }
}

export function submitPrivateLead(payload: PrivateLeadSubmission) {
  return submit<LeadData>('/api/leads', payload);
}

export function submitCompanyLead(payload: CompanyLeadSubmission) {
  return submit<CompanyLead>('/api/company-leads', payload);
}

export async function fetchPublicConfig(): Promise<{ depositUrl: string | null; depositAmount: number } | null> {
  try {
    const res = await fetch('/api/config');
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchStats(): Promise<{ reserved: number; spots: number } | null> {
  try {
    const res = await fetch('/api/stats');
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------
// Admin-API (Bearer-Token, nur im Lead Management Center)
// -----------------------------------------------------------------------

export class AdminAuthError extends Error {}

export interface AdminStatus {
  resendConfigured: boolean;
  mode: 'sandbox' | 'production';
  recipient: string;
  webhookConfigured: boolean;
  depositConfigured: boolean;
}

async function adminFetch<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (res.status === 401) throw new AdminAuthError('Token ungültig.');
  if (res.status === 503) throw new AdminAuthError('ADMIN_TOKEN ist auf dem Server nicht gesetzt.');
  if (!res.ok) throw new Error(`Serverfehler ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const adminApi = {
  leads: (token: string) => adminFetch<StoredLead[]>(token, '/leads'),
  events: (token: string) => adminFetch<Record<string, Record<string, number>>>(token, '/events'),
  status: (token: string) => adminFetch<AdminStatus>(token, '/status'),
  updateLead: (token: string, id: string, patch: { status?: LeadStatus; notes?: string }) =>
    adminFetch<StoredLead>(token, `/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  clearLeads: (token: string) => adminFetch<void>(token, '/leads', { method: 'DELETE' }),
  testMail: (token: string) => adminFetch<{ emailSent: boolean; recipient: string }>(token, '/test-mail', { method: 'POST' }),
};
