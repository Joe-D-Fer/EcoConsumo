-- =============================================================================
-- EcoConsumo: datos de EJEMPLO para desarrollo (los mismos de src/lib/datos/ejemplo.ts)
--
-- Los precios son ficticios y la asignación de comunas a distribuidoras debe verificarse.
-- La columna "fuente" queda vacía a propósito: la aplicación muestra el aviso de datos
-- provisorios mientras algún dato no tenga fuente. Se reemplazarán por la investigación de
-- tarifas (Bairon, bitácora fila 24) y el catálogo de artefactos (Andre, fila 25).
--
-- Se puede ejecutar varias veces: actualiza las filas existentes.
-- =============================================================================

insert into public.distribuidoras (id, nombre, precio_kwh, cargo_fijo) values
	('enel',       'Enel Distribución', 200, 1000),
	('cge',        'CGE',               210, 1100),
	('chilquinta', 'Chilquinta',        205, 1050),
	('saesa',      'Saesa',             220, 1200)
on conflict (id) do update set
	nombre = excluded.nombre, precio_kwh = excluded.precio_kwh, cargo_fijo = excluded.cargo_fijo,
	actualizado_en = now();

insert into public.comunas (id, nombre, region, distribuidora_id) values
	('santiago',     'Santiago',     'Metropolitana', 'enel'),
	('providencia',  'Providencia',  'Metropolitana', 'enel'),
	('maipu',        'Maipú',        'Metropolitana', 'enel'),
	('valparaiso',   'Valparaíso',   'Valparaíso',    'chilquinta'),
	('vina-del-mar', 'Viña del Mar', 'Valparaíso',    'chilquinta'),
	('rancagua',     'Rancagua',     'O''Higgins',    'cge'),
	('talca',        'Talca',        'Maule',         'cge'),
	('concepcion',   'Concepción',   'Biobío',        'cge'),
	('temuco',       'Temuco',       'La Araucanía',  'cge'),
	('osorno',       'Osorno',       'Los Lagos',     'saesa'),
	('puerto-montt', 'Puerto Montt', 'Los Lagos',     'saesa')
on conflict (id) do update set
	nombre = excluded.nombre, region = excluded.region, distribuidora_id = excluded.distribuidora_id;

insert into public.tarifas (comuna_id, distribuidora_id, precio_kwh, cargo_fijo, vigente_desde) values
	('providencia',  'enel',       198, 1000, '2026-11-01'),
	('vina-del-mar', 'chilquinta', 207, 1050, '2026-11-01'),
	('concepcion',   'cge',        215, 1100, '2026-11-01')
on conflict (comuna_id, vigente_desde) do update set
	distribuidora_id = excluded.distribuidora_id, precio_kwh = excluded.precio_kwh,
	cargo_fijo = excluded.cargo_fijo;

insert into public.catalogo_artefactos
	(id, nombre, categoria, potencia_w, standby_w, horas_dia_sugeridas, dias_mes_sugeridos) values
	('refrigerador',  'Refrigerador',        'Cocina',           150,  0,    24,   30),
	('microondas',    'Microondas',          'Cocina',           1200, 2,    0.25, 20),
	('hervidor',      'Hervidor eléctrico',  'Cocina',           2000, 0,    0.2,  30),
	('lavadora',      'Lavadora',            'Lavado',           500,  1,    1,    12),
	('plancha',       'Plancha',             'Lavado',           1200, 0,    0.5,  8),
	('televisor',     'Televisor LED',       'Entretención',     100,  1,    4,    30),
	('notebook',      'Computador portátil', 'Entretención',     60,   1,    5,    22),
	('router',        'Router wifi',         'Entretención',     10,   0,    24,   30),
	('cargador',      'Cargador de celular', 'Entretención',     5,    0.3,  2,    30),
	('ampolleta-led', 'Ampolleta LED',       'Iluminación',      9,    0,    5,    30),
	('estufa',        'Estufa eléctrica',    'Climatización',    2000, 0,    3,    30),
	('secador',       'Secador de pelo',     'Cuidado personal', 1800, 0,    0.15, 30)
on conflict (id) do update set
	nombre = excluded.nombre, categoria = excluded.categoria, potencia_w = excluded.potencia_w,
	standby_w = excluded.standby_w, horas_dia_sugeridas = excluded.horas_dia_sugeridas,
	dias_mes_sugeridos = excluded.dias_mes_sugeridos;
