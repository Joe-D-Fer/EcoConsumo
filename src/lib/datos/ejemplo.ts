/**
 * DATOS DE EJEMPLO, solo para desarrollo.
 *
 * Los precios son valores ficticios y la asignación de comunas a distribuidoras debe verificarse.
 * Se reemplazarán por la investigación de tarifas (Bairon, bitácora fila 24) y por el catálogo de
 * artefactos (Andre, fila 25) cuando se carguen en Supabase.
 */
import type { ArtefactoCatalogo, Comuna, Distribuidora } from './tipos';

/** Indica en la interfaz que los datos aún no son reales. */
export const SON_DATOS_DE_EJEMPLO = true;

export const distribuidoras: Distribuidora[] = [
	{ id: 'enel', nombre: 'Enel Distribución', tarifaBase: { precioKwh: 200, cargoFijo: 1000 } },
	{ id: 'cge', nombre: 'CGE', tarifaBase: { precioKwh: 210, cargoFijo: 1100 } },
	{ id: 'chilquinta', nombre: 'Chilquinta', tarifaBase: { precioKwh: 205, cargoFijo: 1050 } },
	{ id: 'saesa', nombre: 'Saesa', tarifaBase: { precioKwh: 220, cargoFijo: 1200 } }
];

export const comunas: Comuna[] = [
	{ id: 'santiago', nombre: 'Santiago', region: 'Metropolitana', distribuidoraId: 'enel' },
	{
		id: 'providencia',
		nombre: 'Providencia',
		region: 'Metropolitana',
		distribuidoraId: 'enel',
		tarifa: { precioKwh: 198, cargoFijo: 1000 }
	},
	{ id: 'maipu', nombre: 'Maipú', region: 'Metropolitana', distribuidoraId: 'enel' },
	{ id: 'valparaiso', nombre: 'Valparaíso', region: 'Valparaíso', distribuidoraId: 'chilquinta' },
	{
		id: 'vina-del-mar',
		nombre: 'Viña del Mar',
		region: 'Valparaíso',
		distribuidoraId: 'chilquinta',
		tarifa: { precioKwh: 207, cargoFijo: 1050 }
	},
	{ id: 'rancagua', nombre: 'Rancagua', region: "O'Higgins", distribuidoraId: 'cge' },
	{ id: 'talca', nombre: 'Talca', region: 'Maule', distribuidoraId: 'cge' },
	{
		id: 'concepcion',
		nombre: 'Concepción',
		region: 'Biobío',
		distribuidoraId: 'cge',
		tarifa: { precioKwh: 215, cargoFijo: 1100 }
	},
	{ id: 'temuco', nombre: 'Temuco', region: 'La Araucanía', distribuidoraId: 'cge' },
	{ id: 'osorno', nombre: 'Osorno', region: 'Los Lagos', distribuidoraId: 'saesa' },
	{ id: 'puerto-montt', nombre: 'Puerto Montt', region: 'Los Lagos', distribuidoraId: 'saesa' }
];

export const catalogo: ArtefactoCatalogo[] = [
	{ id: 'refrigerador', nombre: 'Refrigerador', categoria: 'Cocina', potenciaW: 150, standbyW: 0, horasDiaSugeridas: 24, diasMesSugeridos: 30 },
	{ id: 'microondas', nombre: 'Microondas', categoria: 'Cocina', potenciaW: 1200, standbyW: 2, horasDiaSugeridas: 0.25, diasMesSugeridos: 20 },
	{ id: 'hervidor', nombre: 'Hervidor eléctrico', categoria: 'Cocina', potenciaW: 2000, standbyW: 0, horasDiaSugeridas: 0.2, diasMesSugeridos: 30 },
	{ id: 'lavadora', nombre: 'Lavadora', categoria: 'Lavado', potenciaW: 500, standbyW: 1, horasDiaSugeridas: 1, diasMesSugeridos: 12 },
	{ id: 'plancha', nombre: 'Plancha', categoria: 'Lavado', potenciaW: 1200, standbyW: 0, horasDiaSugeridas: 0.5, diasMesSugeridos: 8 },
	{ id: 'televisor', nombre: 'Televisor LED', categoria: 'Entretención', potenciaW: 100, standbyW: 1, horasDiaSugeridas: 4, diasMesSugeridos: 30 },
	{ id: 'notebook', nombre: 'Computador portátil', categoria: 'Entretención', potenciaW: 60, standbyW: 1, horasDiaSugeridas: 5, diasMesSugeridos: 22 },
	{ id: 'router', nombre: 'Router wifi', categoria: 'Entretención', potenciaW: 10, standbyW: 0, horasDiaSugeridas: 24, diasMesSugeridos: 30 },
	{ id: 'cargador', nombre: 'Cargador de celular', categoria: 'Entretención', potenciaW: 5, standbyW: 0.3, horasDiaSugeridas: 2, diasMesSugeridos: 30 },
	{ id: 'ampolleta-led', nombre: 'Ampolleta LED', categoria: 'Iluminación', potenciaW: 9, standbyW: 0, horasDiaSugeridas: 5, diasMesSugeridos: 30 },
	{ id: 'estufa', nombre: 'Estufa eléctrica', categoria: 'Climatización', potenciaW: 2000, standbyW: 0, horasDiaSugeridas: 3, diasMesSugeridos: 30 },
	{ id: 'secador', nombre: 'Secador de pelo', categoria: 'Cuidado personal', potenciaW: 1800, standbyW: 0, horasDiaSugeridas: 0.15, diasMesSugeridos: 30 }
];
