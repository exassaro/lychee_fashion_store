-- =====================================================================
-- LYCHEE — Supabase schema
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query.
-- It is idempotent: safe to re-run after edits.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type public.department as enum ('kids', 'ladies');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Admins (no public sign-up; rows are added via SQL or `npm run create-admin`)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Categories (subcategories under the fixed Kids / Ladies departments)
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  department  public.department not null,
  name        text not null check (char_length(name) between 1 and 60),
  slug        text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  image_url   text,
  image_path  text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  unique (department, slug)
);

-- ---------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------
create sequence if not exists public.product_code_kids_seq;
create sequence if not exists public.product_code_ladies_seq;

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 120),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  product_code  text not null unique,
  department    public.department not null,
  category_id   uuid references public.categories (id) on delete set null,
  description   text,
  fabric        text,
  colour        text,
  age_group     text,
  price         numeric(10, 2) not null check (price >= 0),
  mrp           numeric(10, 2) check (mrp is null or mrp >= price),
  tags          text[] not null default '{}',
  is_featured   boolean not null default false,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_department_idx on public.products (department);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_created_idx on public.products (created_at desc);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;

-- Auto-generate product_code (LY-K-0001 / LY-L-0001) and slug on insert.
create or replace function public.products_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.product_code is null or new.product_code = '' then
    if new.department = 'kids' then
      new.product_code := 'LY-K-' || lpad(nextval('public.product_code_kids_seq')::text, 4, '0');
    else
      new.product_code := 'LY-L-' || lpad(nextval('public.product_code_ladies_seq')::text, 4, '0');
    end if;
  end if;

  if new.slug is null or new.slug = '' then
    new.slug := public.slugify(new.name) || '-' || lower(replace(new.product_code, 'LY-', ''));
  end if;

  return new;
end;
$$;

drop trigger if exists products_before_insert on public.products;
create trigger products_before_insert
  before insert on public.products
  for each row execute function public.products_before_insert();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Product images & sizes
-- ---------------------------------------------------------------------
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  url          text not null,
  alt          text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

create table if not exists public.product_sizes (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        text not null check (char_length(size) between 1 and 20),
  stock       int not null default 0 check (stock >= 0),
  sort_order  int not null default 0,
  unique (product_id, size)
);

create index if not exists product_sizes_product_idx on public.product_sizes (product_id, sort_order);

-- Atomic +/- stock adjustment used by the admin quick-edit buttons.
create or replace function public.adjust_stock(p_size_id uuid, p_delta int)
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_stock int;
begin
  update public.product_sizes
     set stock = greatest(0, stock + p_delta)
   where id = p_size_id
  returning stock into new_stock;

  if new_stock is null then
    raise exception 'Size not found or not permitted';
  end if;

  update public.products set updated_at = now()
   where id = (select product_id from public.product_sizes where id = p_size_id);

  return new_stock;
end;
$$;

grant execute on function public.adjust_stock(uuid, int) to authenticated;

-- ---------------------------------------------------------------------
-- Store settings (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id               int primary key default 1 check (id = 1),
  store_name       text not null default 'LYCHEE',
  tagline          text not null default 'Fashion for Kids and Ladies',
  address          text,
  opening_hours    text,
  phone            text,
  whatsapp_number  text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{8,15}$'),
  email            text,
  instagram_url    text,
  facebook_url     text,
  maps_url         text,
  maps_embed_url   text,
  hero_title       text,
  hero_subtitle    text,
  hero_image_url   text,
  hero_image_path  text,
  about_text       text,
  updated_at       timestamptz not null default now()
);

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Listing view used by product grids, search and the admin table.
-- security_invoker = true → RLS of the underlying tables applies.
-- ---------------------------------------------------------------------
drop view if exists public.product_cards;
create view public.product_cards
with (security_invoker = true)
as
select
  p.id,
  p.name,
  p.slug,
  p.product_code,
  p.department,
  p.category_id,
  c.name  as category_name,
  c.slug  as category_slug,
  p.price,
  p.mrp,
  p.colour,
  p.tags,
  p.is_featured,
  p.is_visible,
  p.created_at,
  p.updated_at,
  (select pi.url from public.product_images pi
    where pi.product_id = p.id
    order by pi.sort_order, pi.created_at limit 1) as cover_url,
  (select pi.url from public.product_images pi
    where pi.product_id = p.id
    order by pi.sort_order, pi.created_at offset 1 limit 1) as hover_url,
  coalesce((select sum(s.stock) from public.product_sizes s where s.product_id = p.id), 0)::int as total_stock,
  (select count(*) from public.product_sizes s where s.product_id = p.id and s.stock between 1 and 2)::int as low_stock_count,
  coalesce((select array_agg(s.size order by s.sort_order) from public.product_sizes s
             where s.product_id = p.id and s.stock > 0), '{}'::text[]) as available_sizes
from public.products p
left join public.categories c on c.id = p.category_id;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.admins          enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_sizes   enable row level security;
alter table public.settings        enable row level security;

-- admins: a signed-in user may only see their own row. No writes through the API.
drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- categories
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories
  for select using (true);
drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products: public sees visible ones; admins see everything
drop policy if exists "products: public read visible" on public.products;
create policy "products: public read visible" on public.products
  for select using (is_visible or public.is_admin());
drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- product_images
drop policy if exists "product_images: public read visible" on public.product_images;
create policy "product_images: public read visible" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.is_visible or public.is_admin()))
  );
drop policy if exists "product_images: admin write" on public.product_images;
create policy "product_images: admin write" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- product_sizes
drop policy if exists "product_sizes: public read visible" on public.product_sizes;
create policy "product_sizes: public read visible" on public.product_sizes
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.is_visible or public.is_admin()))
  );
drop policy if exists "product_sizes: admin write" on public.product_sizes;
create policy "product_sizes: admin write" on public.product_sizes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings
drop policy if exists "settings: public read" on public.settings;
create policy "settings: public read" on public.settings
  for select using (true);
drop policy if exists "settings: admin write" on public.settings;
create policy "settings: admin write" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Grants (Supabase usually sets these by default; explicit for clarity)
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images,
               public.product_sizes, public.settings, public.product_cards to anon, authenticated;
grant select on public.admins to authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images,
               public.product_sizes, public.settings to authenticated;
grant usage on sequence public.product_code_kids_seq, public.product_code_ladies_seq to authenticated;

-- ---------------------------------------------------------------------
-- Storage: product-images bucket (public read via URL, admin-only write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve files by URL without a SELECT policy. Listing is limited to admins.
drop policy if exists "product-images: admin list" on storage.objects;
create policy "product-images: admin list" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images: admin insert" on storage.objects;
create policy "product-images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images: admin update" on storage.objects;
create policy "product-images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images: admin delete" on storage.objects;
create policy "product-images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- Default data (safe to re-run)
-- ---------------------------------------------------------------------
insert into public.settings (id, store_name, tagline, address, opening_hours, phone, hero_title, hero_subtitle, about_text)
values (
  1,
  'LYCHEE',
  'Fashion for Kids and Ladies',
  'Shop No. 12, Main Bazaar Road, Your City, Kerala 680001',
  'Mon–Sat: 10:00 AM – 9:00 PM' || chr(10) || 'Sun: 11:00 AM – 7:00 PM',
  '+91 98765 43210',
  'Fresh styles for little ones & you',
  'Frocks, kurtis, sets and more — handpicked every week. Browse online, order on WhatsApp.',
  'LYCHEE is a family-run readymade clothing store bringing comfortable, colourful and affordable fashion for kids and ladies. We handpick fresh stock every week so there is always something new to love.'
)
on conflict (id) do nothing;

insert into public.categories (department, name, slug, sort_order) values
  ('kids',   'Frocks',    'frocks',    1),
  ('kids',   'Tops',      'tops',      2),
  ('kids',   'Sets',      'sets',      3),
  ('kids',   'Nightwear', 'nightwear', 4),
  ('ladies', 'Kurtis',    'kurtis',    1),
  ('ladies', 'Tops',      'tops',      2),
  ('ladies', 'Sets',      'sets',      3),
  ('ladies', 'Nightwear', 'nightwear', 4)
on conflict (department, slug) do nothing;
