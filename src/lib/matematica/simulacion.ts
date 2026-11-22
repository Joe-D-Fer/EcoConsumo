/**
 * Comparación de escenarios (actual y simulado) y contraste con la boleta real.
 */
import { costoTotal } from './funciones';
import { consumoTotal } from './vectores';
import type { Artefacto, Tarifa } from './tipos';

/** Datos de un artefacto que se pueden cambiar en la simulación. */
export type CambiosArtefacto = Partial<
	Pick<Artefacto, 'potenciaW' | 'cantidad' | 'horasDia' | 'diasMes' | 'standbyW'>
>;

/**
 * Escenario simulado: copia de los artefactos con los cambios aplicados.
 * No modifica los artefactos originales.
 */
export function aplicarCambios<T extends Artefacto & { id: string }>(
	artefactos: T[],
	cambios: Record<string, CambiosArtefacto>
): T[] {
	return artefactos.map((a) => ({ ...a, ...cambios[a.id] }));
}

/** Resultado de comparar el escenario actual con uno simulado. */
export interface ComparacionEscenarios {
	kwhActual: number;
	kwhSimulado: number;
	ahorroKwh: number;
	costoActual: number;
	costoSimulado: number;
	ahorroPesos: number;
	/** Ahorro relativo de energía, en porcentaje del consumo actual. */
	ahorroPorcentaje: number;
}

/** Compara dos escenarios de un mismo hogar con la misma tarifa. */
export function compararEscenarios(
	actual: Artefacto[],
	simulado: Artefacto[],
	tarifa: Tarifa
): ComparacionEscenarios {
	const kwhActual = consumoTotal(actual);
	const kwhSimulado = consumoTotal(simulado);
	const costoActual = costoTotal(kwhActual, tarifa);
	const costoSimulado = costoTotal(kwhSimulado, tarifa);
	return {
		kwhActual,
		kwhSimulado,
		ahorroKwh: kwhActual - kwhSimulado,
		costoActual,
		costoSimulado,
		ahorroPesos: costoActual - costoSimulado,
		ahorroPorcentaje: kwhActual === 0 ? 0 : (100 * (kwhActual - kwhSimulado)) / kwhActual
	};
}

/**
 * Error relativo de la estimación respecto del consumo real de la boleta, en porcentaje:
 * 100 · |estimado − real| / real.
 */
export function errorRelativo(estimado: number, real: number): number {
	if (!(real > 0)) throw new Error('El consumo real debe ser mayor que 0.');
	return (100 * Math.abs(estimado - real)) / real;
}

/** Calidad de la estimación según su error relativo respecto de la boleta. */
export type CalidadEstimacion = 'cercana' | 'aceptable' | 'lejana';

/** Hasta 10 %: cercana; hasta 25 %: aceptable; más de 25 %: lejana. */
export function calidadEstimacion(errorPorcentaje: number): CalidadEstimacion {
	if (errorPorcentaje <= 10) return 'cercana';
	if (errorPorcentaje <= 25) return 'aceptable';
	return 'lejana';
}
