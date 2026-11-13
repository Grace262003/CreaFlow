import { neon } from '@neondatabase/serverless';
import { getStore } from '@netlify/blobs';
import { randomBytes, randomUUID } from 'node:crypto';
import { sign, verify, same, hashPassword, checkPassword } from './lib/auth.mjs';
import { receiptPdf } from './lib/pdf.mjs';
import { waNumber } from './lib/phone.mjs';

export const config = { path: '/api/*' };
const env = (k) => process.env[k] || '';
const q = (text, params = []) => neon(env('DATABASE_URL') || env('NETLIFY_DATABASE_URL')).query(text, params);
let SECRET = '';
/** Clé de signature des sessions admin : variable JWT_SECRET si elle existe, sinon clé générée et gardée dans la base. */
const secret = async () => {
  if (env('JWT_SECRET')) return env('JWT_SECRET');
  if (SECRET) return SECRET;
  const r = await q(`insert into settings(key,value) values('jwt_secret',$1) on conflict (key) do nothing returning value`, [randomBytes(32).toString('hex')]);
  SECRET = r[0]?.value || (await q(`select value from settings where key='jwt_secret'`))[0].value; return SECRET;
};
const envAdmin = () => !!(env('ADMIN_EMAIL') && env('ADMIN_PASSWORD'));
const okMail = (v) => /^\S+@\S+\.\S+$/.test(v);
const J = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const bad = (m, s = 400) => J({ error: m }, s);
const S = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const key8 = (p) => String(p).replace(/\D/g, '').slice(-8);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const site = () => env('SITE_URL') || env('URL');
const FED = () => (env('FEDAPAY_ENV') === 'live' ? 'https://api.fedapay.com/v1' : 'https://sandbox-api.fedapay.com/v1');
const fix = (o) => { const r = { ...o }; for (const k of ['total', 'paid', 'price', 'amount']) if (k in r) r[k] = r[k] == null ? null : Number(r[k]); return r; };
const M = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : NaN; };
const D = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : null);
const TZ = `'Africa/Porto-Novo'`;
const STATUTS = ['reçue', 'en cours', 'en production', 'prête', 'livrée', 'annulée'];
const SOURCES = ['site', 'boutique', 'WhatsApp', 'téléphone', 'autre'];
const log = (who, action, entity, id, detail) => q('insert into audit_log(actor,action,entity,entity_id,detail) values($1,$2,$3,$4,$5)', [who, action, entity, String(id ?? ''), S(detail, 1000)]).catch(() => {});
const recalc = async (id) => (await q(`update orders set paid=coalesce((select sum(amount) from payments where order_id=$1 and not voided),0) where id=$1 returning *`, [id]))[0];
const getPays = (id) => q('select * from payments where order_id=$1 and not voided order by paid_at, created_at', [id]);
const RNO = `'REC-'||to_char(now(),'YYYY')||'-'||lpad(nextval('receipt_seq')::text,4,'0')`;
const FILE_OK = /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats|text\/plain)/;
const MAX = 4 * 1024 * 1024;
const addCat = (name) => (name ? q('insert into gallery_categories(name,sort) select $1, coalesce(max(sort),0)+1 from gallery_categories on conflict (name) do nothing', [name]) : null);
const isDup = (e) => e?.code === '23505' || /unique|duplicate/i.test(String(e?.message));
const FORMS = ['print', 'binding', 'typing', 'admin', 'cv', 'photo', 'logo', 'design', 'banner', 'textile', 'goodies', 'generic'];
const opts = (v) => (Array.isArray(v) ? v : []).slice(0, 30).map((x) => ({ label: S(x?.label, 60), value: S(x?.value, 400) })).filter((x) => x.label && x.value);

async function mail(to, subject, html, attachments) {
  if (!env('RESEND_API_KEY') || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('RECEIPT_FROM') || 'Creaflow <onboarding@resend.dev>', to, subject, html, attachments }) });
    return r.ok;
  } catch { return false; }
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const notifyTo = async () => env('NOTIFY_EMAIL') || env('ADMIN_EMAIL') || (await q('select email from admin_users order by created_at limit 1').catch(() => []))[0]?.email || '';

async function makeReceipt(o, ref) {
  let opts = { number: o.code, title: 'RÉCAPITULATIF' };
  if (ref) { const [p] = await q('select * from payments where ref=$1 and order_id=$2 and not voided', [String(ref).slice(0, 80), o.id]); if (!p) return null; opts = { number: p.receipt_no, amountNow: Number(p.amount), date: p.paid_at }; }
  const pays = (await getPays(o.id)).map(fix);
  return { opts, pdf: await receiptPdf({ ...o, total: Number(o.total), paid: Number(o.paid) }, pays, opts) };
}
const fm = (v) => String(Math.round(Number(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

async function sendReceipt(o, opts = {}) {
  const pays = (await getPays(o.id)).map(fix);
  const ord = { ...o, total: Number(o.total), paid: Number(o.paid) };
  const pdf = await receiptPdf(ord, pays, opts);
  const num = opts.number || o.code;
  const sent = await mail(o.customer_email, `Votre reçu Creaflow ${num}`, `<p>Bonjour ${esc(o.customer_name)},</p><p>Votre reçu <b>${esc(num)}</b> (commande ${esc(o.code)}) est en pièce jointe.</p><p>Creaflow, Calavi-Agualand</p>`, [{ filename: `recu-${num}.pdf`, content: pdf }]);
  return { pdf, sent };
}

export default async (req) => {
  const url = new URL(req.url); const m = req.method;
  const path = url.pathname.replace(/^\/(\.netlify\/functions\/api|api)\/?/, '').split('/').filter(Boolean);
  const [a, b, c, d] = path;
  let ME = 'admin'; const actor = () => ME;
  const adminOf = async () => {
    const p = verify((req.headers.get('authorization') || '').replace(/^Bearer /, '') || url.searchParams.get('t') || '', await secret());
    if (!p || p.role !== 'admin') return null;
    const sub = String(p.sub || '').toLowerCase();
    if ((await q('select 1 from admin_users where lower(email)=$1', [sub])).length) return p;
    return envAdmin() && sub === env('ADMIN_EMAIL').toLowerCase() ? p : null;
  };
  const origin = site() || url.origin;
  const RCPT_TTL = 180 * 86400;
  const rcptLink = async (orderId, ref) => `/api/receipt/${sign({ k: 'rcpt', o: orderId, r: ref || null }, await secret(), RCPT_TTL)}`;
  try {
    // ---------- public ----------
    if (m === 'GET' && a === 'catalog') return J((await q('select id,pole,name,hint,price,unit,active,sort,form from services where active order by sort,name')).map(fix));
    if (m === 'GET' && a === 'gallery-categories') return J(await q(`select c.name, count(g.id)::int n from gallery_categories c join gallery g on g.category=c.name group by c.id, c.name, c.sort order by c.sort, c.name`));
    if (m === 'GET' && a === 'gallery') return J(await q('select id,title,category,path from gallery order by created_at desc'));
    if (m === 'GET' && a === 'file' && b && c) {
      if (b === 'orders' && !(await adminOf())) return bad('non autorisé', 401);
      if (b !== 'gallery' && b !== 'orders') return bad('introuvable', 404);
      const r = await getStore(b === 'gallery' ? 'gallery' : 'order-files').getWithMetadata(decodeURIComponent(c), { type: 'arrayBuffer' });
      if (!r) return bad('introuvable', 404);
      return new Response(r.data, { headers: { 'content-type': r.metadata?.type || 'application/octet-stream', 'cache-control': b === 'gallery' ? 'public, max-age=31536000, immutable' : 'private, no-store' } });
    }
    if (m === 'POST' && a === 'upload') {
      const file = (await req.formData()).get('file');
      if (!file || typeof file === 'string') return bad('fichier manquant');
      if (file.size > MAX) return bad('Fichier trop lourd (4 Mo maximum).', 413);
      if (!FILE_OK.test(file.type)) return bad('Format non accepté (images, PDF, Word, Excel, texte).', 415);
      const key = `${randomUUID()}-${file.name.replace(/[^\w.\-]/g, '_').slice(-60)}`;
      await getStore('order-files').set(key, await file.arrayBuffer(), { metadata: { type: file.type, name: file.name } });
      return J({ key });
    }
    if (m === 'POST' && a === 'orders') {
      const d = await req.json().catch(() => null); if (!d) return bad('requête invalide');
      const name = S(d.name, 120), phone = S(d.phone, 30), email = S(d.email, 160), details = S(d.details, 3000);
      const delivery = d.delivery === 'livraison' ? 'livraison' : 'retrait';
      const qty = Math.min(100000, Math.max(1, parseInt(d.quantity) || 1));
      const oList = opts(d.options);
      if (!name || key8(phone).length < 8 || (details.length < 3 && !oList.length) || !UUID.test(S(d.service, 60))) return bad('Champs invalides.');
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return bad('E-mail invalide.');
      const files = (Array.isArray(d.files) ? d.files : []).slice(0, 8).map((f) => S(f, 150)).filter((f) => /^[\w.\-]+$/.test(f));
      const [s] = await q('select * from services where id=$1 and active', [d.service]);
      if (!s) return bad('Service inconnu.');
      const total = s.price == null ? null : Number(s.price) * qty;
      const [o] = await q(`insert into orders(code,service_id,service,details,quantity,customer_name,customer_phone,phone_key,customer_email,delivery,files,total,options)
        values('CF-'||to_char(now(),'YYYY')||'-'||lpad(nextval('order_seq')::text,4,'0'),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12::jsonb) returning id,code,total`,
        [s.id, s.name, details, qty, name, phone, key8(phone), email || null, delivery, JSON.stringify(files), total, JSON.stringify(opts(d.options))]);
      await log('client', 'création', 'order', o.id, `Commande en ligne ${o.code} : ${s.name} × ${qty}`);
      await mail(await notifyTo(), `Nouvelle commande ${o.code}`, `<p><b>${esc(s.name)}</b> × ${qty}</p><p>${esc(name)} · ${esc(phone)}</p>${oList.map((x) => `<p><b>${esc(x.label)}</b> : ${esc(x.value)}</p>`).join('')}<p>${esc(details)}</p>`);
      return J({ code: o.code, total: o.total == null ? null : Number(o.total) });
    }
    const trackOne = async (code, phone) => {
      const [o] = await q('select id,service,status,total,paid,created_at from orders where code=$1 and phone_key=$2', [S(code, 30).toUpperCase(), key8(phone ?? '')]);
      if (!o) return null;
      const { id, ...rest } = fix(o);
      return { ...rest, receipt: rest.total != null && rest.paid > 0 ? await rcptLink(id, null) : null };
    };
    if (m === 'POST' && a === 'track') {
      const d = await req.json().catch(() => ({})); const r = await trackOne(d.code, d.phone);
      return r ? J(r) : bad('introuvable', 404);
    }
    if (m === 'POST' && a === 'track-many') {
      const d = await req.json().catch(() => ({})); const items = (Array.isArray(d.items) ? d.items : []).slice(0, 20);
      return J(await Promise.all(items.map(async (it) => { const code = S(it?.code, 30).toUpperCase(); const r = await trackOne(code, it?.phone); return r ? { code, ...r } : { code, notFound: true }; })));
    }
    if (m === 'GET' && a === 'receipt' && b) {
      const p = verify(decodeURIComponent(b), await secret());
      if (!p || p.k !== 'rcpt' || !UUID.test(p.o || '')) return bad('Lien invalide ou expiré.', 404);
      const [o] = await q('select * from orders where id=$1', [p.o]); if (!o || o.total == null) return bad('introuvable', 404);
      const r = await makeReceipt(o, p.r); if (!r) return bad('introuvable', 404);
      return new Response(Buffer.from(r.pdf, 'base64'), { headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="recu-${r.opts.number}.pdf"`, 'cache-control': 'private, no-store' } });
    }
    if (m === 'POST' && a === 'pay') {
      const d = await req.json().catch(() => ({}));
      const [o] = await q('select * from orders where code=$1 and phone_key=$2', [S(d.code, 30).toUpperCase(), key8(d.phone ?? '')]);
      if (!o || !o.total) return bad('commande introuvable');
      const due = Number(o.total) - Number(o.paid); if (due <= 0) return bad('déjà payée');
      const h = { Authorization: `Bearer ${env('FEDAPAY_SECRET_KEY')}`, 'Content-Type': 'application/json' };
      const [first, ...rest] = String(o.customer_name).split(' ');
      const t = await fetch(`${FED()}/transactions`, { method: 'POST', headers: h, body: JSON.stringify({
        description: `Commande ${o.code}`, amount: due, currency: { iso: 'XOF' }, callback_url: `${site()}/paiement/retour?code=${o.code}`, custom_metadata: { order_code: o.code },
        customer: { firstname: first, lastname: rest.join(' ') || first, email: o.customer_email || undefined, phone_number: { number: String(o.customer_phone).replace(/\D/g, '').replace(/^(00)?229/, ''), country: 'bj' } } }) }).then((r) => r.json());
      const id = t['v1/transaction']?.id; if (!id) return bad('Le service de paiement est indisponible.', 502);
      const tk = await fetch(`${FED()}/transactions/${id}/token`, { method: 'POST', headers: h }).then((r) => r.json());
      return tk.url ? J({ url: tk.url }) : bad('Le service de paiement est indisponible.', 502);
    }
    if (m === 'POST' && a === 'fedapay-webhook') {
      const ev = await req.json().catch(() => ({})); const id = ev?.entity?.id;
      if (ev?.name !== 'transaction.approved' || !id) return new Response('ignored');
      const tx = (await fetch(`${FED()}/transactions/${id}`, { headers: { Authorization: `Bearer ${env('FEDAPAY_SECRET_KEY')}` } }).then((r) => r.json()))['v1/transaction'];
      const code = tx?.custom_metadata?.order_code; if (tx?.status !== 'approved' || !code) return new Response('not approved');
      const [ord] = await q('select id from orders where code=$1', [code]); if (!ord) return new Response('unknown order');
      const ins = await q(`insert into payments(ref,order_id,amount,method,recorded_by,receipt_no) values($1,$2,$3,'fedapay','fedapay',${RNO}) on conflict do nothing returning ref,receipt_no`, [String(id), ord.id, tx.amount]);
      if (ins.length) {
        const o = await recalc(ord.id);
        await q(`update orders set status='en cours' where id=$1 and status='reçue'`, [ord.id]);
        await log('fedapay', 'paiement', 'order', ord.id, `${tx.amount} FCFA (FedaPay) reçu ${ins[0].receipt_no}`);
        if (o?.customer_email && o.total) await sendReceipt(o, { number: ins[0].receipt_no, amountNow: Number(tx.amount) });
      }
      return new Response('ok');
    }
    if (m === 'POST' && a === 'contact') {
      const d = await req.json().catch(() => ({}));
      if (d.website) return J({ ok: true }); // anti-spam : champ piège
      const name = S(d.name, 120), phone = S(d.phone, 30), email = S(d.email, 160), message = S(d.message, 3000);
      if (!name || message.length < 5 || (!phone && !email)) return bad('Champs invalides.');
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return bad('E-mail invalide.');
      await q('insert into messages(name,phone,email,message) values($1,$2,$3,$4)', [name, phone, email, message]);
      await mail(await notifyTo(), `Message de ${name}`, `<p>${esc(message)}</p><p>${esc(name)} · ${esc(phone)} · ${esc(email)}</p>`);
      return J({ ok: true });
    }
    // ---------- admin ----------
    if (m === 'GET' && a === 'admin' && b === 'status') {
      const [{ n }] = await q('select count(*)::int n from admin_users'); const code = await q(`select 1 from settings where key='setup_code'`);
      return J({ configured: n > 0 || envAdmin(), canSetup: n === 0 && !envAdmin() && code.length > 0 });
    }
    if (m === 'POST' && a === 'admin' && b === 'setup') {
      const d = await req.json().catch(() => ({}));
      const [{ n }] = await q('select count(*)::int n from admin_users');
      if (n > 0 || envAdmin()) return bad('Le compte administrateur existe déjà.', 409);
      const [c] = await q(`select value from settings where key='setup_code'`);
      if (!c) return bad('Code d’installation introuvable : exécutez database/schema.sql dans Neon.', 503);
      if (!same(S(d.code, 100), c.value)) { await new Promise((r) => setTimeout(r, 600)); return bad('Code d’installation incorrect.', 401); }
      const email = S(d.email, 200).toLowerCase(), pw = String(d.password ?? '');
      if (!okMail(email)) return bad('Adresse e-mail invalide.');
      if (pw.length < 10) return bad('Le mot de passe doit contenir au moins 10 caractères.');
      await q('insert into admin_users(email,password_hash) values($1,$2)', [email, hashPassword(pw)]);
      await q(`delete from settings where key='setup_code'`);
      await log(email, 'compte admin', 'admin', email, 'Compte administrateur créé');
      return J({ token: sign({ role: 'admin', sub: email }, await secret()) });
    }
    if (m === 'POST' && a === 'admin' && b === 'login') {
      const d = await req.json().catch(() => ({}));
      const email = S(d.email, 200).toLowerCase(), pw = String(d.password ?? '');
      const [u] = await q('select * from admin_users where lower(email)=$1', [email]);
      const [{ n }] = await q('select count(*)::int n from admin_users');
      if (!n && !envAdmin()) return bad('Aucun compte administrateur : créez-le d’abord.', 503);
      const ok = u ? checkPassword(pw, u.password_hash) : envAdmin() && same(email, env('ADMIN_EMAIL').toLowerCase()) && same(pw, env('ADMIN_PASSWORD'));
      if (!ok) { await new Promise((r) => setTimeout(r, 500)); return bad('Identifiants incorrects.', 401); }
      return J({ token: sign({ role: 'admin', sub: email }, await secret()) });
    }
    if (a === 'admin') {
      const me = await adminOf(); if (!me) return bad('non autorisé', 401);
      ME = me.sub || env('ADMIN_EMAIL') || 'admin';
      const body = ['POST', 'PUT', 'PATCH'].includes(m) && !(a === 'admin' && b === 'gallery' && m === 'POST') ? await req.json().catch(() => ({})) : {};
      const who = actor();
      const range = () => { const t = new Date().toISOString().slice(0, 10); let from = D(url.searchParams.get('from')) || t.slice(0, 8) + '01', to = D(url.searchParams.get('to')) || t; if (from > to) [from, to] = [to, from]; return [from, to]; };
      const inP = (col) => `(${col} at time zone ${TZ})::date between $1::date and $2::date`;
      if (m === 'POST' && b === 'password') {
        const [u] = await q('select * from admin_users where lower(email)=$1', [ME.toLowerCase()]);
        if (!u) return bad('Ce compte est géré par les variables Netlify : modifiez ADMIN_PASSWORD là-bas.');
        if (!checkPassword(String(body.current ?? ''), u.password_hash)) return bad('Mot de passe actuel incorrect.', 401);
        if (String(body.next ?? '').length < 10) return bad('Le nouveau mot de passe doit contenir au moins 10 caractères.');
        await q('update admin_users set password_hash=$2 where id=$1', [u.id, hashPassword(String(body.next))]);
        await log(who, 'compte admin', 'admin', u.email, 'Mot de passe modifié');
        return J({ ok: true });
      }
      if (b === 'team') {
        if (m === 'GET' && !c) return J({ users: await q('select id,email,created_at from admin_users order by created_at'), me: ME, env: envAdmin() });
        if (m === 'POST' && !c) {
          const email = S(body.email, 200).toLowerCase(), pw = String(body.password ?? '');
          if (!okMail(email)) return bad('Adresse e-mail invalide.');
          if (pw.length < 10) return bad('Le mot de passe doit contenir au moins 10 caractères.');
          const r = await q('insert into admin_users(email,password_hash) values($1,$2) on conflict (email) do nothing returning id', [email, hashPassword(pw)]);
          if (!r.length) return bad('Cet e-mail a déjà un compte.', 409);
          await log(who, 'compte admin', 'admin', email, `Compte administrateur créé pour ${email}`);
          return J({ ok: true });
        }
        if (m === 'POST' && UUID.test(c || '') && d === 'password') {
          const pw = String(body.password ?? ''); if (pw.length < 10) return bad('Le mot de passe doit contenir au moins 10 caractères.');
          const [u] = await q('update admin_users set password_hash=$2 where id=$1 returning email', [c, hashPassword(pw)]); if (!u) return bad('introuvable', 404);
          await log(who, 'compte admin', 'admin', u.email, `Mot de passe réinitialisé pour ${u.email}`);
          return J({ ok: true });
        }
        if (m === 'DELETE' && UUID.test(c || '')) {
          const [u] = await q('select * from admin_users where id=$1', [c]); if (!u) return bad('introuvable', 404);
          if (u.email.toLowerCase() === ME.toLowerCase()) return bad('Vous ne pouvez pas supprimer votre propre compte.');
          const [{ n }] = await q('select count(*)::int n from admin_users'); if (n <= 1 && !envAdmin()) return bad('Impossible de supprimer le dernier administrateur.');
          await q('delete from admin_users where id=$1', [c]);
          await log(who, 'compte admin', 'admin', u.email, `Compte administrateur supprimé : ${u.email}`);
          return J({ ok: true });
        }
      }
      if (m === 'POST' && b === 'receipt-link') {
        const [o] = await q('select * from orders where id=$1', [UUID.test(body.id || '') ? body.id : '00000000-0000-0000-0000-000000000000']);
        if (!o || o.total == null) return bad('Renseignez d’abord le total de la commande.');
        const phone = waNumber(o.customer_phone); if (!phone) return bad('Cette commande n’a pas de numéro de téléphone.');
        let ref = null, now = 0, num = o.code;
        if (body.ref) { const [p] = await q('select * from payments where ref=$1 and order_id=$2 and not voided', [S(body.ref, 80), o.id]); if (!p) return bad('Paiement introuvable.', 404); ref = p.ref; now = Number(p.amount); num = p.receipt_no; }
        const link = origin + (await rcptLink(o.id, ref)); const rest = Math.max(0, Number(o.total) - Number(o.paid));
        const message = `Bonjour ${o.customer_name}, voici votre ${ref ? 'reçu' : 'récapitulatif'} Creaflow ${num} (commande ${o.code})${now ? ' : paiement de ' + fm(now) + ' reçu' : ''}. Total ${fm(o.total)}, payé ${fm(o.paid)}${rest ? ', reste ' + fm(rest) : ', commande soldée'}.\nVotre reçu PDF : ${link}\nMerci de votre confiance ! Creaflow`;
        await log(who, 'reçu', 'order', o.id, `Reçu ${num} préparé pour envoi par WhatsApp`);
        return J({ url: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`, link, message, phone });
      }
      // ----- commandes -----
      if (m === 'GET' && b === 'orders' && !c) return J((await q('select * from orders order by created_at desc limit 1000')).map(fix));
      if (m === 'GET' && b === 'orders' && UUID.test(c || '')) {
        const [o] = await q('select * from orders where id=$1', [c]); if (!o) return bad('introuvable', 404);
        return J({ order: fix(o), payments: (await q('select * from payments where order_id=$1 order by paid_at, created_at', [c])).map(fix), events: await q(`select at,actor,action,detail from audit_log where entity='order' and entity_id=$1 order by at desc`, [c]) });
      }
      if (m === 'POST' && b === 'orders' && !c) {
        const name = S(body.name, 120), phone = S(body.phone, 30), email = S(body.email, 160), details = S(body.details, 3000), notes = S(body.notes, 1000);
        const total = M(body.total), qty = Math.min(100000, Math.max(1, parseInt(body.quantity) || 1));
        let label = S(body.service_name, 160), sid = UUID.test(body.service_id || '') ? body.service_id : null;
        if (sid) { const [s] = await q('select name from services where id=$1', [sid]); if (s) label = label || s.name; else sid = null; }
        if (!name || !label || !(total >= 0)) return bad('Nom du client, service et total sont requis.');
        if (email && !/^\S+@\S+\.\S+$/.test(email)) return bad('E-mail invalide.');
        const [o] = await q(`insert into orders(code,service_id,service,details,quantity,customer_name,customer_phone,phone_key,customer_email,delivery,total,source,notes,due_date)
          values('CF-'||to_char(now(),'YYYY')||'-'||lpad(nextval('order_seq')::text,4,'0'),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *`,
          [sid, label, details, qty, name, phone, key8(phone), email || null, body.delivery === 'livraison' ? 'livraison' : 'retrait', total, SOURCES.includes(body.source) ? body.source : 'boutique', notes || null, D(body.due_date)]);
        await log(who, 'création', 'order', o.id, `Commande saisie ${o.code} (${o.source}) : ${label} × ${qty}, total ${total} FCFA`);
        const dep = M(body.deposit);
        if (dep > 0) {
          if (dep > total) return J({ ...fix(o), warning: 'Acompte supérieur au total : non enregistré.' });
          const [p] = await q(`insert into payments(ref,order_id,amount,method,note,recorded_by,receipt_no) values($1,$2,$3,$4,'Acompte à la commande',$5,${RNO}) returning *`, ['MAN-' + randomUUID(), o.id, dep, S(body.deposit_method, 30) || 'espèces', who]);
          await log(who, 'paiement', 'order', o.id, `${dep} FCFA (${p.method}) reçu ${p.receipt_no}`);
          return J(fix(await recalc(o.id)));
        }
        return J(fix(o));
      }
      if (m === 'PATCH' && b === 'orders' && UUID.test(c || '') && !d) {
        const [old] = await q('select * from orders where id=$1', [c]); if (!old) return bad('introuvable', 404);
        const f = {};
        if (body.status !== undefined) { if (!STATUTS.includes(body.status)) return bad('statut invalide'); f.status = body.status; }
        if ('total' in body) { const t = body.total === null || body.total === '' ? null : M(body.total); if (t !== null && !(t >= 0)) return bad('total invalide'); f.total = t; }
        for (const [k, max] of [['customer_name', 120], ['customer_phone', 30], ['customer_email', 160], ['details', 3000], ['notes', 1000], ['service', 160]]) if (k in body) f[k] = S(body[k], max) || null;
        if ('delivery' in body) f.delivery = body.delivery === 'livraison' ? 'livraison' : 'retrait';
        if ('source' in body && SOURCES.includes(body.source)) f.source = body.source;
        if ('due_date' in body) f.due_date = D(body.due_date);
        if ('quantity' in body) f.quantity = Math.min(100000, Math.max(1, parseInt(body.quantity) || 1));
        if ((f.customer_name === null) || (f.service === null)) return bad('Nom et service ne peuvent pas être vides.');
        if (f.customer_email && !/^\S+@\S+\.\S+$/.test(f.customer_email)) return bad('E-mail invalide.');
        if ('customer_phone' in f) { f.customer_phone = f.customer_phone || ''; f.phone_key = key8(f.customer_phone); }
        const keys = Object.keys(f); if (!keys.length) return J(fix(old));
        const [o] = await q(`update orders set ${keys.map((k, i) => `${k}=$${i + 2}`).join(',')} where id=$1 returning *`, [c, ...keys.map((k) => f[k])]);
        const changed = keys.filter((k) => k !== 'phone_key' && String(o[k] ?? '') !== String(old[k] ?? '')).map((k) => k === 'status' ? `statut : ${old.status} → ${o.status}` : k === 'total' ? `total : ${old.total ?? 'devis'} → ${o.total ?? 'devis'}` : `${k} modifié`);
        if (changed.length) await log(who, f.status && f.status !== old.status ? 'statut' : 'modification', 'order', c, changed.join(' ; '));
        const warning = f.status === 'livrée' && o.total != null && Number(o.paid) < Number(o.total) ? `Commande livrée avec un solde impayé de ${Number(o.total) - Number(o.paid)} FCFA.` : undefined;
        return J({ ...fix(o), warning });
      }
      if (m === 'POST' && b === 'orders' && UUID.test(c || '') && d === 'payments') {
        const [o] = await q('select * from orders where id=$1', [c]); if (!o) return bad('introuvable', 404);
        const amount = M(body.amount);
        if (!(amount > 0)) return bad('Montant invalide.');
        if (o.total == null) return bad('Fixez d’abord le total de la commande.');
        if (amount > Number(o.total) - Number(o.paid)) return bad(`Le montant dépasse le reste à payer (${Number(o.total) - Number(o.paid)} FCFA).`);
        const [p] = await q(`insert into payments(ref,order_id,amount,method,note,recorded_by,paid_at,receipt_no) values($1,$2,$3,$4,$5,$6,coalesce($7::timestamptz,now()),${RNO}) returning *`,
          ['MAN-' + randomUUID(), c, amount, S(body.method, 30) || 'espèces', S(body.note, 300) || null, who, D(body.paid_at)]);
        const upd = await recalc(c);
        await log(who, 'paiement', 'order', c, `${amount} FCFA (${p.method}) reçu ${p.receipt_no}${p.note ? ' : ' + p.note : ''}`);
        return J({ order: fix(upd), payment: fix(p) });
      }
      if (m === 'POST' && b === 'payments' && /^[\w-]{1,80}$/.test(c || '') && d === 'void') {
        const reason = S(body.reason, 300); if (reason.length < 3) return bad('Indiquez le motif de l’annulation.');
        const [p] = await q('update payments set voided=true,void_reason=$2,voided_at=now() where ref=$1 and not voided returning *', [c, reason]);
        if (!p) return bad('Paiement introuvable ou déjà annulé.', 404);
        const o = await recalc(p.order_id);
        await log(who, 'paiement annulé', 'order', p.order_id, `Annulation ${p.receipt_no} (${Number(p.amount)} FCFA) : ${reason}`);
        return J({ order: fix(o) });
      }
      if (m === 'POST' && b === 'receipt') {
        const [o] = await q('select * from orders where id=$1', [S(body.id, 60)].map((v) => (UUID.test(v) ? v : '00000000-0000-0000-0000-000000000000')));
        if (!o || o.total == null) return bad('Renseignez d’abord le total de la commande.');
        let opts = { number: o.code, title: 'RÉCAPITULATIF' };
        if (body.ref) { const [p] = await q('select * from payments where ref=$1 and order_id=$2 and not voided', [S(body.ref, 80), o.id]); if (!p) return bad('Paiement introuvable.', 404); opts = { number: p.receipt_no, amountNow: Number(p.amount), date: p.paid_at }; }
        const r = body.send && o.customer_email ? await sendReceipt(o, opts) : { pdf: (await (async () => { const pays = (await getPays(o.id)).map(fix); return receiptPdf({ ...o, total: Number(o.total), paid: Number(o.paid) }, pays, opts); })()), sent: false };
        await log(who, 'reçu', 'order', o.id, `Reçu ${opts.number} ${r.sent ? 'envoyé par e-mail' : 'généré'}`);
        return J(r);
      }
      // ----- comptabilité -----
      if (m === 'GET' && b === 'payments') { const [f, t] = range(); return J((await q(`select p.*, o.code, o.customer_name, o.service from payments p join orders o on o.id=p.order_id where ${inP('p.paid_at')} order by p.paid_at desc, p.created_at desc`, [f, t])).map(fix)); }
      if (m === 'GET' && b === 'expenses') { const [f, t] = range(); return J((await q('select * from expenses where spent_at between $1::date and $2::date order by spent_at desc, created_at desc', [f, t])).map(fix)); }
      if (m === 'POST' && b === 'expenses' && !c) {
        const amount = M(body.amount), label = S(body.label, 200), cat = S(body.category, 80);
        if (!(amount > 0) || !label || !cat) return bad('Catégorie, libellé et montant sont requis.');
        const [e] = await q('insert into expenses(spent_at,category,label,amount,method,note) values(coalesce($1::date,current_date),$2,$3,$4,$5,$6) returning *', [D(body.spent_at), cat, label, amount, S(body.method, 30) || 'espèces', S(body.note, 300) || null]);
        await log(who, 'dépense', 'expense', e.id, `${amount} FCFA : ${cat} - ${label}`);
        return J(fix(e));
      }
      if (m === 'POST' && b === 'expenses' && UUID.test(c || '') && d === 'void') {
        const reason = S(body.reason, 300); if (reason.length < 3) return bad('Indiquez le motif de l’annulation.');
        const [e] = await q('update expenses set voided=true,void_reason=$2 where id=$1 and not voided returning *', [c, reason]);
        if (!e) return bad('Dépense introuvable ou déjà annulée.', 404);
        await log(who, 'dépense annulée', 'expense', c, `${Number(e.amount)} FCFA (${e.label}) : ${reason}`);
        return J({ ok: true });
      }
      if (m === 'GET' && b === 'journal') {
        const ent = S(url.searchParams.get('entity'), 20), term = S(url.searchParams.get('q'), 80), lim = Math.min(500, Math.max(10, parseInt(url.searchParams.get('limit')) || 200));
        return J(await q(`select a.*, o.code from audit_log a left join orders o on a.entity='order' and a.entity_id=o.id::text where ($1='' or a.entity=$1) and ($2='' or a.action ilike '%'||$2||'%' or a.detail ilike '%'||$2||'%' or o.code ilike '%'||$2||'%') order by a.at desc limit $3`, [ent, term, lim]));
      }
      if (m === 'GET' && b === 'summary') {
        const today = `(now() at time zone ${TZ})::date`, mon = `date_trunc('month', now() at time zone ${TZ})::date`;
        const [open, tIn, mIn, mOut, due, todo, recent] = await Promise.all([
          q(`select status, count(*)::int n from orders where status not in ('livrée','annulée') group by status`),
          q(`select coalesce(sum(amount),0)::float8 v from payments where not voided and (paid_at at time zone ${TZ})::date=${today}`),
          q(`select coalesce(sum(amount),0)::float8 v from payments where not voided and (paid_at at time zone ${TZ})::date>=${mon}`),
          q(`select coalesce(sum(amount),0)::float8 v from expenses where not voided and spent_at>=${mon}`),
          q(`select coalesce(sum(total-paid),0)::float8 v, count(*)::int n from orders where status<>'annulée' and total is not null and total>paid`),
          q(`select id,code,customer_name,customer_phone,service,status,total,paid,due_date,created_at from orders where status in ('reçue','en cours','en production','prête') order by coalesce(due_date, created_at::date), created_at limit 25`),
          q('select id,code,customer_name,service,status,total,paid,created_at from orders order by created_at desc limit 8')]);
        return J({ open, today: tIn[0].v, monthIn: mIn[0].v, monthOut: mOut[0].v, receivable: due[0].v, receivableCount: due[0].n, todo: todo.map(fix), recent: recent.map(fix) });
      }
      if (m === 'GET' && b === 'report') {
        const [f, t] = range(); if ((new Date(t) - new Date(f)) / 864e5 > 366) return bad('Période limitée à 366 jours.');
        const oc = inP('o.created_at'), pp = inP('paid_at');
        const [byStatus, byPole, byService, bySource, byMethod, byCat, daily, receivables, clients, tot] = await Promise.all([
          q(`select o.status, count(*)::int n, coalesce(sum(o.total),0)::float8 amount from orders o where ${oc} group by o.status order by n desc`, [f, t]),
          q(`select coalesce(s.pole,'autre') pole, count(*)::int n, coalesce(sum(o.total) filter (where o.status<>'annulée'),0)::float8 amount from orders o left join services s on s.id=o.service_id where ${oc} group by 1 order by amount desc`, [f, t]),
          q(`select o.service, count(*)::int n, coalesce(sum(o.total) filter (where o.status<>'annulée'),0)::float8 amount from orders o where ${oc} group by o.service order by amount desc limit 15`, [f, t]),
          q(`select coalesce(o.source,'site') source, count(*)::int n, coalesce(sum(o.total) filter (where o.status<>'annulée'),0)::float8 amount from orders o where ${oc} group by 1 order by n desc`, [f, t]),
          q(`select coalesce(method,'autre') method, count(*)::int n, sum(amount)::float8 amount from payments where not voided and ${pp} group by 1 order by amount desc`, [f, t]),
          q(`select category, count(*)::int n, sum(amount)::float8 amount from expenses where not voided and spent_at between $1::date and $2::date group by 1 order by amount desc`, [f, t]),
          q(`select to_char(d::date,'YYYY-MM-DD') as day, coalesce((select sum(amount) from payments where not voided and (paid_at at time zone ${TZ})::date=d::date),0)::float8 income, coalesce((select sum(amount) from expenses where not voided and spent_at=d::date),0)::float8 expense from generate_series($1::date,$2::date,'1 day') g(d) order by d`, [f, t]),
          q(`select code,customer_name,customer_phone,service,total::float8 total,paid::float8 paid,(total-paid)::float8 due,created_at from orders where status<>'annulée' and total is not null and total>paid order by (total-paid) desc limit 50`),
          q(`select max(o.customer_name) name, max(o.customer_phone) phone, count(*)::int n, sum(o.total)::float8 amount from orders o where ${oc} and o.status<>'annulée' and o.total is not null group by coalesce(nullif(o.phone_key,''), lower(o.customer_name)) order by amount desc limit 10`, [f, t]),
          q(`select (select count(*)::int from orders o where ${oc}) orders, (select coalesce(sum(o.total),0)::float8 from orders o where ${oc} and o.status<>'annulée') billed, (select coalesce(sum(amount),0)::float8 from payments where not voided and ${pp}) income, (select coalesce(sum(amount),0)::float8 from expenses where not voided and spent_at between $1::date and $2::date) expense`, [f, t])]);
        return J({ from: f, to: t, totals: { ...tot[0], net: tot[0].income - tot[0].expense }, byStatus, byPole, byService, bySource, byMethod, byCat, daily, receivables, clients, receivableTotal: receivables.reduce((a, r) => a + r.due, 0) });
      }
      if (m === 'GET' && b === 'services') return J((await q('select * from services order by sort,name')).map(fix));
      if (m === 'PUT' && b === 'services') {
        const p = [S(body.pole, 30), S(body.name, 160), S(body.hint, 300), body.price === null || body.price === '' || body.price === undefined ? null : Math.max(0, Number(body.price) || 0), S(body.unit, 40), body.active !== false, parseInt(body.sort) || 0, FORMS.includes(body.form) ? body.form : null];
        if (!p[0] || !p[1]) return bad('Pôle et nom requis.');
        const [r] = UUID.test(body.id || '')
          ? await q('update services set pole=$2,name=$3,hint=$4,price=$5,unit=$6,active=$7,sort=$8,form=$9 where id=$1 returning *', [body.id, ...p])
          : await q('insert into services(pole,name,hint,price,unit,active,sort,form) values($1,$2,$3,$4,$5,$6,$7,$8) returning *', p);
        await log(actor(), 'catalogue', 'service', r.id, `${r.name} : prix ${r.price ?? 'sur devis'}`);
        return J(fix(r));
      }
      if (m === 'DELETE' && b === 'services' && UUID.test(c || '')) { await q('delete from services where id=$1', [c]); await log(actor(), 'catalogue', 'service', c, 'Service supprimé'); return J({ ok: true }); }
      if (m === 'POST' && b === 'gallery') {
        const fd = await req.formData(); const file = fd.get('file');
        if (!file || typeof file === 'string' || !file.type.startsWith('image/')) return bad('Choisissez une image.');
        if (file.size > MAX) return bad('Image trop lourde (4 Mo maximum).', 413);
        const key = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_').slice(-60)}`;
        await getStore('gallery').set(key, await file.arrayBuffer(), { metadata: { type: file.type } });
        await addCat(S(fd.get('category'), 60));
        const [r] = await q('insert into gallery(title,category,path) values($1,$2,$3) returning id,title,category,path', [S(fd.get('title'), 120), S(fd.get('category'), 60), key]);
        return J(r);
      }
      if (b === 'gallery-categories') {
        if (m === 'GET' && !c) return J(await q('select c.id, c.name, c.sort, count(g.id)::int n from gallery_categories c left join gallery g on g.category=c.name group by c.id order by c.sort, c.name'));
        if (m === 'POST' && !c) {
          const name = S(body.name, 60); if (!name) return bad('Indiquez le nom de la catégorie.');
          const r = await q('insert into gallery_categories(name,sort) select $1, coalesce(max(sort),0)+1 from gallery_categories on conflict (name) do nothing returning id,name', [name]);
          if (!r.length) return bad('Cette catégorie existe déjà.', 409);
          await log(who, 'galerie', 'gallery', r[0].id, `Catégorie créée : ${name}`); return J({ ...r[0], n: 0 });
        }
        if (m === 'PATCH' && UUID.test(c || '')) {
          const name = S(body.name, 60); if (!name) return bad('Indiquez le nom de la catégorie.');
          const [old] = await q('select * from gallery_categories where id=$1', [c]); if (!old) return bad('introuvable', 404);
          if (old.name === name) return J(old);
          try { await q('update gallery_categories set name=$2 where id=$1', [c, name]); } catch (e) { if (isDup(e)) return bad('Cette catégorie existe déjà.', 409); throw e; }
          await q('update gallery set category=$2 where category=$1', [old.name, name]);
          await log(who, 'galerie', 'gallery', c, `Catégorie renommée : ${old.name} → ${name}`); return J({ id: c, name });
        }
        if (m === 'DELETE' && UUID.test(c || '')) {
          const [r] = await q('select c.name, count(g.id)::int n from gallery_categories c left join gallery g on g.category=c.name where c.id=$1 group by c.id', [c]); if (!r) return bad('introuvable', 404);
          if (r.n > 0) return bad(`Cette catégorie contient ${r.n} photo(s) : déplacez-les d’abord vers une autre catégorie.`, 409);
          await q('delete from gallery_categories where id=$1', [c]); await log(who, 'galerie', 'gallery', c, `Catégorie supprimée : ${r.name}`); return J({ ok: true });
        }
      }
      if (m === 'PATCH' && b === 'gallery' && UUID.test(c || '')) {
        const cat = 'category' in body ? S(body.category, 60) : null; await addCat(cat);
        const [r] = await q('update gallery set title=coalesce($2,title), category=coalesce($3,category) where id=$1 returning id,title,category,path', [c, 'title' in body ? S(body.title, 120) : null, cat]);
        return r ? J(r) : bad('introuvable', 404);
      }
      if (m === 'DELETE' && b === 'gallery' && UUID.test(c || '')) {
        const [r] = await q('delete from gallery where id=$1 returning path', [c]);
        if (r) await getStore('gallery').delete(r.path).catch(() => {});
        return J({ ok: true });
      }
      if (m === 'GET' && b === 'messages') return J(await q('select * from messages order by created_at desc limit 300'));
      if (m === 'PATCH' && b === 'messages' && UUID.test(c || '')) { await q('update messages set read=$2 where id=$1', [c, !!body.read]); return J({ ok: true }); }
      if (m === 'DELETE' && b === 'messages' && UUID.test(c || '')) { await q('delete from messages where id=$1', [c]); return J({ ok: true }); }
    }
    return bad('introuvable', 404);
  } catch (e) {
    console.error(e);
    return bad('Erreur serveur.', 500);
  }
};
