import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

// Schützt alle Admin-Routen per `Authorization: Bearer <ADMIN_TOKEN>`.
// Ohne gesetztes ADMIN_TOKEN bleiben die Routen gesperrt (fail closed).
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN || '';
  if (expected.length < 32) {
    return res.status(503).json({ error: 'Admin-Zugang nicht konfiguriert (ADMIN_TOKEN fehlt).' });
  }

  const header = req.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!provided || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Nicht autorisiert.' });
  }
  next();
}

// Einfaches In-Memory-Rate-Limit pro IP (reicht als Spam-Bremse für eine einzelne Instanz).
export function rateLimit(maxRequests: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({ error: 'Zu viele Anfragen. Bitte in einigen Minuten erneut versuchen.' });
    }

    recent.push(now);
    hits.set(key, recent);

    if (hits.size > 5000) {
      for (const [ip, times] of hits) {
        if (times.every((t) => now - t >= windowMs)) hits.delete(ip);
      }
    }
    next();
  };
}
