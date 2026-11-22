/**
 * Vectores y sumatorias del hogar.
 *
 * Con k artefactos se forman los vectores
 *   P = (P₁, …, Pₖ)  potencias,   h = (h₁, …, hₖ)  horas de uso,   E = (E₁, …, Eₖ)  consumos,
 * y el consumo total del hogar es la sumatoria  E_total = Σ Eᵢ  (i = 1, …, k).
 */
import { consumoMensual } from './funciones';
import type { Artefacto, Vector } from './tipos';

/** Vector de potencias P, en W. */
export function vectorPotencias(artefactos: Artefacto[]): Vector {
	return artefactos.map((a) => a.potenciaW);
}

/** Vector de horas de uso por día h. */
export function vectorHoras(artefactos: Artefacto[]): Vector {
	return artefactos.map((a) => a.horasDia);
}

/** Vector de consumos mensuales E, en kWh. */
export function vectorConsumo(artefactos: Artefacto[]): Vector {
	return artefactos.map(consumoMensual);
}

/** Sumatoria de las componentes de un vector: Σ vᵢ. */
export function sumatoria(v: Vector): number {
	return v.reduce((suma, x) => suma + x, 0);
}

/** Multiplicación de un vector por un escalar: c · v. */
export function multiplicarEscalar(c: number, v: Vector): Vector {
	return v.map((x) => c * x);
}

/** Producto punto de dos vectores del mismo largo: u · v = Σ uᵢ vᵢ. */
export function productoPunto(u: Vector, v: Vector): number {
	if (u.length !== v.length) throw new Error('Los vectores deben tener el mismo largo.');
	return sumatoria(u.map((x, i) => x * v[i]));
}

/** Consumo total del hogar: E_total = Σ Eᵢ, en kWh por mes. */
export function consumoTotal(artefactos: Artefacto[]): number {
	return sumatoria(vectorConsumo(artefactos));
}

/**
 * Porcentaje de aporte de cada componente al total: 100 · vᵢ / Σ v.
 * Si el total es 0, todos los porcentajes son 0.
 */
export function porcentajes(v: Vector): Vector {
	const total = sumatoria(v);
	return total === 0 ? v.map(() => 0) : multiplicarEscalar(100 / total, v);
}

/** Índice de la mayor componente del vector, o -1 si está vacío. */
export function indiceMaximo(v: Vector): number {
	return v.reduce((iMax, x, i) => (iMax === -1 || x > v[iMax] ? i : iMax), -1);
}
