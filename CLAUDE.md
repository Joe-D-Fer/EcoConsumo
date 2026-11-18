# EcoConsumo — contexto del proyecto

Proyecto ABPro (Evaluación Sumativa 03, 40 %) de la asignatura **MVFM01 Funciones y Matrices**, INACAP.
Docente: **Nicole Catalina Godoy Rojas**. Unidad 3: sucesiones, sumatorias, vectores y matrices.

## Idioma

- Todo documento, código visible al usuario, comentario, commit y entregable se escribe en **español formal**.
- La conversación con Joe es en **inglés**.

## Equipo

| Integrante | Rol | Diapositivas que expone |
|---|---|---|
| Joe Darrien Fernández Álvarez (`Joe-D-Fer`) | Líder; desarrollo del software y matemática | 7, 8, 9, 10 |
| Andresaint Antoine ("Andre", `antoineandre1990-ctrl`) | Apoyo: fuentes, diapositivas, revisión | 5, 6, 11 |
| Bairon José Tapia Vergara | Apoyo: diapositivas, investigación, pruebas | 1, 2, 3, 4 |

Joe hace el código y las decisiones técnicas y académicas principales. A Andre y Bairon se les asignan tareas
reales pero livianas (investigación acotada, revisión de UI, pruebas beta, revisión de comentarios, ortografía).
Quien expone una diapositiva no necesariamente la elaboró.

## Fechas

| Hito | Fecha |
|---|---|
| Entrega Etapa 1 (Informe Técnico + Tabla 1) | 07-10-2026 (entregado) |
| Entrega Etapa 2 (Tabla 2) | 14-10-2026 (entregado; corregido tras retroalimentación el 25-10) |
| Entrega del .pptx a la docente | **26-11-2026** |
| Presentación **en vivo** (no video) | **03-12-2026** |

Clases: **jueves 21:10–22:30**; además **miércoles 19:50–22:30** solo hasta el 14-10-2026.
La rúbrica exige distinguir trabajo en clases y en horas autónomas.

Inicio del proyecto: 25-09-2026 (Bairon creó el grupo de WhatsApp, canal principal del equipo).
El 02-10-2026 Joe creó un sitio de SharePoint para colaborar en los entregables.
Ausencias de Joe a clases: 23-09, 01-10, 29 o 30-10 (fecha por confirmar) y 05-11. Las de Andre y Bairon no
se conocen; Joe las confirmará con ellos, junto con las tareas que falten en la bitácora.

## El proyecto

- **Problema:** las boletas de electricidad en Chile informan solo el consumo total mensual, sin desglose por
  artefacto; además el precio del kWh varía según región y compañía distribuidora.
- **Producto:** aplicación web pública que permite registrar artefactos (potencia, cantidad, horas y días de uso,
  standby), estimar consumo y costo por artefacto, visualizarlo con gráficos y simular cambios de hábitos.
- **Alcance comprometido:** aplicación completa y funcional desplegada en **Vercel**, con base de datos en
  **Supabase**, **sin inicio de sesión**, página pública.
- **Nociones matemáticas que deben quedar visibles en el producto:** funciones (consumo y costo), sucesiones
  (evolución por período), sumatorias (total del hogar), vectores (potencia, horas, consumo) y matrices
  (artefactos × períodos).

### Retroalimentación de la docente (obligatoria de incorporar)

1. Exactamente **4 preguntas de investigación**: 2 de matemática y 2 de programación (ya aplicado en Etapa 2).
2. Reformular el objetivo y otros puntos; un punto mal entendido se reescribió.
3. Nota textual: *"especificar en la problemática la variabilidad de precios según región del país, y
   solucionarla en la app con un input de dirección que selecciona automáticamente el precio y compañía"*.
   → La app necesita un selector de dirección/comuna que determine distribuidora y tarifa, y la diapositiva 2
   debe mencionar esta variabilidad.

### Preguntas de investigación vigentes (Etapa 2)

1. (Mat.) ¿Qué datos son relevantes de recopilar sobre cada artefacto para estimar su consumo de forma confiable
   y para poder modelar las funciones necesarias?
2. (Mat.) ¿Qué tipos de gráficos permiten comunicar mejor la proporción de consumo por artefacto y su evolución
   en el tiempo?
3. (Prog.) ¿Cómo se puede desplegar el código fuente TypeScript para visualización de la aplicación web usando
   Vercel?
4. (Prog.) ¿Qué paradigma de programación (orientado a objetos, funcional o una combinación) es más adecuado
   para el desarrollo del proyecto?

## Entregables (`entregables/`)

- `ABPro Etapa 1.pdf` — instrucciones generales y Etapa 1.
- `Informe_Tecnico.docx/.pdf` — entrega Etapa 1.
- `Tabla Etapa 2.docx` — entrega Etapa 2 (referencia de estilo: tabla con encabezado rojo INACAP).
- `etapa 3/ABPro Etapa 3.pdf` — instrucciones y **rúbrica** de la Etapa 3 (15 indicadores).
- `etapa 3/Presentación EcoConsumo.pptx` — presentación de 11 diapositivas; 1–4 y 7–10 aún sin contenido.
- `etapa 3/Bitacora.md` — **fuente de verdad** de la bitácora; `Bitacora.docx` se genera desde ella.

Estructura obligatoria de la presentación: 1 portada (7 elementos de identificación) · 2 contexto y
problemática · 3 objetivo y preguntas · 4 bitácora · 5–6 justificación con fuentes · 7 demostración del
producto · 8 esquema de nociones matemáticas · 9 conclusiones · 10 mapa de impacto TFL · 11 bibliografía.
Citas en formato APA 7, como en los informes ya entregados.

Datos aún desconocidos para la portada: **carrera** y **sección**.

## Bitácora

- Cada fila: fecha, horario, tipo (clase / autónoma), tarea, responsable(s), estado y evidencia.
- Las filas pasadas se reconstruyeron desde evidencia real (commits, metadatos de archivos, fechas de entrega);
  las marcadas "estimado" debe confirmarlas Joe.
- **Regla:** cada tarea se atribuye a quien realmente la hizo o la hará. El equilibrio entre integrantes se
  logra asignando tareas reales a Andre y Bairon, no reatribuyendo trabajo. La rúbrica exige que la bitácora
  coincida con los registros de la docente y que todos dominen sus tareas.
- Al completar o reprogramar una tarea, actualizar `Bitacora.md` y regenerar el `.docx` (requiere
  `python-docx`; la columna "Evidencia" es interna y no pasa al `.docx`):
  `python "entregables/etapa 3/generar_bitacora.py" "entregables/etapa 3/Bitacora.md" "entregables/etapa 3/Bitacora.docx"`

## Código

- **Stack:** SvelteKit 3 + Svelte 5 (runes) + TypeScript 6, Tailwind CSS 4, shadcn-svelte (bits-ui), Vite 8,
  pnpm. Node 24 LTS. Alias de importación `#lib/*` → `src/lib/*`.
- **Comandos:** `pnpm install` · `pnpm run dev` · `pnpm run build` · `pnpm run check` (svelte-check).
- **Estado actual (14-11-2026):** solo el andamiaje. `src/routes/+page.svelte` es una página de práctica
  (iframe de GeoGebra y tabla de ejemplo) que debe reemplazarse. No hay Supabase, lógica de cálculo, pruebas ni
  despliegue todavía. `@sveltejs/adapter-auto` sirve para Vercel.
- **Diseño acordado (pregunta 4):** objetos/tipos para representar artefactos y **funciones puras** para los
  cálculos con vectores, matrices y sumatorias. Mantener la matemática en un módulo propio, separado de la UI,
  con nombres que permitan mostrarla en la diapositiva 8.
- Componentes de UI: agregar con shadcn-svelte en `src/lib/components/ui/`.

## Documentación de desarrollo

- `ROADMAP.md` — plan de desarrollo por fases; marcar avances ahí.
- `CHANGELOG.md` — registrar todo cambio de código en la sección "Sin publicar" al terminarlo.

## Forma de trabajo

- Antes de empezar una tarea, preguntar a Joe lo que no esté claro; él puede consultar a la docente.
- Ante obstáculos técnicos, elegir el mejor enfoque sin detenerse.
- Hacer commit o push solo cuando Joe lo pida.
