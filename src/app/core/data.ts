export interface Service { id: string; pole: string; name: string; hint: string; price?: number | null; unit?: string; form?: string | null; active?: boolean; sort?: number; }
export const fcfa = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
export const POLES = [
  { id: 'impression', title: 'Photocopie et impression', text: 'Noir et blanc, couleur, reliure, pelliculage, plastification, fournitures scolaires.' },
  { id: 'informatique', title: 'Formations et services informatiques', text: 'Informatique, graphisme, sérigraphie, saisie, démarches : acte de naissance sécurisé, CIP, NPI, IFU, CV, passeport, casier judiciaire, registre de commerce, photo d’identité.' },
  { id: 'graphisme', title: 'Graphisme et sérigraphie', text: 'Flyers, cartes de visite, logo, bâche, affiche, roll-up, tee-shirts, casquettes, polos, sacs, badges, porte-clés.' }
];
export const SERVICES: Service[] = [
  { id: 'photocopie', pole: 'impression', name: 'Photocopie noir et blanc / couleur', hint: 'Format, nombre de pages, nombre d’exemplaires' },
  { id: 'impression', pole: 'impression', name: 'Impression noir et blanc / couleur', hint: 'Format, nombre de pages' },
  { id: 'reliure', pole: 'impression', name: 'Reliure, pelliculage, plastification', hint: 'Type de finition, quantité' },
  { id: 'saisie', pole: 'informatique', name: 'Saisie et mise en page', hint: 'Nombre de pages, délai' },
  { id: 'demarches', pole: 'informatique', name: 'Démarches (acte, CIP, NPI, IFU, passeport…)', hint: 'Précisez le document voulu' },
  { id: 'cv', pole: 'informatique', name: 'CV et lettre de motivation', hint: 'Domaine, poste visé' },
  { id: 'photo', pole: 'informatique', name: 'Photo d’identité', hint: 'Nombre de photos' },
  { id: 'flyers', pole: 'graphisme', name: 'Flyers, cartes de visite, affiches', hint: 'Format, quantité, recto/verso' },
  { id: 'logo', pole: 'graphisme', name: 'Logo et identité visuelle', hint: 'Activité, couleurs souhaitées' },
  { id: 'bache', pole: 'graphisme', name: 'Bâche, roll-up, banderole', hint: 'Dimensions' },
  { id: 'textile', pole: 'graphisme', name: 'Tee-shirts, casquettes, polos, sacs', hint: 'Quantité, tailles, couleurs' },
  { id: 'goodies', pole: 'graphisme', name: 'Badges, porte-clés, cachets, autocollants', hint: 'Quantité, modèle' }
];
export const STATUTS = ['reçue', 'en cours', 'en production', 'prête', 'livrée', 'annulée'];
