-- Cuadra · Agente A
-- round_grid: única vía pública de ubicación (docs/contracts.md §4)
-- Precisión: 4 decimales ≈ 11 m (C-01 PENDING_APPROVAL; valor del ejemplo del contrato).

create or replace function public.app_setting(p_key text, p_default text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select value from public.app_settings where key = p_key),
    p_default
  );
$$;

-- Redondeo fijo a 4 decimales (numeric(8,4) del contrato).
create or replace function public.round_grid(lat numeric, lng numeric)
returns table (grid_lat numeric(8, 4), grid_lng numeric(8, 4))
language sql
immutable
as $$
  select
    round(lat, 4)::numeric(8, 4) as grid_lat,
    round(lng, 4)::numeric(8, 4) as grid_lng;
$$;

comment on function public.round_grid(numeric, numeric) is
  'Redondea lat/lng a la grilla pública (4 decimales ≈ 11 m). Única forma de exponer ubicación.';

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('moderador', 'autoridad', 'admin')
  );
$$;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('moderador', 'admin')
  );
$$;

-- Conteo de votos vía función agregada (no listar filas ajenas)
create or replace function public.vote_count(p_post_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.votes where post_id = p_post_id;
$$;

revoke all on function public.vote_count(uuid) from public;
grant execute on function public.vote_count(uuid) to anon, authenticated;

-- Lectura privilegiada de reports_private (solo SECURITY DEFINER)
create or replace function public.get_report_private(p_post_id uuid)
returns public.reports_private
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.reports_private;
begin
  if not public.is_staff() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  select * into row from public.reports_private where post_id = p_post_id;
  return row;
end;
$$;

revoke all on function public.get_report_private(uuid) from public;
grant execute on function public.get_report_private(uuid) to authenticated;

create or replace function public.independent_establishment_reports(
  p_zone_id uuid,
  p_type public.incident_type,
  p_grid_lat numeric,
  p_grid_lng numeric,
  p_window_days int default 30
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct author_id)::integer
  from public.posts
  where zone_id = p_zone_id
    and type = p_type
    and grid_lat = p_grid_lat
    and grid_lng = p_grid_lng
    and is_establishment = true
    and author_id is not null
    and created_at >= now() - make_interval(days => p_window_days);
$$;
