-- Thumair V1 schema (no payments)

create extension if not exists pg_trgm;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  phone text,
  avatar_url text,
  locale text not null default 'ar',
  created_at timestamptz not null default now()
);

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('farm', 'buyer')),
  name text not null,
  slug text not null unique,
  bio text,
  city text,
  region text,
  country text not null default 'SA',
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists organization_members_user_id_idx on public.organization_members (user_id);

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  category text,
  unit text,
  price_min numeric,
  price_max numeric,
  currency text not null default 'SAR',
  available_quantity numeric,
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'archived')),
  city text,
  region text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_org_id_idx on public.listings (org_id);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_title_trgm_idx on public.listings using gin (title gin_trgm_ops);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_city_idx on public.listings (city);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_images_listing_id_idx on public.listing_images (listing_id);

-- Favorites
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists favorites_listing_id_idx on public.favorites (listing_id);

-- Chat
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('buyer', 'seller')),
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_id_idx on public.conversation_participants (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

