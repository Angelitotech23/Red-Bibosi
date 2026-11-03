-- Correctivas auditoría Supabase↔ Vercel (C1–C3, C6 parcial)
-- - Lectura pública de posts published en todos los estados de ciclo
-- - Vista posts_public sin author_id ni pseudónimo
-- - Profiles no listables por anon
-- - RPC create_post_anonymous (solo service_role) para alta sin sesión PII

-- —— 1. Vista pública anónima ——
create or replace view public.posts_public
with (security_invoker = true)
as
select
  p.id,
  p.zone_id,
  p.type,
  p.status,
  p.title,
  p.body,
  p.grid_lat,
  p.grid_lng,
  p.is_establishment,
  p.publish_gate,
  p.created_at,
  p.updated_at,
  public.vote_count(p.id) as vote_count
from public.posts p
where p.publish_gate = 'published'
  and p.status in (
    'reportado',
    'en_verificacion',
    'corroborado',
    'derivado',
    'resuelto',
    'sin_respuesta'
  );

comment on view public.posts_public is
  'Capa pública: sin author_id, sin pseudónimo, sin coords exactas.';

grant select on public.posts_public to anon, authenticated;

-- —— 2. RLS posts: feed público amplio si published ——
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts
  for select to anon, authenticated
  using (
    (
      publish_gate = 'published'
      and status in (
        'reportado',
        'en_verificacion',
        'corroborado',
        'derivado',
        'resuelto',
        'sin_respuesta'
      )
    )
    or author_id = auth.uid()
    or public.is_moderator_or_admin()
    or public.is_staff()
  );

-- —— 3. Profiles: no exposición pública ——
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_restricted on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_moderator_or_admin()
    or public.is_staff()
  );

-- —— 4. Alta anónima vía server (service_role) ——
create or replace function public.create_post_anonymous(
  p_zone_id uuid,
  p_type public.incident_type,
  p_title text,
  p_body text,
  p_lat numeric,
  p_lng numeric,
  p_is_establishment boolean,
  p_evidence_path text default null,
  p_raw_notes text default null
)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
  new_post public.posts;
  gate public.publish_gate;
begin
  select * into g from public.round_grid(p_lat, p_lng);

  if p_is_establishment then
    if p_evidence_path is not null and length(trim(p_evidence_path)) > 0 then
      gate := 'published';
    else
      gate := 'pending_evidence';
    end if;
  else
    gate := 'published';
  end if;

  insert into public.posts (
    author_id, zone_id, type, status, title, body,
    grid_lat, grid_lng, is_establishment, publish_gate
  ) values (
    null, p_zone_id, p_type, 'reportado', p_title, p_body,
    g.grid_lat, g.grid_lng, coalesce(p_is_establishment, false), gate
  )
  returning * into new_post;

  insert into public.reports_private (post_id, lat, lng, evidence_path, raw_notes)
  values (new_post.id, p_lat, p_lng, p_evidence_path, p_raw_notes);

  new_post := public.apply_establishment_gate(new_post);
  update public.posts
    set publish_gate = new_post.publish_gate
  where id = new_post.id;

  return new_post;
end;
$$;

revoke all on function public.create_post_anonymous(
  uuid, public.incident_type, text, text, numeric, numeric, boolean, text, text
) from public;
-- Solo el backend con service_role; no exponer a anon via PostgREST abierto
grant execute on function public.create_post_anonymous(
  uuid, public.incident_type, text, text, numeric, numeric, boolean, text, text
) to service_role;

-- —— 5. Mapeo de categorías de feed (referencia) ——
insert into public.app_settings (key, value, description) values
  (
    'feed_category_map',
    '{"maleantes_robos":["robo","acoso"],"zonas_peligro_alumbrado":["vandalismo","consumo_via_publica"],"locales_boliches":["convivencia_nocturna"]}',
    'Mapeo UI feed (3 categorías) → incident_type'
  )
on conflict (key) do update set value = excluded.value, description = excluded.description;
