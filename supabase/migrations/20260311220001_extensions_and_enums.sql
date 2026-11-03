-- Cuadra · Agente A
-- Extensiones y enumeraciones (docs/contracts.md §1–§2)

-- En Supabase, PostGIS / pgcrypto viven en schema `extensions`.
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.post_status as enum (
  'reportado',
  'en_verificacion',
  'corroborado',
  'derivado',
  'resuelto',
  'sin_respuesta'
);

create type public.incident_type as enum (
  'robo',
  'acoso',
  'vandalismo',
  'consumo_via_publica',
  'convivencia_nocturna'
);

create type public.user_role as enum (
  'ciudadano',
  'moderador',
  'autoridad',
  'admin'
);

create type public.publish_gate as enum (
  'pending_evidence',
  'pending_corroboration',
  'published'
);

create type public.mod_action as enum (
  'hide',
  'restore',
  'escalate',
  'reject_gate',
  'approve_gate'
);

-- Parámetros de dominio (C-01 pendiente: precisión de grilla;
-- umbral de votos no fijado en contrato → default 3).
create table public.app_settings (
  key text primary key,
  value text not null,
  description text
);

insert into public.app_settings (key, value, description) values
  ('grid_decimals', '4', 'Decimales de round_grid / grid_lat|lng (≈11 m). C-01.'),
  ('vote_threshold', '3', 'Votos de usuarios distintos para en_verificacion → corroborado.'),
  ('establishment_window_days', '30', 'Ventana de reportes independientes (C-02).');
