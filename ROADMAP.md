# Roadmap de desarrollo — EcoConsumo

Plan de desarrollo del software. Solo cubre código; las tareas académicas están en
`entregables/etapa 3/Bitacora.md`. Los cambios ya realizados se registran en `CHANGELOG.md`.

**Meta:** aplicación pública y funcional en Vercel con base de datos en Supabase, sin inicio de sesión,
lista para la demostración en vivo del **03-12-2026**. La aplicación debe estar estable el **26-11-2026**
para capturarla en la presentación.

Estado: `[ ]` pendiente · `[~]` en curso · `[x]` terminado

## Fase 0 — Base del proyecto (v0.0.1) ✔

- [x] Proyecto SvelteKit + TypeScript + Tailwind CSS
- [x] shadcn-svelte (botón, menú de navegación, tabla)
- [x] README con instalación y comandos

## Fase 1 — Datos y despliegue (v0.1.0) · 15 al 18 de noviembre

- [x] Quitar la página de práctica (GeoGebra y tabla de ejemplo)
- [x] Proyecto Supabase y variables de entorno (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`); pasos en
  `supabase/README.md`
- [x] Esquema de base de datos (`supabase/migrations/`, modelo en `supabase/README.md`):
  - `distribuidoras` (nombre, tarifa base: precio por kWh y cargo fijo, fuente)
  - `comunas` (nombre, región) y `comuna_distribuidoras` (compañías que atienden cada comuna; una principal)
  - `tarifas` (distribuidora y comuna, precio por kWh, cargo fijo, vigencia, fuente): precio de la
    distribuidora en una comuna; si no existe, se usa la tarifa base de la distribuidora
  - vista `comunas_con_tarifa` con la tarifa vigente de cada comuna y distribuidora
  - `catalogo_artefactos` (nombre, categoría, potencia típica en W, standby en W, uso sugerido, fuente)
  - `hogares` (token anónimo, comuna, compañía elegida, tarifa manual, boleta) y `artefactos_hogar` (hogar, artefacto,
    potencia, cantidad, horas por día, días por mes, standby)
- [x] Sin inicio de sesión: token anónimo de hogar guardado en el navegador; tablas de hogares sin acceso
  directo (RLS) y funciones `obtener_hogar` / `guardar_hogar` que exigen el token
- [x] Datos de ejemplo en `supabase/seed.sql`
- [x] Comunas con más de una compañía distribuidora (tabla `comuna_distribuidoras`; la persona usuaria
  elige la de su boleta) (23-11)
- [x] La aplicación lee los datos de referencia desde Supabase y guarda el hogar ahí (con respaldo en el
  navegador y en los datos de ejemplo si no hay conexión)
- [ ] Carga inicial de tarifas y catálogo con los datos que entreguen Bairon y Andre
- [~] Primer despliegue en Vercel desde GitHub (22-11); falta que la versión publicada use Supabase

## Fase 2 — Módulo matemático (v0.2.0) · 22 de noviembre ✔

Funciones puras en `src/lib/matematica/`, sin dependencias de la interfaz.

- [x] **Función** de consumo de un artefacto: `E = n · d · [P · h + S · (24 − h)] / 1000` (kWh por mes;
  `S` = potencia en standby, consumida en las horas sin uso)
- [x] **Función** lineal de costo: `C(E) = precio · E + cargo fijo`
- [x] **Vectores** de potencia, horas y consumo por artefacto
- [x] **Sumatoria** del consumo total del hogar: `Σ Eᵢ`
- [x] Porcentaje de aporte de cada artefacto al total
- [x] **Matriz** artefactos × períodos (`M = E · fᵀ`, con `fⱼ = Dⱼ / 30`) y totales por fila y columna
- [x] **Sucesión** del consumo por período, sumas parciales y ahorro acumulado (sucesión aritmética)
- [x] Comparación de escenarios y error relativo respecto de la boleta (base de la Fase 5)
- [x] Validación de los datos de un artefacto (base del formulario de la Fase 3)
- [x] Pruebas unitarias del módulo (Vitest): `pnpm test`

## Fase 3 — Registro de artefactos y tarifa (v0.3.0) · 22 de noviembre

- [x] Estructura de páginas y navegación (`/` inicio, `/hogar` registro)
- [x] Formulario para agregar, editar y eliminar artefactos, con sugerencias desde el catálogo y vista
  previa en vivo de la función de consumo
- [x] Ingreso de comuna que selecciona automáticamente la compañía y el precio
  (requisito de la docente), con opción de corregir el precio a mano
- [x] Validación de datos ingresados
- [x] Guardado en el navegador (localStorage) y en Supabase cuando está configurado
- [ ] Reemplazar los datos de ejemplo (`src/lib/datos/ejemplo.ts`) por los de Bairon y Andre
- [x] Hogares tipo con artefactos preconfigurados, cargables con un clic (`src/lib/datos/hogares-tipo.ts`)
- [ ] Revisar los valores de los hogares tipo con el catálogo investigado (Andre)

## Fase 4 — Visualización (v0.4.0) · 22 de noviembre ✔

- [x] Indicadores: consumo total, costo estimado, artefacto de mayor consumo (página `/resultados`)
- [x] Tabla de consumo y costo por artefacto (en `/hogar`)
- [x] Gráfico de barras: comparación entre artefactos (vector E, de mayor a menor)
- [x] Gráfico de líneas: evolución en el año, por mes (sucesión aⱼ) o acumulada (sumas parciales Sₙ)
- [x] Vista de la matriz artefactos × meses como mapa de calor, con totales por fila y columna
- [x] Integración con GeoGebra (página `/geogebra`, 22-11): función de costo y de consumo con deslizadores,
  sucesión aⱼ y sumas parciales Sₙ, vectores, sumatoria y matriz M = E · fᵀ construidos con los datos del
  hogar mediante la API de GeoGebra; GeoGebra recalcula el resultado y la página lo compara con el de la
  aplicación. Comandos copiables para repetir la construcción en GeoGebra Clásico

## Fase 5 — Simulación (v0.5.0) · 22 de noviembre ✔

- [x] Modificar horas, días, potencia, cantidad o standby sin alterar los datos guardados (página `/simulacion`)
- [x] Comparación entre escenario actual y simulado: kWh, costo y ahorro, con el ahorro acumulado en 12
  meses (sucesión aritmética Aₙ = n · r)
- [x] Comparación de la estimación con el consumo real de la boleta (error relativo, ajustado a los días del
  período facturado)

## Fase 6 — Pulido y entrega (v1.0.0) · 23 de noviembre al 2 de diciembre

- [ ] Diseño adaptable a celular y accesibilidad básica
- [ ] Correcciones de la revisión de interfaz (Andre)
- [~] Datos de ejemplo para la demostración (hogares tipo listos; falta elegir cuál usar en el guion)
- [ ] Correcciones de las pruebas beta (Bairon y Andre)
- [ ] Revisión de comentarios del código y README
- [ ] Verificación final del despliegue antes de la presentación

## Fuera de alcance

- Inicio de sesión y cuentas de usuario
- Lectura automática de boletas o medidores
- Aplicación móvil nativa

## Decisiones tomadas (22-11-2026)

- Gráficos: los de shadcn-svelte, basados en LayerChart.
- Tarifa: cada distribuidora puede tener un precio distinto en cada comuna; si no hay precio para la
  comuna, se usa la tarifa base de la distribuidora.
- Dirección: lista de comunas con búsqueda (por nombre o región, sin distinguir tildes); sin servicio externo.
- GeoGebra: API oficial (`deployggb.js`) con GeoGebra Clásico en lugar de un iframe, porque un iframe no
  permite enviar los datos del hogar ni leer los resultados. La calculadora gráfica no acepta Segment ni
  Polyline, por eso se usa la versión clásica. Requiere conexión a geogebra.org.
