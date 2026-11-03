-- Seed Cuadra — Agente A
-- DATOS FICTICIOS de demostración. No son personas reales ni secretos.
-- Zonas de referencia de Santa Cruz de la Sierra (Bolivia).

insert into public.zones (id, slug, name, bbox) values
  (
    'a1000000-0000-4000-8000-000000000001',
    'equipetrol',
    'Equipetrol (demo)',
    '{"sw":[-17.783,-63.198],"ne":[-17.755,-63.168],"note":"FICTICIO bbox aproximado"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'plan_3000',
    'Plan 3000 (demo)',
    '{"sw":[-17.820,-63.140],"ne":[-17.780,-63.100],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'uv_128',
    'UV 128 (demo)',
    '{"sw":[-17.800,-63.200],"ne":[-17.785,-63.180],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'centro',
    'Centro (demo)',
    '{"sw":[-17.790,-63.190],"ne":[-17.770,-63.170],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'la_ramada',
    'La Ramada (demo)',
    '{"sw":[-17.810,-63.170],"ne":[-17.790,-63.150],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'el_trigo',
    'El Trigo (demo)',
    '{"sw":[-17.830,-63.160],"ne":[-17.810,-63.140],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'los_cholitos',
    'Los Cholitos (demo)',
    '{"sw":[-17.850,-63.150],"ne":[-17.830,-63.130],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'norte',
    'Norte / Urubó acceso (demo)',
    '{"sw":[-17.740,-63.220],"ne":[-17.700,-63.180],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-000000000009',
    'santos_dumont',
    'Santos Dumont (demo)',
    '{"sw":[-17.800,-63.160],"ne":[-17.780,-63.140],"note":"FICTICIO"}'::jsonb
  ),
  (
    'a1000000-0000-4000-8000-00000000000a',
    'palmaira',
    'Palmaira (demo)',
    '{"sw":[-17.770,-63.210],"ne":[-17.750,-63.190],"note":"FICTICIO"}'::jsonb
  )
on conflict (slug) do update set
  name = excluded.name,
  bbox = excluded.bbox;

-- Posts de ejemplo FICTICIOS (sin author_id real; demos de UI/mapa).
-- Solo grilla pública; sin reports_private (evita dependencia de auth.users).
insert into public.posts (
  id, author_id, zone_id, type, status, title, body,
  grid_lat, grid_lng, is_establishment, publish_gate
) values
  (
    'b2000000-0000-4000-8000-000000000001',
    null,
    'a1000000-0000-4000-8000-000000000001',
    'robo',
    'corroborado',
    '[FICTICIO] Intento de hurto en vía peatonal',
    'Reporte de demostración. Sin datos de personas reales. Grilla redondeada únicamente.',
    -17.7730,
    -63.1830,
    false,
    'published'
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    null,
    'a1000000-0000-4000-8000-000000000002',
    'vandalismo',
    'derivado',
    '[FICTICIO] Daño a mobiliario urbano',
    'Caso demo derivado a autoridad. Contenido sintético para seed.',
    -17.8000,
    -63.1200,
    false,
    'published'
  ),
  (
    'b2000000-0000-4000-8000-000000000003',
    null,
    'a1000000-0000-4000-8000-000000000004',
    'acoso',
    'resuelto',
    '[FICTICIO] Situación de acoso reportada y atendida',
    'Ejemplo resuelto. No corresponde a un hecho real.',
    -17.7800,
    -63.1800,
    false,
    'published'
  ),
  (
    'b2000000-0000-4000-8000-000000000004',
    null,
    'a1000000-0000-4000-8000-000000000005',
    'convivencia_nocturna',
    'reportado',
    '[FICTICIO] Ruido nocturno cerca de establecimiento (gated)',
    'Demo de gate: no debe listarse en capa pública hasta evidencia o 3 reportes.',
    -17.8000,
    -63.1600,
    true,
    'pending_evidence'
  )
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  status = excluded.status,
  publish_gate = excluded.publish_gate,
  grid_lat = excluded.grid_lat,
  grid_lng = excluded.grid_lng;
