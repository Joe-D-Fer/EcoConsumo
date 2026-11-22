/**
 * Períodos mensuales de un año, con su cantidad real de días (considera años bisiestos).
 * Son las columnas de la matriz artefactos × períodos.
 */
import type { Periodo } from './tipos';

export const NOMBRES_MESES = [
	'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
] as const;

/** Días del mes (mes de 0 a 11). */
export function diasDelMes(anio: number, mes: number): number {
	return new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
}

/** Los 12 meses del año como períodos, por ejemplo { etiqueta: 'Feb', dias: 28 }. */
export function mesesDelAnio(anio: number): Periodo[] {
	return NOMBRES_MESES.map((etiqueta, mes) => ({ etiqueta, dias: diasDelMes(anio, mes) }));
}
