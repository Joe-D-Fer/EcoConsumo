/**
 * Sucesiones del consumo y del ahorro.
 *
 * Sucesión del consumo por período:  aⱼ = Σᵢ Mᵢⱼ  (totales de las columnas de la matriz).
 * Sucesión de sumas parciales (consumo acumulado):  Sₙ = Σ aⱼ  (j = 1, …, n).
 * Ahorro acumulado con un ahorro mensual constante r: sucesión aritmética  Aₙ = n · r.
 */
import { matrizConsumo, totalesColumnas } from './matrices';
import type { Artefacto, Periodo, Vector } from './tipos';

/** Sucesión aⱼ del consumo total del hogar en cada período, en kWh. */
export function sucesionConsumo(artefactos: Artefacto[], periodos: Periodo[]): Vector {
	return totalesColumnas(matrizConsumo(artefactos, periodos));
}

/** Sucesión de sumas parciales: Sₙ = a₁ + a₂ + … + aₙ. */
export function sumasParciales(a: Vector): Vector {
	let acumulado = 0;
	return a.map((x) => (acumulado += x));
}

/** Primeros n términos de la sucesión aritmética Aₙ = A₁ + (n − 1) · r. */
export function sucesionAritmetica(primerTermino: number, diferencia: number, n: number): Vector {
	return Array.from({ length: n }, (_, i) => primerTermino + i * diferencia);
}

/** Ahorro acumulado durante n meses con un ahorro mensual constante: Aₙ = n · ahorro. */
export function ahorroAcumulado(ahorroMensual: number, meses: number): Vector {
	return sucesionAritmetica(ahorroMensual, ahorroMensual, meses);
}
