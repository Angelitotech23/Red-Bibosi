-- Cuadra · Agente A
-- RLS en todas las tablas (docs/contracts.md + brief Agente A)

alter table public.app_settings enable row level security;
alter table public.zones enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reports_private enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.official_responses enable row level security;
alter table public.follow_up_codes enable row level security;
alter table public.moderation_actions enable row level security;

-- —— app_settings: lectura autenticada; escritura solo admin vía service role ——
create policy app_settings_select on public.app_settings
  for select to authenticated
  using (true);

-- —— zones: lectura pública ——
create policy zones_select_public on public.zones
  for select to anon, authenticated
  using (true);

create policy zones_write_staff on public.zones
  for all to authenticated
  using (public.is_moderator_or_admin())
  with check (public.is_moderator_or_admin());

-- —— profiles ——
create policy profiles_select_public on public.profiles
  for select to anon, authenticated
  using (true);

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- El usuario edita solo su fila; el trigger bloquea cambio de role
create policy profiles_update_own_pseudonym on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_moderator_or_admin())
  with check (id = auth.uid() or public.is_moderator_or_admin());

-- —— posts ——
-- Lectura pública solo en estados publicados del contrato;
-- autor y moderadores ven el resto.
create policy posts_select on public.posts
  for select to anon, authenticated
  using (
    (
      status in ('corroborado', 'derivado', 'resuelto')
      and publish_gate = 'published'
    )
    or author_id = auth.uid()
    or public.is_moderator_or_admin()
    or public.is_staff()
  );

create policy posts_insert_auth on public.posts
  for insert to authenticated
  with check (author_id = auth.uid() or author_id is null);

create policy posts_update_author on public.posts
  for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());

create policy posts_delete_mods on public.posts
  for delete to authenticated
  using (public.is_moderator_or_admin());

-- —— reports_private: nadie lee/escribe directo; solo funciones SECURITY DEFINER ——
-- Sin políticas de SELECT/INSERT/UPDATE/DELETE para anon/authenticated.
-- El service_role de Supabase bypasea RLS cuando hace falta en el servidor.
create policy reports_private_deny_all on public.reports_private
  for all to anon, authenticated
  using (false)
  with check (false);

-- —— votes: insertar y leer solo los propios ——
create policy votes_select_own on public.votes
  for select to authenticated
  using (user_id = auth.uid() or public.is_moderator_or_admin());

create policy votes_insert_own on public.votes
  for insert to authenticated
  with check (user_id = auth.uid());

create policy votes_delete_own on public.votes
  for delete to authenticated
  using (user_id = auth.uid() or public.is_moderator_or_admin());

-- —— comments ——
create policy comments_select_public on public.comments
  for select to anon, authenticated
  using (deleted_at is null or author_id = auth.uid() or public.is_moderator_or_admin());

create policy comments_insert_auth on public.comments
  for insert to authenticated
  with check (author_id = auth.uid());

create policy comments_update_own on public.comments
  for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());

-- —— official_responses ——
create policy official_responses_select on public.official_responses
  for select to anon, authenticated
  using (true);

create policy official_responses_insert_authority on public.official_responses
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('autoridad', 'admin')
    )
  );

-- —— follow_up_codes: sin listado público; solo service role / definer ——
create policy follow_up_codes_deny on public.follow_up_codes
  for all to anon, authenticated
  using (false)
  with check (false);

-- —— moderation_actions: solo rol moderador/admin ——
create policy moderation_actions_select_mods on public.moderation_actions
  for select to authenticated
  using (public.is_moderator_or_admin());

create policy moderation_actions_insert_mods on public.moderation_actions
  for insert to authenticated
  with check (
    public.is_moderator_or_admin()
    and actor_id = auth.uid()
  );
