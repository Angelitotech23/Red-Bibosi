# Definición — Red Bibosi (Edición Santa Cruz)

Fuente de producto. El detalle técnico vinculante: [`contracts.md`](contracts.md). Arquitectura: [`arquitectura.md`](arquitectura.md).

## Contexto

- **Nombre:** Red Bibosi  
- **Concepto:** Foro web comunitario estilo Reddit de reportes vecinales en Santa Cruz de la Sierra, Bolivia.  
- **Acceso:** Libre y abierto para **leer**, consultar el **mapa de alertas** y ver denuncias **sin registro**.  
- **Producto UI en este repo:** Cuadra (foro por zona).

## Propósito

Canal seguro, centralizado y de libre acceso para denunciar inseguridad, fallas de infraestructura y problemas de zona.

## Privacidad y anonimato

- Denuncias **anónimas** de cara al público.  
- **Nunca** exponer WhatsApp, nombre real ni datos personales del publicador.  
- Coordenadas exactas solo en privado; público = zona / grilla.

## Estructura

### Feed principal

1. Maleantes y robos  
2. Zonas de peligro y alumbrado  
3. Locales y boliches nocturnos  

Votación para dar visibilidad a lo urgente.

### Por zona

Filtro por distritos/barrios cruceños (Equipetrol, Plan 3000, Radial 26, Villa 1º de Mayo, Urubó, 4to Anillo, etc.).

## Reglas GitHub

- Sin secretos en código; solo `.env` / `process.env`.  
- `.gitignore` + `.env.example`.  
- Ramas `feat/…` + Conventional Commits + PR a `main`.
