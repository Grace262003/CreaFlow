-- À exécuter dans l'éditeur SQL de Neon (neon.tech). Peut être rejoué sans risque (mise à jour incluse).
create table if not exists services (id uuid primary key default gen_random_uuid(), pole text not null, name text not null, hint text default '', price numeric, unit text default '', active boolean default true, sort int default 0);
create table if not exists gallery (id uuid primary key default gen_random_uuid(), title text, category text, path text not null, created_at timestamptz default now());
create sequence if not exists order_seq;
create table if not exists orders (id uuid primary key default gen_random_uuid(), code text unique not null, service_id uuid references services on delete set null, service text not null, details text, quantity int default 1,
  customer_name text not null, customer_phone text not null, phone_key text not null, customer_email text, delivery text default 'retrait', files jsonb default '[]',
  status text not null default 'reçue', total numeric, paid numeric not null default 0, created_at timestamptz default now());
create table if not exists payments (ref text primary key, order_id uuid references orders, amount numeric, created_at timestamptz default now());
create table if not exists messages (id uuid primary key default gen_random_uuid(), name text, phone text, email text, message text not null, read boolean default false, created_at timestamptz default now());
insert into services(pole,name,hint,sort) select * from (values
('impression','Photocopie noir et blanc / couleur','Format, pages, exemplaires',1),('impression','Impression noir et blanc / couleur','Format, pages',2),('impression','Reliure, pelliculage, plastification','Finition, quantité',3),
('informatique','Saisie et mise en page','Pages, délai',4),('informatique','Démarches (acte, CIP, NPI, IFU, passeport…)','Document voulu',5),('informatique','CV et lettre de motivation','Domaine, poste visé',6),('informatique','Photo d’identité','Nombre de photos',7),
('graphisme','Flyers, cartes de visite, affiches','Format, quantité',8),('graphisme','Logo et identité visuelle','Activité, couleurs',9),('graphisme','Bâche, roll-up, banderole','Dimensions',10),('graphisme','Tee-shirts, casquettes, polos, sacs','Quantité, tailles',11),('graphisme','Badges, porte-clés, cachets','Quantité, modèle',12)
) v(pole,name,hint,sort) where not exists (select 1 from services);

-- ===== Gestion administrateur : commandes hors site, paiements, comptabilité, journal =====
alter table orders add column if not exists source text default 'site';
alter table orders add column if not exists notes text;
alter table orders add column if not exists due_date date;
create sequence if not exists receipt_seq;
alter table payments add column if not exists method text default 'autre';
alter table payments add column if not exists note text;
alter table payments add column if not exists receipt_no text;
alter table payments add column if not exists recorded_by text;
alter table payments add column if not exists paid_at timestamptz default now();
alter table payments add column if not exists voided boolean not null default false;
alter table payments add column if not exists void_reason text;
alter table payments add column if not exists voided_at timestamptz;
create table if not exists expenses (id uuid primary key default gen_random_uuid(), spent_at date not null default current_date, category text not null, label text not null, amount numeric not null,
  method text default 'espèces', note text, voided boolean not null default false, void_reason text, created_at timestamptz default now());
create table if not exists audit_log (id uuid primary key default gen_random_uuid(), at timestamptz not null default now(), actor text, action text not null, entity text, entity_id text, detail text);
create index if not exists audit_entity on audit_log(entity, entity_id);
create index if not exists audit_at on audit_log(at);
create index if not exists orders_created on orders(created_at);
create index if not exists payments_paid on payments(paid_at);

-- ===== Commande adaptée à chaque service =====
alter table orders add column if not exists options jsonb default '[]';
alter table services add column if not exists form text;
