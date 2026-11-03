-- Cuadra · Agente A
-- Tablas del contrato (docs/contracts.md §1)

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  bbox jsonb,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudonym text not null,
  role public.user_role not null default 'ciudadano',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_pseudonym_ci_unique on public.profiles (lower(pseudonym));

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  zone_id uuid not null references public.zones (id),
  type public.incident_type not null,
  status public.post_status not null default 'reportado',
  title text not null,
  body text not null,
  grid_lat numeric(8, 4) not null,
  grid_lng numeric(8, 4) not null,
  is_establishment boolean not null default false,
  publish_gate public.publish_gate not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_zone_created_idx on public.posts (zone_id, created_at desc);
create index posts_status_idx on public.posts (status);
create index posts_type_idx on public.posts (type);
create index posts_grid_idx on public.posts (zone_id, type, grid_lat, grid_lng);

create table public.reports_private (
  post_id uuid primary key references public.posts (id) on delete cascade,
  lat numeric not null,
  lng numeric not null,
  evidence_path text,
  raw_notes text,
  created_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null default 1 check (value = 1),
  created_at timestamptz not null default now(),
  constraint votes_post_user_unique unique (post_id, user_id)
);

create index votes_post_idx on public.votes (post_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index comments_post_idx on public.comments (post_id, created_at);

create table public.official_responses (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  status_after public.post_status not null,
  created_at timestamptz not null default now()
);

create table public.follow_up_codes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index follow_up_codes_hash_idx on public.follow_up_codes (code_hash);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete set null,
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id uuid not null,
  actor_id uuid not null references public.profiles (id),
  action public.mod_action not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index moderation_actions_post_idx on public.moderation_actions (post_id, created_at desc);
