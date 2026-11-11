/** Formulaires de commande propres à chaque type de service. */
export type FieldType = 'text' | 'textarea' | 'select' | 'choice' | 'number';
export interface Field { key: string; label: string; type: FieldType; options?: string[]; required?: boolean; placeholder?: string; help?: string; when?: [string, string]; }
export interface FormKind { id: string; title: string; intro: string; qty: string; noQty?: boolean; fields: Field[]; sizes?: string[]; sizesHideFor?: string[]; fileLabel: string; fileHelp?: string; notePlaceholder: string; privacy?: string; }
export const FORM_IDS = ['print', 'binding', 'typing', 'admin', 'cv', 'photo', 'logo', 'design', 'banner', 'textile', 'goodies', 'generic'];
const DELAI = ['Normal', 'Urgent (sous 24 h)'];
const CONCEPTION = ['J’ai déjà mon visuel', 'Je veux que Creaflow le crée'];
export const FORMS: Record<string, FormKind> = {
  print: { id: 'print', title: 'Impression et photocopie', intro: 'Indiquez le format et le type d’impression. Vous pouvez aussi apporter vos documents en boutique.', qty: 'Nombre total de pages',
    fields: [{ key: 'Couleur', label: 'Couleur', type: 'choice', options: ['Noir et blanc', 'Couleur'], required: true }, { key: 'Format', label: 'Format', type: 'choice', options: ['A4', 'A3', 'A5', 'Autre'], required: true },
      { key: 'Recto-verso', label: 'Recto / verso', type: 'choice', options: ['Recto simple', 'Recto-verso'], required: true }, { key: 'Finition', label: 'Finition', type: 'select', options: ['Aucune', 'Agrafage', 'Reliure', 'Plastification'] }],
    fileLabel: 'Vos documents à imprimer (PDF, Word, images)', fileHelp: 'Facultatif : vous pouvez aussi les apporter ou les envoyer par WhatsApp.', notePlaceholder: 'Précisions : pages à imprimer, papier particulier, délai…' },
  binding: { id: 'binding', title: 'Reliure, pelliculage, plastification', intro: 'Dites-nous ce qu’il faut relier ou protéger.', qty: 'Nombre de documents',
    fields: [{ key: 'Prestation', label: 'Prestation', type: 'choice', options: ['Reliure spirale', 'Reliure thermique', 'Pelliculage', 'Plastification'], required: true }, { key: 'Format', label: 'Format', type: 'choice', options: ['A4', 'A3', 'A5', 'Autre'], required: true },
      { key: 'Pages par document', label: 'Nombre de pages par document', type: 'number', placeholder: 'ex. 60' }],
    fileLabel: 'Fichiers à imprimer avant reliure (facultatif)', notePlaceholder: 'Couleur de la couverture, délai…' },
  typing: { id: 'typing', title: 'Saisie et mise en page', intro: 'Nous saisissons, corrigeons et mettons en page vos documents.', qty: 'Nombre de pages',
    fields: [{ key: 'Type de document', label: 'Type de document', type: 'select', options: ['Mémoire ou rapport', 'Lettre ou courrier', 'Tableau ou Excel', 'Autre'], required: true }, { key: 'Langue', label: 'Langue', type: 'choice', options: ['Français', 'Anglais', 'Autre'], required: true },
      { key: 'Support', label: 'Votre document source', type: 'choice', options: ['Papier', 'Photo ou scan', 'Texte envoyé par WhatsApp', 'Fichier à modifier'], required: true }, { key: 'Délai', label: 'Délai', type: 'choice', options: DELAI, required: true }],
    fileLabel: 'Vos documents sources (photos, scans, fichiers)', notePlaceholder: 'Police, mise en forme, page de garde, sommaire…' },
  admin: { id: 'admin', title: 'Démarches administratives', intro: 'Nous vous accompagnons dans vos démarches. Après votre demande, nous vous confirmons par WhatsApp la liste exacte des pièces à fournir.', qty: 'Nombre de dossiers',
    fields: [{ key: 'Démarche', label: 'Démarche souhaitée', type: 'select', options: ['Acte de naissance sécurisé', 'CIP', 'NPI', 'IFU', 'Passeport', 'Duplicata RAVIP', 'Casier judiciaire', 'Carte biométrique', 'Registre de commerce', 'Autre'], required: true },
      { key: 'Pour qui', label: 'Pour qui ?', type: 'choice', options: ['Moi-même', 'Un proche'], required: true }, { key: 'Nom du bénéficiaire', label: 'Nom complet du bénéficiaire', type: 'text', required: true },
      { key: 'Délai', label: 'Délai', type: 'choice', options: DELAI, required: true }],
    fileLabel: 'Documents (uniquement si nous vous le demandons)', privacy: 'Ne téléversez pas de pièces d’identité sans que nous vous l’ayons demandé : nous vous indiquerons comment les transmettre.', notePlaceholder: 'Votre situation, informations utiles…' },
  cv: { id: 'cv', title: 'CV et lettre de motivation', intro: 'Un CV clair, soigné, adapté au poste visé.', qty: 'Nombre de documents',
    fields: [{ key: 'Poste ou domaine visé', label: 'Poste ou domaine visé', type: 'text', required: true, placeholder: 'ex. Comptable, développeur, stage en marketing' }, { key: 'Niveau d’expérience', label: 'Niveau d’expérience', type: 'choice', options: ['Étudiant ou débutant', '1 à 5 ans', 'Plus de 5 ans'], required: true },
      { key: 'Langue', label: 'Langue', type: 'choice', options: ['Français', 'Anglais', 'Bilingue'], required: true }, { key: 'Lettre de motivation', label: 'Lettre de motivation', type: 'choice', options: ['Oui', 'Non'], required: true },
      { key: 'CV existant', label: 'Avez-vous déjà un CV ?', type: 'choice', options: ['Oui, je le joins', 'Non, à créer'], required: true }],
    fileLabel: 'Votre CV actuel ou vos informations (facultatif)', notePlaceholder: 'Parcours, diplômes, compétences, offre visée…' },
  photo: { id: 'photo', title: 'Photo d’identité', intro: 'Précisez le format demandé par votre dossier.', qty: 'Nombre de photos',
    fields: [{ key: 'Format', label: 'Format', type: 'choice', options: ['4 × 4 cm', '3,5 × 4,5 cm', '2 × 2 cm', 'Autre'], required: true }, { key: 'Fond', label: 'Fond', type: 'choice', options: ['Blanc', 'Bleu', 'Autre'], required: true },
      { key: 'Livraison', label: 'Rendu', type: 'choice', options: ['Tirage papier', 'Fichier numérique', 'Les deux'], required: true }],
    fileLabel: 'Photo existante à retoucher (facultatif)', notePlaceholder: 'Document concerné (passeport, carte, dossier…)' },
  logo: { id: 'logo', title: 'Logo et identité visuelle', intro: 'Parlez-nous de votre activité : nous créons une identité qui vous ressemble.', qty: 'Quantité', noQty: true,
    fields: [{ key: 'Nom de l’entreprise', label: 'Nom de l’entreprise ou du projet', type: 'text', required: true }, { key: 'Secteur d’activité', label: 'Secteur d’activité', type: 'text', required: true, placeholder: 'ex. boulangerie, église, cabinet, mode' },
      { key: 'Slogan', label: 'Slogan (facultatif)', type: 'text' }, { key: 'Couleurs souhaitées', label: 'Couleurs souhaitées', type: 'text', placeholder: 'ex. rouge et bleu marine' },
      { key: 'Style', label: 'Style', type: 'choice', options: ['Moderne', 'Classique', 'Minimaliste', 'Coloré', 'Je ne sais pas'], required: true },
      { key: 'Livrables', label: 'Ce que vous souhaitez', type: 'choice', options: ['Logo seul', 'Logo + charte graphique', 'Logo + cartes de visite', 'Pack complet'], required: true }],
    fileLabel: 'Logo actuel, inspirations, références (facultatif)', notePlaceholder: 'Ce que vous aimez, ce que vous voulez éviter…' },
  design: { id: 'design', title: 'Flyers, cartes et affiches', intro: 'Choisissez le support, nous nous occupons de la conception et de l’impression.', qty: 'Quantité à imprimer',
    fields: [{ key: 'Support', label: 'Support', type: 'select', options: ['Flyers', 'Cartes de visite', 'Affiches', 'Faire-part', 'Cartes d’invitation', 'Autre'], required: true }, { key: 'Format', label: 'Format', type: 'choice', options: ['A6', 'A5', 'A4', 'A3', 'Carte standard', 'Autre'], required: true },
      { key: 'Impression', label: 'Impression', type: 'choice', options: ['Recto simple', 'Recto-verso'], required: true }, { key: 'Papier', label: 'Papier', type: 'choice', options: ['Standard', 'Épais ou couché', 'Je ne sais pas'] },
      { key: 'Conception', label: 'Conception', type: 'choice', options: CONCEPTION, required: true }, { key: 'Texte à inclure', label: 'Textes à faire figurer', type: 'textarea', required: true, when: ['Conception', CONCEPTION[1]], placeholder: 'Nom, titre, adresse, téléphone, mentions…' }],
    fileLabel: 'Votre visuel, logo, photos (facultatif)', notePlaceholder: 'Ambiance, couleurs, date limite…' },
  banner: { id: 'banner', title: 'Bâches, roll-up et banderoles', intro: 'Indiquez le support et les dimensions exactes.', qty: 'Quantité',
    fields: [{ key: 'Support', label: 'Support', type: 'select', options: ['Bâche', 'Roll-up', 'Banderole', 'Autocollant', 'Autre'], required: true }, { key: 'Dimensions', label: 'Dimensions', type: 'text', required: true, placeholder: 'ex. 100 × 180 cm ou 2 m × 1 m' },
      { key: 'Finition', label: 'Finition', type: 'choice', options: ['Œillets', 'Ourlet', 'Aucune', 'Je ne sais pas'] }, { key: 'Conception', label: 'Conception', type: 'choice', options: CONCEPTION, required: true },
      { key: 'Texte à inclure', label: 'Textes à faire figurer', type: 'textarea', required: true, when: ['Conception', CONCEPTION[1]], placeholder: 'Slogan, services, contacts, adresse…' }],
    fileLabel: 'Votre visuel, logo, photos (facultatif)', notePlaceholder: 'Lieu d’installation, date limite…' },
  textile: { id: 'textile', title: 'Tee-shirts, casquettes, polos et sacs', intro: 'Choisissez l’article, la couleur et les tailles : nous personnalisons par sérigraphie.', qty: 'Quantité totale',
    fields: [{ key: 'Article', label: 'Article', type: 'select', options: ['Tee-shirt', 'Casquette', 'Polo', 'Sac', 'Gilet', 'Tablier', 'Maillot', 'Autre'], required: true }, { key: 'Couleur de l’article', label: 'Couleur de l’article', type: 'text', required: true, placeholder: 'ex. blanc, noir, bleu roi' },
      { key: 'Technique', label: 'Technique', type: 'choice', options: ['Sérigraphie', 'Conseillez-moi'] }, { key: 'Emplacement', label: 'Emplacement du motif', type: 'choice', options: ['Poitrine', 'Dos', 'Poitrine et dos', 'Autre'], required: true },
      { key: 'Motif', label: 'Motif', type: 'choice', options: ['J’ai mon logo ou visuel', 'Je veux que Creaflow le crée'], required: true }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Enfant'], sizesHideFor: ['Casquette', 'Sac'], fileLabel: 'Votre logo ou visuel (facultatif)', notePlaceholder: 'Textes, noms à imprimer, date limite…' },
  goodies: { id: 'goodies', title: 'Badges, porte-clés, cachets, autocollants', intro: 'Petits objets personnalisés pour votre marque ou votre événement.', qty: 'Quantité',
    fields: [{ key: 'Article', label: 'Article', type: 'select', options: ['Badge', 'Porte-clé', 'Cachet', 'Autocollant', 'Autre'], required: true }, { key: 'Dimensions ou modèle', label: 'Dimensions ou modèle', type: 'text', placeholder: 'ex. rond 5 cm' },
      { key: 'Texte ou visuel', label: 'Texte ou visuel à reproduire', type: 'textarea', required: true }, { key: 'Couleurs', label: 'Couleurs', type: 'text' }],
    fileLabel: 'Votre logo ou visuel (facultatif)', notePlaceholder: 'Précisions, date limite…' },
  generic: { id: 'generic', title: 'Votre demande', intro: 'Décrivez ce dont vous avez besoin, nous vous répondons avec un prix.', qty: 'Quantité', fields: [], fileLabel: 'Vos fichiers (facultatif)', notePlaceholder: 'Décrivez votre besoin : format, couleurs, délai…' }
};
const RULES: [RegExp, string][] = [[/reliure|pelliculage|plastification/i, 'binding'], [/photocopie|impression/i, 'print'], [/saisie|mise en page/i, 'typing'], [/démarche|passeport|registre|casier|ifu|npi|cip|acte/i, 'admin'],
  [/\bcv\b|lettre de motivation/i, 'cv'], [/photo/i, 'photo'], [/logo|identité visuelle/i, 'logo'], [/flyer|carte de visite|affiche|faire-part|invitation/i, 'design'], [/bâche|roll|banderole/i, 'banner'],
  [/tee|casquette|polo|sac|textile|maillot/i, 'textile'], [/badge|porte|cachet|autocollant/i, 'goodies']];
/** Type de formulaire d'un service : champ « form » choisi dans l'admin, sinon déduit du nom. */
export const kindOf = (s: { name: string; form?: string | null } | undefined): string => (s?.form && FORMS[s.form] ? s.form : RULES.find(([r]) => r.test(s?.name ?? ''))?.[1] ?? 'generic');
