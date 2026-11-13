# Creaflow : site vitrine, commandes, paiement Mobile Money, administration
Angular 17 (pages prérendues) + Netlify Functions + base Neon (Postgres gratuit).

## Mise en ligne en 4 étapes

### 1. Base de données (Neon)
1. Créez un compte sur neon.tech, puis un projet.
2. **Pas besoin de créer d'utilisateur dans Neon** : le compte administrateur du site se crée sur le site lui-même (étape 4).
3. Ouvrez **SQL Editor**, collez tout le contenu de `database/schema.sql`, cliquez **Run**. (Rejouable sans risque.)
4. Toujours dans le SQL Editor, exécutez : `select value from settings where key='setup_code';` et **copiez le code** affiché (il servira une seule fois à l'étape 4).
5. Cliquez sur **Connect** (en haut du tableau de bord du projet) et copiez la **chaîne de connexion** (elle commence par `postgresql://`).

### 2. Netlify : une seule variable obligatoire
Site configuration > Environment variables > **Add a variable** :
- Key : `DATABASE_URL` (sans espace, sans guillemets)
- Value : la chaîne de connexion Neon copiée à l'étape 1 (sans guillemets non plus)

Tout le reste est facultatif :
| Variable | Sert à |
|---|---|
| `SITE_URL` | adresse du site (retour de paiement), ex. `https://creaflow.netlify.app` |
| `FEDAPAY_SECRET_KEY`, `FEDAPAY_ENV` (`sandbox` puis `live`) | paiement Mobile Money |
| `RESEND_API_KEY`, `RECEIPT_FROM` | envoi des reçus et des notifications par e-mail |
| `NOTIFY_EMAIL` | e-mail qui reçoit les nouvelles commandes et messages |

Si Netlify refuse d'enregistrer une variable : relevez le message exact. Vérifiez aussi que la clé ne contient ni espace ni guillemets, que la valeur est collée seule (pas `CLE=valeur`), et réessayez en choisissant « Same value for all deploy contexts ». Autre voie, avec le terminal : `npx netlify-cli login`, `npx netlify-cli link`, puis `npx netlify-cli env:set DATABASE_URL "postgresql://..."`.

### 3. Déploiement
Poussez le projet sur GitHub, puis Netlify > Add new site > Import from Git. `netlify.toml` règle tout. Redéployez après avoir ajouté `DATABASE_URL`.

### 4. Créer le compte administrateur
Ouvrez `https://VOTRE-SITE/admin`. Au premier lancement, la page « Créer le compte administrateur » apparaît : saisissez le **code d'installation** (étape 1.4), votre e-mail et un mot de passe de 10 caractères minimum. Le code est ensuite supprimé automatiquement. Le mot de passe se change dans **Mon compte**.

Mot de passe oublié : dans le SQL Editor de Neon, exécutez `delete from admin_users; delete from settings where key='setup_code';` puis relancez `database/schema.sql` et relisez le nouveau code.

## Paiement FedaPay
Dans FedaPay > Webhooks, ajoutez `https://VOTRE-SITE/api/fedapay-webhook` (événement `transaction.approved`). Testez en `sandbox` avant `live`.

## Logo, onglet du navigateur, partages
- `src/assets/logo.png` : logo complet (pied de page, documents). `src/assets/logo-wordmark.png` : « CRÉAFLOW » seul (en-tête du site).
- `src/seo/` : icônes d'onglet et d'application (`favicon.ico`, `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `icon-512.png`). `src/assets/og.jpg` : image affichée quand le lien est partagé.

## SEO
Chaque page publique est prérendue au build : titre, description, adresse canonique, Open Graph, fil d'Ariane et données structurées sont dans le HTML. Une fois en ligne : remplacez `creaflow.bj` par votre domaine (`src/environments/environment.ts`, `src/index.html`, `src/seo/robots.txt`, `src/seo/sitemap.xml`), ajoutez le site dans Google Search Console (envoyez le sitemap) et créez la fiche Google Business Profile.

## À compléter avant le lancement
- `src/app/pages/legal.component.ts` : raison sociale, IFU, RCCM, hébergeur.
- Dans /admin : prix du catalogue (Contenu du site), photos réelles de la galerie.

## Espace admin (/admin)
Tableau de bord, commandes (saisie hors site, avancement, paiements, reçus PDF numérotés, historique), comptabilité (entrées, dépenses, export CSV), rapports par période, journal de toutes les opérations, contenu du site (catalogue et formulaires de commande, galerie, messages), mon compte.

## Commande adaptée à chaque service
Le formulaire de l'étape 2 change selon le service. Les questions se modifient dans `src/app/core/forms.ts`, et le formulaire d'un service se choisit dans Contenu du site > Catalogue.

## Limites
- Fichiers de commande : 4 Mo chacun, 5 par commande.
- Sans `RESEND_API_KEY`, aucun e-mail ne part : le reçu PDF reste téléchargeable depuis l'admin.
- Neon gratuit se met en veille après inactivité et se réveille au premier appel.


## Tester en local (Windows PowerShell)
`ng serve` seul affiche le site mais **n'a pas de serveur** : /admin, la commande et les paiements ne peuvent pas fonctionner. Pour tout tester en local :
1. Le fichier `.env` est déjà à la racine du projet : ouvrez-le et remplacez la ligne `DATABASE_URL=...` par votre chaîne Neon (sans guillemets ni espaces). Ce fichier est ignoré par Git : ne le publiez et ne le partagez jamais, il contient le mot de passe de votre base. (Sous Windows, les fichiers commençant par un point sont parfois masqués : activez « Éléments masqués » dans l'Explorateur.)
2. Lancez `npx netlify-cli dev` (acceptez l'installation si demandé).
3. Ouvrez **http://localhost:8888** (et non 4200). /admin fonctionne alors comme en ligne.

## Plusieurs administrateurs
Admin > **Mon compte et équipe** : ajoutez une personne avec son e-mail et un mot de passe provisoire, réinitialisez un mot de passe oublié, supprimez un compte (l'accès est coupé immédiatement). Chaque action du journal porte l'e-mail de son auteur. Tous les comptes ont les mêmes droits.

## Reçu par WhatsApp
Dans le détail d'une commande, le bouton **WhatsApp** (à côté de chaque paiement, ou « Récapitulatif par WhatsApp ») ouvre WhatsApp avec le message prêt, qui contient un lien vers le reçu PDF. Il suffit d'appuyer sur Envoyer. Le lien est personnel (impossible à deviner) et valable 180 jours. Le numéro est converti au format international (Bénin : 229 + 10 chiffres).

## Mes commandes (côté client)
Chaque commande passée est retenue sur l'appareil du client et apparaît dans **Mes commandes** (menu du site) avec son avancement, les montants, le bouton « Payer le reste en ligne » et le téléchargement du reçu PDF. Le client peut aussi retrouver une commande avec son numéro et son téléphone. Rien n'est stocké ailleurs que sur son appareil.

## Galerie de réalisations et catégories
Admin > Contenu du site > **Galerie** : choisissez une catégorie existante ou « ＋ Nouvelle catégorie… », sélectionnez une ou plusieurs photos et cliquez sur Publier. Les photos sont réduites automatiquement (1600 px), ce qui accepte aussi les grosses photos de téléphone. La carte « Catégories » permet de créer, renommer et supprimer (si elle est vide) ; chaque photo peut être renommée ou déplacée vers une autre catégorie. Sur le site, la page Réalisations affiche les catégories en filtres avec leur nombre de photos ; toutes les cartes ont la même taille.
