# Seguridad — RED Bibosi

La confianza ciudadana se pierde una sola vez. Tratamos vulnerabilidades en privado y con evidencia.

## Qué reportar

- Bypass de autenticación o de RLS
- Exposición de coordenadas exactas, evidencia privada o PII
- Filtración de secretos (`service_role`, tokens, claves)
- Inyección, XSS almacenado, IDOR en APIs de casos/seguimiento
- Abuso de rate limits o de códigos de seguimiento

## Qué no hacer

- No abras un **issue público** con PoC explotable.
- No publiques dumps, `.env`, ni rutas de evidencia reales.
- No contactes a usuarios afectados por tu cuenta con datos sensibles.

## Cómo reportar

1. Usa el canal privado del maintainer del repositorio (GitHub Security Advisories si está habilitado, o mensaje directo al owner `Angelitotech23` describiendo el hallazgo **sin** pegar secretos completos).
2. Incluye: impacto, pasos de reproducción mínimos, entorno (prod/preview/local), y si el dato ya quedó expuesto.
3. Espera acuse. Priorizamos: secreto filtrado → PII/coords → auth/RLS → resto.

## Compromiso de respuesta

- Acuse inicial: lo antes posible en horario de trabajo del equipo.
- Mitigación: rotar secretos, cerrar endpoint, o hotfix con PR urgente.
- Comunicación pública: solo después de mitigar, sin detalles explotables.

## Principios del producto (recordatorio)

- Ninguna respuesta pública incluye `lat`/`lng` exactos.
- Storage de evidencia es privado; lectura solo server-side con rol adecuado.
- Establecimientos: evidencia o 3 reportes independientes antes de publicar.
- Cero secretos en el código o en el historial de git.

## Alcance fuera de bug bounty (por ahora)

No operamos un programa de recompensas pagadas en esta etapa. Agradecemos reportes responsables; el reconocimiento público se acuerda con quien reporta tras el fix.
