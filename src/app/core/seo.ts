import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
export interface SeoOpts { path: string; noindex?: boolean; image?: string; graph?: object[]; }
const BIZ = { '@type': 'LocalBusiness', '@id': environment.siteUrl + '/#business', name: 'Creaflow' };
/** Balises SEO par page : titre, description, canonical, Open Graph, Twitter, robots, JSON-LD (fil d'Ariane + données propres à la page). */
export function seo(title: string, desc: string, o: SeoOpts) {
  const t = inject(Title), m = inject(Meta), doc = inject(DOCUMENT);
  const url = environment.siteUrl + (o.path === '/' ? '/' : o.path), img = o.image ?? environment.siteUrl + '/assets/og.jpg';
  const full = o.path === '/' ? title : `${title} | Creaflow`;
  t.setTitle(full);
  const tags: [string, string, string][] = [['name', 'description', desc], ['name', 'robots', o.noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'],
    ['property', 'og:title', full], ['property', 'og:description', desc], ['property', 'og:url', url], ['property', 'og:image', img], ['property', 'og:type', 'website'], ['property', 'og:locale', 'fr_FR'], ['property', 'og:site_name', 'Creaflow'],
    ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', full], ['name', 'twitter:description', desc], ['name', 'twitter:image', img]];
  for (const [k, n, c] of tags) m.updateTag({ [k]: n, content: c } as any, `${k}='${n}'`);
  const link = (sel: string, attrs: Record<string, string>) => { let el = doc.head.querySelector(sel) as HTMLLinkElement | null; if (!el) { el = doc.createElement('link'); doc.head.appendChild(el); } for (const [a, v] of Object.entries(attrs)) el.setAttribute(a, v); };
  link("link[rel='canonical']", { rel: 'canonical', href: url });
  link("link[rel='alternate'][hreflang='fr']", { rel: 'alternate', hreflang: 'fr', href: url });
  link("link[rel='alternate'][hreflang='x-default']", { rel: 'alternate', hreflang: 'x-default', href: url });
  const graph: object[] = [...(o.graph ?? [])];
  if (o.path !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: environment.siteUrl + '/' }, { '@type': 'ListItem', position: 2, name: title, item: url }] });
  let ld = doc.getElementById('ld-page');
  if (!graph.length) { ld?.remove(); return; }
  if (!ld) { ld = doc.createElement('script'); ld.id = 'ld-page'; ld.setAttribute('type', 'application/ld+json'); doc.head.appendChild(ld); }
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
export const serviceLd = (names: string[]) => names.map(n => ({ '@type': 'Service', name: n, provider: BIZ, areaServed: 'Abomey-Calavi, Bénin' }));
