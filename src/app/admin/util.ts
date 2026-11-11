export const ymd = (d = new Date()) => d.toLocaleDateString('sv-SE');
export const dd = (s: string) => (s ? new Date(s).toLocaleDateString('fr-FR') : '');
export const dt = (s: string) => (s ? new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '');
export const METHODS = ['espèces', 'MTN MoMo', 'Moov Money', 'virement', 'chèque', 'autre'];
export const SOURCES = ['site', 'boutique', 'WhatsApp', 'téléphone', 'autre'];
export const CATS = ['Matières premières (papier, encre, textile)', 'Loyer', 'Électricité et Internet', 'Transport et livraison', 'Salaires', 'Matériel', 'Marketing', 'Autres'];
export function range(k: string): [string, string] {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth();
  if (k === 'today') return [ymd(n), ymd(n)];
  if (k === 'week') { const d = new Date(n); d.setDate(n.getDate() - ((n.getDay() + 6) % 7)); return [ymd(d), ymd(n)]; }
  if (k === 'month') return [ymd(new Date(y, m, 1)), ymd(n)];
  if (k === 'last') return [ymd(new Date(y, m - 1, 1)), ymd(new Date(y, m, 0))];
  return [ymd(new Date(y, 0, 1)), ymd(n)];
}
export const csv = (rows: any[][]) => rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
export function download(name: string, text: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' })); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
export function downloadPdf(b64: string, name: string) { const a = document.createElement('a'); a.href = 'data:application/pdf;base64,' + b64; a.download = name; a.click(); }
