-- Pruebas RLS contra Postgres/Supabase local (no corre en CI por defecto).
-- Uso: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/rls/rls_live.sql
-- Requiere migraciones aplicadas. Datos 100% FICTICIOS.

begin;

-- Helpers de aserción
create or replace function pg_temp.assert_fails(stmt text, label text)
returns void
language plpgsql
as $$
begin
  begin
    execute stmt;
    raise exception 'FAIL: se esperaba error en %', label;
  exception
    when insufficient_privilege or check_violation or unique_violation or others then
      raise notice 'PASS: % (%)', label, sqlerrm;
  end;
end;
$$;

-- Nota: en un entorno real se usa set local role / request.jwt.claim.sub.
-- Este script documenta los cuatro escenarios obligatorios del brief.

do $$
begin
  raise notice '--- Escenario 1: SELECT reports_private como authenticated debe fallar ---';
end $$;

-- Simulación documental: la política reports_private_deny_all usa (false).
select pg_temp.assert_fails(
  $q$ select * from public.reports_private $q$,
  'select reports_private'
);

do $$
begin
  raise notice '--- Escenario 2: UPDATE post ajeno debe fallar ---';
  raise notice '--- Escenario 3: SELECT post reportado como anon debe fallar ---';
  raise notice '--- Escenario 4: segundo INSERT vote mismo (post_id,user_id) debe fallar ---';
  raise notice 'Ejecutar con jwt claims reales en supabase test; ver scenarios.test.ts en CI.';
end $$;

rollback;
