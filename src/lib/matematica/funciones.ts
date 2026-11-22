/**
 * Funciones de consumo y de costo.
 *
 * Consumo mensual de un artefacto i (kWh):
 *   E(i) = n · d · [ P · h + S · (24 − h) ] / 1000
 * donde P es la potencia en uso (W), S la potencia en standby (W), h las horas de uso por día,
 * d los días de uso por mes y n la cantidad de unidades.
 *
 * Costo de la energía (función lineal): C(E) = p · E + F
 * donde p es el precio del kWh y F el cargo fijo mensual.
 */
import type { Artefacto, Tarifa } from './tipos';

/** Horas que tiene un día; el standby se consume en las horas sin uso. */
export const HORAS_DIA = 24;

/** Días del mes de referencia usado en el registro de artefactos. */
export const DIAS_MES_REFERENCIA = 30;

/**
 * Consumo en un período de D días a partir del consumo de un mes de referencia de 30 días:
 * E · D / 30 (el mismo factor fⱼ = Dⱼ / 30 de la matriz artefactos × períodos).
 */
export function consumoEnPeriodo(kwhMensual: number, dias: number): number {
	return (kwhMensual * dias) / DIAS_MES_REFERENCIA;
}

/** Consumo diario de un artefacto en un día de uso, en kWh. */
export function consumoDiario(a: Artefacto): number {
	const horasStandby = HORAS_DIA - a.horasDia;
	return (a.cantidad * (a.potenciaW * a.horasDia + a.standbyW * horasStandby)) / 1000;
}

/** Función de consumo mensual E(i) de un artefacto, en kWh por mes. */
export function consumoMensual(a: Artefacto): number {
	return consumoDiario(a) * a.diasMes;
}

/**
 * Costo variable de una cantidad de energía: p · E, en pesos.
 * Se usa para el costo por artefacto, que no incluye el cargo fijo.
 */
export function costoEnergia(kwh: number, tarifa: Tarifa): number {
	return tarifa.precioKwh * kwh;
}

/** Función lineal de costo total de la boleta: C(E) = p · E + F, en pesos. */
export function costoTotal(kwh: number, tarifa: Tarifa): number {
	return costoEnergia(kwh, tarifa) + tarifa.cargoFijo;
}

/**
 * Valida los datos de un artefacto y devuelve la lista de errores (vacía si es válido).
 * Los mensajes están pensados para mostrarse en el formulario.
 */
export function validarArtefacto(a: Artefacto): string[] {
	const errores: string[] = [];
	if (a.nombre.trim() === '') errores.push('El nombre es obligatorio.');
	if (!(a.potenciaW > 0)) errores.push('La potencia debe ser mayor que 0 W.');
	if (!Number.isInteger(a.cantidad) || a.cantidad < 1)
		errores.push('La cantidad debe ser un número entero mayor o igual a 1.');
	if (!(a.horasDia >= 0 && a.horasDia <= HORAS_DIA))
		errores.push('Las horas de uso por día deben estar entre 0 y 24.');
	if (!(a.diasMes >= 0 && a.diasMes <= DIAS_MES_REFERENCIA))
		errores.push('Los días de uso por mes deben estar entre 0 y 30.');
	if (!(a.standbyW >= 0)) errores.push('La potencia en standby no puede ser negativa.');
	return errores;
}
