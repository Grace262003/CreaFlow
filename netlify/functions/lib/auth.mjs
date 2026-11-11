import { createHmac, timingSafeEqual } from 'node:crypto';
const b64 = (x) => Buffer.from(x).toString('base64url');
export function sign(payload, secret, ttl = 8 * 3600) {
  if (!secret) throw new Error('JWT_SECRET manquant');
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl }));
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}
export function verify(token, secret) {
  try {
    if (!secret) return null;
    const [body, sig] = String(token).split('.');
    const good = createHmac('sha256', secret).update(body).digest('base64url');
    if (!sig || sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() / 1000 ? p : null;
  } catch { return null; }
}
export function same(a, b) {
  const h = (v) => createHmac('sha256', 'cmp').update(String(v)).digest();
  return timingSafeEqual(h(a), h(b));
}
