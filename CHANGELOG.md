# Changelog — EcoConsumo

Registro de los cambios del código. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y versionado según el plan de `ROADMAP.md`.

Categorías: **Agregado**, **Cambiado**, **Corregido**, **Eliminado**.

## [Sin publicar]

### Agregado

- `CLAUDE.md` con el contexto del proyecto.
- `ROADMAP.md` y `CHANGELOG.md` para documentar el plan y los cambios de desarrollo.
- Módulo matemático `src/lib/matematica/` con funciones puras: funciones de consumo y costo,
  vectores y sumatorias, matriz artefactos × períodos, sucesiones, comparación de escenarios, error
  relativo respecto de la boleta y validación de artefactos (2026-11-22).
- Vitest y el comando `pnpm test`, con 15 pruebas unitarias del módulo matemático (2026-11-22).
- Página de inicio, navegación y página «Mi hogar» (`/hogar`) (2026-11-22).
- Ingreso de comuna con búsqueda que selecciona automáticamente la compañía distribuidora y el precio del
  kWh (precio por comuna o tarifa base de la distribuidora), con opción de corregirlo a mano (2026-11-22).
- Formulario para agregar, editar y eliminar artefactos, con sugerencias desde un catálogo, validación y
  vista previa en vivo de la función de consumo (2026-11-22).
- Tabla de artefactos con consumo, porcentaje del total, costo, sumatoria del hogar y costo de la boleta
  C(E) = p · E + F (2026-11-22).
- Datos de ejemplo de distribuidoras, comunas y catálogo de artefactos, marcados como provisorios en la
  interfaz (2026-11-22).
- Guardado provisorio de los datos del hogar en el navegador (localStorage) (2026-11-22).
- Componentes de shadcn-svelte: alerta, insignia, tarjeta, comando, diálogo, campo de texto, etiqueta y
  ventana emergente (2026-11-22).

- Página «Resultados» (`/resultados`) con indicadores de consumo total, costo estimado y artefacto de mayor
  consumo (2026-11-22).
- Gráfico de barras del consumo mensual por artefacto, con el valor en cada barra y detalle al pasar el
  cursor (2026-11-22).
- Gráfico de líneas de la evolución del consumo en el año, por mes (sucesión aⱼ) o acumulado (sumas
  parciales Sₙ) (2026-11-22).
- Matriz artefactos × meses como mapa de calor, con totales por fila y por columna (2026-11-22).
- Función `mesesDelAnio` en el módulo matemático: períodos mensuales con sus días reales, incluidos los
  años bisiestos (2026-11-22).
- Gráficos de shadcn-svelte (LayerChart) y componentes de grupo de botones y ayuda emergente (2026-11-22).
- Página «Simulación» (`/simulacion`): cambio de horas, días, potencia, cantidad y standby de cada artefacto
  sin modificar los datos registrados, con botones para desenchufar todo y restablecer (2026-11-22).
- Comparación del escenario actual con el simulado (kWh, costo y ahorro) y gráfico del ahorro acumulado en
  12 meses como sucesión aritmética; en celular, barra inferior con el ahorro mensual (2026-11-22).
- Comparación con la boleta real: la estimación se ajusta a los días del período (E · D / 30) y se muestra
  el error relativo con su interpretación. Los datos de la boleta se guardan en el navegador (2026-11-22).
- Funciones `aplicarCambios`, `consumoEnPeriodo` y `calidadEstimacion` en el módulo matemático, con
  pruebas (2026-11-22).

- Esquema de la base de datos en Supabase (`supabase/migrations/`): distribuidoras, comunas, tarifas por
  comuna con vigencia, catálogo de artefactos, hogares anónimos y sus artefactos, con Row Level Security y
  funciones `obtener_hogar`, `guardar_hogar` y `eliminar_hogar` protegidas por un token (2026-11-22).
- Datos de ejemplo para la base de datos (`supabase/seed.sql`) y documentación del modelo de datos y de la
  puesta en marcha (`supabase/README.md`) (2026-11-22).
- Cliente de Supabase (`@supabase/supabase-js`), variables de entorno `PUBLIC_SUPABASE_URL` y
  `PUBLIC_SUPABASE_ANON_KEY` (`src/env.ts`, `.env.example`) y módulo `src/lib/datos/supabase.ts` (2026-11-22).
- Campo `fuente` en distribuidoras, tarifas y catálogo (2026-11-22).

- Página «GeoGebra» (`/geogebra`) que construye en GeoGebra Clásico, con los datos del hogar, la función
  lineal de costo C(E) = p · E + F, la función de consumo E(h) de un artefacto, la sucesión aⱼ con sus sumas
  parciales Sₙ, y los vectores, la sumatoria Σ Eᵢ y la matriz M = E · fᵀ. Los deslizadores E y h se pueden
  mover, y la página compara el resultado calculado por GeoGebra con el de EcoConsumo (2026-11-22).
- Componente `GeoGebra.svelte`, que carga la API oficial de GeoGebra (`deployggb.js`), ejecuta los comandos
  de una escena y lee los valores de vuelta (2026-11-22).
- Módulo `src/lib/geogebra/escenas.ts` con funciones puras que traducen los datos a comandos de GeoGebra,
  con 5 pruebas unitarias; los comandos se pueden copiar para pegarlos en GeoGebra (2026-11-22).
- Enlace «GeoGebra» en el menú principal (2026-11-22).

### Cambiado

- Los datos de referencia se leen desde Supabase cuando está configurado; si no, se usan los de ejemplo
  (`src/lib/estado/referencia.svelte.ts`) (2026-11-22).
- El hogar se guarda también en Supabase, con un token anónimo generado en el navegador; si no hay conexión,
  los cambios quedan pendientes y se envían al volver a abrir la aplicación (2026-11-22).
- El aviso «Datos de ejemplo» se muestra mientras algún dato de referencia no tenga fuente (2026-11-22).
- Los enlaces del menú principal no se dividen en dos líneas en pantallas angostas (2026-11-22).
- Identidad visual alineada con la portada de la presentación: logotipo (casa, enchufe y hoja) en el
  componente `Logo.svelte` y en el favicon; colores de marca naranja `#F98C00`, verde `#8CE000` y fondo
  oscuro `#0A0D12` como variables `--marca-*`; encabezado, pie y portada de inicio con fondo oscuro y
  acento naranja; botones principales en naranja (2026-11-22).
- Logotipo de INACAP (`src/lib/assets/inacap.svg`, desde Wikimedia Commons, con letras blancas para fondo
  oscuro) junto a «Sede Curicó» en la portada de inicio y en el pie de página, como en la portada de la
  presentación (2026-11-22).
- Gráficos de consumo y mapa de calor de la matriz en la escala naranja de marca; el ahorro acumulado de la
  simulación se muestra en verde (2026-11-22).

### Corregido

- El enchufe del logotipo quedaba invertido; ahora tiene las patas hacia el techo y el cable hacia abajo,
  como en la portada de la presentación (2026-11-22).

### Eliminado

- Página de práctica con GeoGebra y la tabla de ejemplo (2026-11-22).

## [0.0.1] — 2026-10-21

### Agregado

- Proyecto inicial con SvelteKit, TypeScript y Tailwind CSS (2026-10-07).
- shadcn-svelte con los componentes de botón, menú de navegación y tabla (2026-10-07).
- README con requisitos, instalación y comandos de desarrollo y producción (2026-10-07).
- Página de práctica con un visor de GeoGebra y una tabla de ejemplo, creada durante la capacitación en
  GitHub y SvelteKit (2026-10-21). Se reemplazará en la versión 0.1.0.
