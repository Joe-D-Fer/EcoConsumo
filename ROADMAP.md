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

- [ ] Quitar la página de práctica (GeoGebra y tabla de ejemplo)
- [ ] Proyecto Supabase y variables de entorno (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Esquema de base de datos:
  - `distribuidoras` (nombre)
  - `comunas` (nombre, región, distribuidora)
  - `tarifas` (distribuidora o comuna, precio por kWh, cargo fijo, vigencia)
  - `catalogo_artefactos` (nombre, categoría, potencia típica en W, standby en W)
  - `hogares` (identificador anónimo, comuna) y `artefactos_hogar` (hogar, artefacto, potencia, cantidad,
    horas por día, días por mes, standby)
- [ ] Sin inicio de sesión: identificador anónimo de hogar guardado en el navegador; políticas RLS acordes
- [ ] Carga inicial de tarifas y catálogo con los datos que entreguen Bairon y Andre
- [ ] Primer despliegue en Vercel desde GitHub

## Fase 2 — Módulo matemático (v0.2.0) · 17 al 18 de noviembre

Funciones puras en `src/lib/matematica/`, sin dependencias de la interfaz.

- [ ] **Función** de consumo de un artefacto: `E = (P · h · d · n) / 1000 + standby` (kWh por mes)
- [ ] **Función** lineal de costo: `C(E) = precio · E + cargo fijo`
- [ ] **Vectores** de potencia, horas y consumo por artefacto
- [ ] **Sumatoria** del consumo total del hogar: `Σ Eᵢ`
- [ ] Porcentaje de aporte de cada artefacto al total
- [ ] **Matriz** artefactos × períodos y totales por fila y columna
- [ ] **Sucesión** del consumo por período (evolución mensual)
- [ ] Pruebas unitarias del módulo (Vitest)

## Fase 3 — Registro de artefactos y tarifa (v0.3.0) · 19 al 20 de noviembre

- [ ] Estructura de páginas y navegación
- [ ] Formulario para agregar, editar y eliminar artefactos, con sugerencias desde el catálogo
- [ ] Ingreso de dirección o comuna que selecciona automáticamente la compañía y el precio
  (requisito de la docente), con opción de corregir el precio a mano
- [ ] Validación de datos ingresados
- [ ] Guardado en Supabase

## Fase 4 — Visualización (v0.4.0) · 21 de noviembre

- [ ] Indicadores: consumo total, costo estimado, artefacto de mayor consumo
- [ ] Tabla de consumo y costo por artefacto
- [ ] Gráfico de barras: comparación entre artefactos
- [ ] Gráfico de líneas: evolución en el tiempo
- [ ] Vista de la matriz artefactos × períodos

## Fase 5 — Simulación (v0.5.0) · 22 de noviembre

- [ ] Modificar horas, días o potencia sin alterar los datos guardados
- [ ] Comparación entre escenario actual y simulado: kWh, costo y ahorro
- [ ] Comparación de la estimación con el consumo real de la boleta (margen de error)

## Fase 6 — Pulido y entrega (v1.0.0) · 23 de noviembre al 2 de diciembre

- [ ] Diseño adaptable a celular y accesibilidad básica
- [ ] Correcciones de la revisión de interfaz (Andre)
- [ ] Datos de ejemplo para la demostración
- [ ] Correcciones de las pruebas beta (Bairon y Andre)
- [ ] Revisión de comentarios del código y README
- [ ] Verificación final del despliegue antes de la presentación

## Fuera de alcance

- Inicio de sesión y cuentas de usuario
- Lectura automática de boletas o medidores
- Aplicación móvil nativa

## Decisiones pendientes

- Biblioteca de gráficos (candidata: los gráficos de shadcn-svelte, basados en LayerChart)
- Nivel de detalle de la tarifa: por comuna o por distribuidora
- Cómo resolver la dirección: lista de comunas o búsqueda de dirección con un servicio externo
