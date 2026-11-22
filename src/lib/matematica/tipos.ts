/**
 * Tipos de datos del modelo matemático de EcoConsumo.
 *
 * Los artefactos se representan como objetos simples; todos los cálculos se hacen con
 * funciones puras en los demás archivos de este módulo (decisión de la pregunta de
 * investigación 4: tipos para los datos y funciones puras para la matemática).
 */

/** Artefacto registrado en un hogar. */
export interface Artefacto {
	/** Nombre visible, por ejemplo "Refrigerador". */
	nombre: string;
	/** Potencia en uso, en watts (W). */
	potenciaW: number;
	/** Cantidad de unidades iguales en el hogar. */
	cantidad: number;
	/** Horas de uso por día (0 a 24). */
	horasDia: number;
	/** Días de uso en un mes de referencia de 30 días (0 a 30). */
	diasMes: number;
	/** Potencia en espera (standby), en watts (W). Se consume en las horas sin uso. */
	standbyW: number;
}

/** Tarifa eléctrica de una compañía distribuidora o comuna. */
export interface Tarifa {
	/** Precio de la energía, en pesos chilenos por kWh. */
	precioKwh: number;
	/** Cargo fijo mensual de la boleta, en pesos chilenos. */
	cargoFijo: number;
}

/** Período de facturación, por ejemplo un mes. */
export interface Periodo {
	/** Etiqueta visible, por ejemplo "Ene 2026". */
	etiqueta: string;
	/** Cantidad de días del período. */
	dias: number;
}

/** Vector numérico: una lista ordenada de componentes. */
export type Vector = number[];

/** Matriz numérica: lista de filas, todas del mismo largo. */
export type Matriz = number[][];
