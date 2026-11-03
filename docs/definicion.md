# Definición integrada — Red Bibosi

Fuente de producto alineada al prompt inicial. El detalle técnico vinculante sigue en [`contracts.md`](contracts.md).

## 1. Contexto y visión

- **Nombre:** Red Bibosi  
- **Tipo:** Plataforma web comunitaria de denuncias ciudadanas y seguridad colaborativa (estilo Reddit).  
- **Categoría:** Seguridad ciudadana y transparencia comunitarias.  
- **Producto UI actual:** Cuadra (foro por zona en este repositorio).

## 2. Problema

Falta de canales directos, con identidad protegida y geolocalizados (por zona) para alertar sobre inseguridad en barrios. La información suele estar dispersa, no estructurada o llega tarde a los vecinos.

## 3. Solución

### A. Feed principal

Categorías de alerta inmediata:

1. Alertas de maleantes y ladrones  
2. Zonas de peligro  
3. Locales y clubes nocturnos  

### B. Discusiones por zona

Filtro geográfico por barrio/distrito/avenida; seguridad del área en near-real-time sin exponer ubicación exacta en público.

## 4. Reglas GitHub / secretos

- Secretos solo en `.env` / `.env.local`  
- `.gitignore` estricto + `.env.example` sin valores reales  
- Checklist pre-push en el README principal  

## 5. Fases

| Fase | Contenido | Estado |
|------|-----------|--------|
| A — Base | Stack, directorios, gitignore, env.example, CI | Hecha |
| B — Módulos | Feed, votos, zonas, mapa | En curso |
| C — Auditoría / deploy | Checklist secretos, README vivo, Vercel | Parcial |
