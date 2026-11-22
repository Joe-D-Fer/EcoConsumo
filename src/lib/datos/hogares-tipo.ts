/**
 * Hogares tipo: conjuntos de artefactos ya configurados que se cargan con un clic.
 *
 * Sirven para la demostración en vivo y para quienes prefieren partir de un hogar parecido al suyo
 * y ajustarlo, en lugar de ingresar cada artefacto uno por uno.
 *
 * VALORES PROVISORIOS: las potencias y horas de uso son estimaciones razonables y deben revisarse con
 * el catálogo investigado (bitácora, fila 25). En el refrigerador, las horas representan el tiempo en
 * que funciona el compresor (alrededor de un tercio del día), no las 24 horas que permanece enchufado.
 */
import type { Artefacto } from '#lib/matematica/index.js';

/** Artefacto de un hogar tipo; `catalogoId` lo vincula con el catálogo cuando existe allí. */
export interface ArtefactoHogarTipo extends Artefacto {
	catalogoId?: string;
}

export interface HogarTipo {
	id: string;
	nombre: string;
	descripcion: string;
	/** Cantidad de personas que viven en el hogar. */
	personas: number;
	/** Comuna que se selecciona si la persona aún no ha indicado la suya. */
	comunaId: string;
	artefactos: ArtefactoHogarTipo[];
}

export const hogaresTipo: HogarTipo[] = [
	{
		id: 'una-persona',
		nombre: 'Departamento de una persona',
		descripcion: 'Persona que trabaja fuera de casa; uso moderado de cocina y entretención.',
		personas: 1,
		comunaId: 'santiago',
		artefactos: [
			{ catalogoId: 'refrigerador', nombre: 'Refrigerador', potenciaW: 150, cantidad: 1, horasDia: 8, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'microondas', nombre: 'Microondas', potenciaW: 1200, cantidad: 1, horasDia: 0.15, diasMes: 20, standbyW: 2 },
			{ catalogoId: 'hervidor', nombre: 'Hervidor eléctrico', potenciaW: 2000, cantidad: 1, horasDia: 0.1, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'lavadora', nombre: 'Lavadora', potenciaW: 500, cantidad: 1, horasDia: 1, diasMes: 6, standbyW: 1 },
			{ catalogoId: 'televisor', nombre: 'Televisor LED', potenciaW: 100, cantidad: 1, horasDia: 3, diasMes: 30, standbyW: 1 },
			{ catalogoId: 'notebook', nombre: 'Computador portátil', potenciaW: 60, cantidad: 1, horasDia: 3, diasMes: 30, standbyW: 1 },
			{ catalogoId: 'router', nombre: 'Router wifi', potenciaW: 10, cantidad: 1, horasDia: 24, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'cargador', nombre: 'Cargador de celular', potenciaW: 5, cantidad: 1, horasDia: 2, diasMes: 30, standbyW: 0.3 },
			{ catalogoId: 'ampolleta-led', nombre: 'Ampolleta LED', potenciaW: 9, cantidad: 4, horasDia: 4, diasMes: 30, standbyW: 0 }
		]
	},
	{
		id: 'familia',
		nombre: 'Familia de cuatro personas',
		descripcion: 'Casa con dos adultos y dos hijos; lavado frecuente y varios televisores.',
		personas: 4,
		comunaId: 'maipu',
		artefactos: [
			{ catalogoId: 'refrigerador', nombre: 'Refrigerador', potenciaW: 200, cantidad: 1, horasDia: 9, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'microondas', nombre: 'Microondas', potenciaW: 1200, cantidad: 1, horasDia: 0.3, diasMes: 30, standbyW: 2 },
			{ catalogoId: 'hervidor', nombre: 'Hervidor eléctrico', potenciaW: 2000, cantidad: 1, horasDia: 0.3, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'lavadora', nombre: 'Lavadora', potenciaW: 500, cantidad: 1, horasDia: 1.5, diasMes: 16, standbyW: 1 },
			{ catalogoId: 'plancha', nombre: 'Plancha', potenciaW: 1200, cantidad: 1, horasDia: 0.5, diasMes: 8, standbyW: 0 },
			{ catalogoId: 'televisor', nombre: 'Televisor LED', potenciaW: 100, cantidad: 2, horasDia: 5, diasMes: 30, standbyW: 1 },
			{ nombre: 'Decodificador de TV', potenciaW: 15, cantidad: 2, horasDia: 5, diasMes: 30, standbyW: 8 },
			{ catalogoId: 'notebook', nombre: 'Computador portátil', potenciaW: 60, cantidad: 2, horasDia: 4, diasMes: 25, standbyW: 1 },
			{ catalogoId: 'router', nombre: 'Router wifi', potenciaW: 10, cantidad: 1, horasDia: 24, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'cargador', nombre: 'Cargador de celular', potenciaW: 5, cantidad: 4, horasDia: 2, diasMes: 30, standbyW: 0.3 },
			{ catalogoId: 'ampolleta-led', nombre: 'Ampolleta LED', potenciaW: 9, cantidad: 10, horasDia: 5, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'secador', nombre: 'Secador de pelo', potenciaW: 1800, cantidad: 1, horasDia: 0.2, diasMes: 30, standbyW: 0 }
		]
	},
	{
		id: 'calefaccion-electrica',
		nombre: 'Casa con calefacción eléctrica',
		descripcion: 'Familia de tres en el sur, en invierno: estufa eléctrica y secadora de ropa.',
		personas: 3,
		comunaId: 'puerto-montt',
		artefactos: [
			{ catalogoId: 'refrigerador', nombre: 'Refrigerador', potenciaW: 180, cantidad: 1, horasDia: 8, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'estufa', nombre: 'Estufa eléctrica', potenciaW: 2000, cantidad: 1, horasDia: 4, diasMes: 30, standbyW: 0 },
			{ nombre: 'Secadora de ropa', potenciaW: 2500, cantidad: 1, horasDia: 1, diasMes: 10, standbyW: 1 },
			{ catalogoId: 'lavadora', nombre: 'Lavadora', potenciaW: 500, cantidad: 1, horasDia: 1, diasMes: 12, standbyW: 1 },
			{ catalogoId: 'hervidor', nombre: 'Hervidor eléctrico', potenciaW: 2000, cantidad: 1, horasDia: 0.3, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'microondas', nombre: 'Microondas', potenciaW: 1200, cantidad: 1, horasDia: 0.2, diasMes: 25, standbyW: 2 },
			{ catalogoId: 'televisor', nombre: 'Televisor LED', potenciaW: 100, cantidad: 1, horasDia: 5, diasMes: 30, standbyW: 1 },
			{ catalogoId: 'router', nombre: 'Router wifi', potenciaW: 10, cantidad: 1, horasDia: 24, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'ampolleta-led', nombre: 'Ampolleta LED', potenciaW: 9, cantidad: 8, horasDia: 6, diasMes: 30, standbyW: 0 }
		]
	},
	{
		id: 'teletrabajo',
		nombre: 'Teletrabajo y entretención',
		descripcion: 'Pareja que trabaja desde casa, con computador de escritorio, consola y equipos en standby.',
		personas: 2,
		comunaId: 'concepcion',
		artefactos: [
			{ catalogoId: 'refrigerador', nombre: 'Refrigerador', potenciaW: 150, cantidad: 1, horasDia: 8, diasMes: 30, standbyW: 0 },
			{ nombre: 'Computador de escritorio', potenciaW: 250, cantidad: 1, horasDia: 8, diasMes: 22, standbyW: 3 },
			{ nombre: 'Monitor', potenciaW: 30, cantidad: 2, horasDia: 8, diasMes: 22, standbyW: 0.5 },
			{ catalogoId: 'notebook', nombre: 'Computador portátil', potenciaW: 60, cantidad: 1, horasDia: 8, diasMes: 22, standbyW: 1 },
			{ nombre: 'Consola de videojuegos', potenciaW: 150, cantidad: 1, horasDia: 2, diasMes: 30, standbyW: 10 },
			{ catalogoId: 'televisor', nombre: 'Televisor LED', potenciaW: 120, cantidad: 1, horasDia: 4, diasMes: 30, standbyW: 1 },
			{ nombre: 'Equipo de sonido', potenciaW: 40, cantidad: 1, horasDia: 2, diasMes: 30, standbyW: 5 },
			{ catalogoId: 'router', nombre: 'Router wifi', potenciaW: 10, cantidad: 1, horasDia: 24, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'microondas', nombre: 'Microondas', potenciaW: 1200, cantidad: 1, horasDia: 0.2, diasMes: 30, standbyW: 2 },
			{ catalogoId: 'hervidor', nombre: 'Hervidor eléctrico', potenciaW: 2000, cantidad: 1, horasDia: 0.2, diasMes: 30, standbyW: 0 },
			{ catalogoId: 'lavadora', nombre: 'Lavadora', potenciaW: 500, cantidad: 1, horasDia: 1, diasMes: 8, standbyW: 1 },
			{ catalogoId: 'ampolleta-led', nombre: 'Ampolleta LED', potenciaW: 9, cantidad: 6, horasDia: 6, diasMes: 30, standbyW: 0 }
		]
	}
];
