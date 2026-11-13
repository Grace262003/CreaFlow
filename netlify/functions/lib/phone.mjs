/** Numéro au format international pour wa.me (Bénin : 10 chiffres commençant par 01, ou ancien format à 8 chiffres). */
export function waNumber(phone) {
  const d = String(phone ?? '').replace(/\D/g, '').replace(/^00/, '');
  if (!d) return '';
  if (d.startsWith('229') && d.length >= 11) return d;
  if (d.length === 10 && d.startsWith('01')) return '229' + d;
  if (d.length === 8) return '22901' + d;
  return d;
}
