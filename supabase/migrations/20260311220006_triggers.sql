-- Cuadra · Agente A
-- Triggers: votos → estados, gate establecimientos, auditoría de moderación

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Solo moderador/admin pueden cambiar role; el ciudadano solo su pseudónimo
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_moderator_or_admin() then
    raise exception 'FORBIDDEN: no se puede cambiar role' using errcode = '42501';
  end if;
  if old.id is distinct from new.id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Crear perfil al registrar usuario (Auth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_pseudo text;
  final_pseudo text;
begin
  base_pseudo := coalesce(
    nullif(trim(new.raw_user_meta_data->>'pseudonym'), ''),
    'vecino_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );
  final_pseudo := base_pseudo;
  -- Evitar colisión trivial
  if exists (select 1 from public.profiles where lower(pseudonym) = lower(final_pseudo)) then
    final_pseudo := base_pseudo || '_' || substr(replace(new.id::text, '-', ''), 1, 4);
  end if;

  insert into public.profiles (id, pseudonym, role)
  values (new.id, final_pseudo, 'ciudadano');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ¿Puede pasar a corroborado? (regla convivencia_nocturna + establecimiento)
create or replace function public.can_corroborate(p public.posts)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_evidence boolean;
  independent_count int;
  window_days int;
begin
  -- Regla especial: convivencia_nocturna + establecimiento
  if p.type = 'convivencia_nocturna' and p.is_establishment then
    select (rp.evidence_path is not null and length(trim(rp.evidence_path)) > 0)
      into has_evidence
    from public.reports_private rp
    where rp.post_id = p.id;

    window_days := coalesce(public.app_setting('establishment_window_days', '30')::int, 30);
    independent_count := public.independent_establishment_reports(
      p.zone_id, p.type, p.grid_lat, p.grid_lng, window_days
    );

    return coalesce(has_evidence, false) or independent_count >= 3;
  end if;

  return true;
end;
$$;

-- Aplicar publish_gate de establecimientos (§5)
create or replace function public.apply_establishment_gate(p public.posts)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  has_evidence boolean;
  independent_count int;
  window_days int;
  out_row public.posts := p;
begin
  if not p.is_establishment then
    out_row.publish_gate := 'published';
    return out_row;
  end if;

  select (rp.evidence_path is not null and length(trim(rp.evidence_path)) > 0)
    into has_evidence
  from public.reports_private rp
  where rp.post_id = p.id;

  window_days := coalesce(public.app_setting('establishment_window_days', '30')::int, 30);
  independent_count := public.independent_establishment_reports(
    p.zone_id, p.type, p.grid_lat, p.grid_lng, window_days
  );

  if coalesce(has_evidence, false) then
    out_row.publish_gate := 'published';
  elsif independent_count >= 3 then
    out_row.publish_gate := 'published';
  elsif coalesce(has_evidence, false) = false and independent_count < 3 then
    out_row.publish_gate := case
      when independent_count >= 1 then 'pending_corroboration'
      else 'pending_evidence'
    end;
  end if;

  return out_row;
end;
$$;

-- Tras insertar voto: umbral → en_verificacion → corroborado
create or replace function public.on_vote_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  threshold int;
  vcount int;
  p public.posts;
  gated public.posts;
begin
  threshold := coalesce(public.app_setting('vote_threshold', '3')::int, 3);
  vcount := public.vote_count(new.post_id);

  select * into p from public.posts where id = new.post_id for update;
  if not found then
    return new;
  end if;

  -- Gate de publicación para establecimientos
  gated := public.apply_establishment_gate(p);
  if gated.publish_gate is distinct from p.publish_gate then
    update public.posts
      set publish_gate = gated.publish_gate,
          updated_at = now()
    where id = p.id;
    p.publish_gate := gated.publish_gate;
  end if;

  if vcount < threshold then
    return new;
  end if;

  -- Alcanzó umbral: primero en_verificacion
  if p.status = 'reportado' then
    update public.posts
      set status = 'en_verificacion',
          updated_at = now()
    where id = p.id;
    p.status := 'en_verificacion';
  end if;

  -- Luego corroborado si la regla lo permite
  if p.status = 'en_verificacion' and public.can_corroborate(p) then
    update public.posts
      set status = 'corroborado',
          updated_at = now()
    where id = p.id
      and status = 'en_verificacion';
  end if;

  return new;
end;
$$;

drop trigger if exists votes_after_insert_status on public.votes;
create trigger votes_after_insert_status
  after insert on public.votes
  for each row execute function public.on_vote_inserted();

-- Cualquier cambio de estado por moderador → moderation_actions
create or replace function public.on_post_status_changed_by_moderator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and public.is_moderator_or_admin()
     and auth.uid() is not null
  then
    insert into public.moderation_actions (
      post_id, target_type, target_id, actor_id, action, reason
    ) values (
      new.id,
      'post',
      new.id,
      auth.uid(),
      case
        when new.status in ('derivado') then 'escalate'::public.mod_action
        when new.status in ('reportado') and old.status in ('corroborado', 'en_verificacion') then 'restore'::public.mod_action
        when new.publish_gate = 'published' and old.publish_gate <> 'published' then 'approve_gate'::public.mod_action
        else 'escalate'::public.mod_action
      end,
      format('Cambio de estado: %s → %s', old.status, new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists posts_status_moderation_audit on public.posts;
create trigger posts_status_moderation_audit
  after update of status on public.posts
  for each row execute function public.on_post_status_changed_by_moderator();

-- Helper SECURITY DEFINER: crear post + reports_private con grilla
create or replace function public.create_post_with_private(
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
  if auth.uid() is null then
    raise exception 'UNAUTHORIZED' using errcode = '28000';
  end if;

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
    auth.uid(), p_zone_id, p_type, 'reportado', p_title, p_body,
    g.grid_lat, g.grid_lng, coalesce(p_is_establishment, false), gate
  )
  returning * into new_post;

  insert into public.reports_private (post_id, lat, lng, evidence_path, raw_notes)
  values (new_post.id, p_lat, p_lng, p_evidence_path, p_raw_notes);

  -- Reevaluar gate con conteo de reportes independientes
  new_post := public.apply_establishment_gate(new_post);
  update public.posts
    set publish_gate = new_post.publish_gate
  where id = new_post.id;

  return new_post;
end;
$$;

revoke all on function public.create_post_with_private(
  uuid, public.incident_type, text, text, numeric, numeric, boolean, text, text
) from public;
grant execute on function public.create_post_with_private(
  uuid, public.incident_type, text, text, numeric, numeric, boolean, text, text
) to authenticated;
