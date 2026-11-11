import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
const n = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
const d10 = (x) => new Date(x).toISOString().slice(0, 10);
/** o: commande ; pays: paiements valides ; opts: { number, amountNow, title } */
export async function receiptPdf(o, pays = [], opts = {}) {
  const pdf = await PDFDocument.create(); const pg = pdf.addPage([595, 842]);
  const f = await pdf.embedFont(StandardFonts.Helvetica), b = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.13, 0.24), line = rgb(0.85, 0.88, 0.93), red = rgb(0.85, 0.12, 0.24);
  pg.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: rgb(0.043, 0.106, 0.227) });
  pg.drawRectangle({ x: 0, y: 738, width: 595, height: 4, color: red });
  pg.drawText('CRÉAFLOW', { x: 40, y: 785, size: 28, font: b, color: rgb(1, 1, 1) });
  pg.drawText('Création - Impression - Personnalisation', { x: 40, y: 765, size: 10, font: f, color: rgb(0.8, 0.84, 0.92) });
  pg.drawText(`${opts.title || 'REÇU'} ${opts.number || o.code}`, { x: 330, y: 785, size: 15, font: b, color: rgb(1, 1, 1) });
  const L = (t, y, bold = false, x = 40, c = ink, size = 12) => pg.drawText(String(t), { x, y, size, font: bold ? b : f, color: c });
  L(`Commande : ${o.code}`, 705); L(`Date : ${d10(opts.date || new Date())}`, 687); L(`Client : ${o.customer_name}`, 669); if (o.customer_phone) L(`Téléphone : ${o.customer_phone}`, 651);
  pg.drawLine({ start: { x: 40, y: 632 }, end: { x: 555, y: 632 }, thickness: 1, color: line });
  L('Désignation', 614, true); L('Qté', 614, true, 380); L('Montant', 614, true, 450);
  L(String(o.service).slice(0, 48), 592); L(o.quantity, 592, false, 380); L(n(o.total), 592, false, 450);
  pg.drawLine({ start: { x: 40, y: 572 }, end: { x: 555, y: 572 }, thickness: 1, color: line });
  let y = 548; L('Paiements enregistrés', y, true); y -= 20;
  if (!pays.length) { L('Aucun paiement enregistré pour le moment.', y, false, 40, rgb(0.4, 0.45, 0.55), 11); y -= 20; }
  for (const p of pays.slice(0, 12)) { L(d10(p.paid_at), y, false, 40, ink, 11); L(String(p.method || ''), y, false, 130, ink, 11); L(String(p.receipt_no || ''), y, false, 250, ink, 11); L(n(p.amount), y, false, 450, ink, 11); y -= 18; }
  y -= 8; pg.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: line }); y -= 26;
  if (opts.amountNow) { L(`Montant de ce reçu : ${n(opts.amountNow)}`, y, true, 40, red, 14); y -= 28; }
  L(`Total : ${n(o.total)}`, y, true); y -= 20; L(`Total payé : ${n(o.paid)}`, y); y -= 20;
  const rest = Math.max(0, o.total - o.paid); L(rest > 0 ? `Reste à payer : ${n(rest)}` : 'Commande soldée - merci !', y, true, 40, rest > 0 ? red : rgb(0.12, 0.66, 0.33));
  pg.drawText('Calavi-Agualand - +229 01 97 16 80 15 - creaflow229@gmail.com', { x: 40, y: 50, size: 9, font: f, color: rgb(0.4, 0.45, 0.55) });
  return pdf.saveAsBase64();
}
