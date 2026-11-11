# Creaflow – site vitrine, commandes, paiement Mobile Money, admin
Angular 17 + Netlify Functions + base Neon (Postgres gratuit). Aucun compte Supabase nécessaire.

## 1. Base de données (Neon, gratuit)
1. Créez un compte sur neon.tech, un projet, puis copiez la chaîne de connexion (`postgresql://...`).
2. Ouvrez *SQL Editor*, collez le contenu de `database/schema.sql` et exécutez-le (tables + 12 services de départ). Le script peut être rejoué sans risque : si vous aviez déjà exécuté une ancienne version, rejouez-le pour ajouter la comptabilité et le journal.

## 2. Hébergement (Netlify)
1. Poussez le projet sur GitHub, puis Netlify > Add new site > Import from Git. `netlify.toml` configure déjà le build, le dossier publié et les routes.
2. Site settings > Environment variables, ajoutez :
   - `DATABASE_URL` : chaîne Neon
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` : vos identifiants pour /admin (mot de passe long et unique)
   - `JWT_SECRET` : une longue phrase aléatoire (32 caractères ou plus)
   - `SITE_URL` : adresse du site (ex. https://creaflow.netlify.app)
   - `FEDAPAY_SECRET_KEY`, `FEDAPAY_ENV` (`sandbox` puis `live`) : paiement Mobile Money
   - `RESEND_API_KEY`, `RECEIPT_FROM` (ex. `Creaflow <recus@votre-domaine>`), `NOTIFY_EMAIL` : e-mails (reçus, nouvelles commandes, messages)
3. Redéployez après avoir ajouté les variables.
4. FedaPay > Webhooks : `https://VOTRE-SITE/api/fedapay-webhook` (événement `transaction.approved`). Testez en sandbox avant de passer en `live`.

## 3. Avant la mise en ligne
- Complétez `src/app/pages/legal.component.ts` (raison sociale, IFU, RCCM, hébergeur).
- Ajoutez `src/assets/og.jpg` (1200x630) et remplacez `creaflow.bj` dans `index.html`, `environment.ts` et `src/seo/`.
- Dans /admin : fixez les prix du catalogue, publiez de vraies photos dans la galerie.

## Limites
- Fichiers de commande : 4 Mo chacun, 5 par commande (limite des fonctions Netlify).
- Sans `RESEND_API_KEY`, les e-mails ne partent pas ; le reçu PDF reste téléchargeable depuis l'admin.
- Neon gratuit se met en veille après inactivité et se réveille au premier appel (quelques centaines de ms).

## Développement local
`npm install`, puis `npx netlify dev` (CLI Netlify) pour lancer le site et les fonctions ensemble.

## Espace admin (/admin)
- **Tableau de bord** : encaissé du jour et du mois, dépenses, résultat, reste à encaisser, commandes à traiter.
- **Commandes** : recherche et filtres, saisie de commandes hors site (boutique, WhatsApp, téléphone) avec acompte, avancement (reçue, en cours, en production, prête, livrée), paiements multiples (espèces, MTN MoMo, Moov Money, virement…), reçus PDF numérotés par paiement, envoi par e-mail, historique complet par commande.
- **Comptabilité** : journal des entrées et sorties, dépenses par catégorie, export CSV, impression.
- **Rapports** : par période (jour, semaine, mois, année ou dates libres) : chiffre d'affaires, encaissé, dépenses, résultat, ventilation par statut, pôle, service, origine, mode de paiement, créances, meilleurs clients, graphique journalier. Export CSV et impression/PDF.
- **Journal** : trace de toutes les opérations (qui, quand, quoi). Rien n'est supprimé : un paiement ou une dépense erronés s'annulent avec un motif et restent visibles.
- **Contenu du site** : catalogue et prix, galerie de photos, messages reçus.

## Logo, onglet du navigateur et partages
- Le logo (icône « C » en dégradé rouge/orange) est dans `src/assets/logo.svg` (en-tête) et `src/seo/` (icône d'onglet `favicon.svg`, `favicon.ico`, `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `icon-512.png`). L'image de partage WhatsApp/Facebook est `src/assets/og.jpg`.
- Ce logo est une création de remplacement : pour utiliser le vrai logo de Creaflow, remplacez `logo.svg` et `favicon.svg` par votre fichier (carré, fond transparent de préférence) et régénérez les PNG/ICO avec un outil comme realfavicongenerator.net.

## SEO
- Chaque page publique est **prérendue** au build : titre, description, adresse canonique, Open Graph, Twitter, fil d'Ariane et données structurées (LocalBusiness, WebSite, Organization, Service, FAQPage, ContactPage) sont présents dans le HTML. Le build dure environ une minute de plus.
- `robots.txt` et `sitemap.xml` sont générés ; /admin, /suivi et /paiement sont en noindex.
- À faire une fois en ligne : remplacer `creaflow.bj` par votre vrai domaine (`src/environments/environment.ts`, `src/index.html`, `src/seo/robots.txt`, `src/seo/sitemap.xml`), ajouter le site dans Google Search Console (envoyer le sitemap) et créer la fiche Google Business Profile (adresse, horaires, photos, lien vers le site).

## Commande adaptée à chaque service
Le formulaire de l'étape 2 change selon le service : impression (couleur, format, recto-verso, finition), démarches (type de démarche, bénéficiaire, délai), CV, photo d'identité, logo (entreprise, style, livrables), flyers et cartes, bâches et roll-up (dimensions, finition), tee-shirts et casquettes (article, couleur, emplacement, tailles), badges et cachets. Les réponses arrivent dans la commande, section « Caractéristiques demandées » de l'admin. Dans Contenu du site > Catalogue, la colonne « Formulaire de commande » permet de choisir le formulaire d'un service (Automatique le déduit du nom). Les questions se modifient dans `src/app/core/forms.ts`.
