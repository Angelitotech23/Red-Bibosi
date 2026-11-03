-- Cuadra · Agente A
-- Vista pública: sin coords exactas ni reports_private (docs/contracts.md §4)

create or replace view public.posts_public
with (security_invoker = true)
as
select
  p.id,
  p.author_id,
  pr.pseudonym as author_pseudonym,
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
left join public.profiles pr on pr.id = p.author_id
where p.publish_gate = 'published'
  and p.status in ('corroborado', 'derivado', 'resuelto');

comment on view public.posts_public is
  'Capa pública de posts: solo grilla redondeada, sin reports_private ni lat/lng exactos.';

grant select on public.posts_public to anon, authenticated;
