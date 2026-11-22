/**
 * Matriz de consumo artefactos × períodos.
 *
 * El elemento Mᵢⱼ es el consumo del artefacto i en el período j, en kWh. Como el registro usa un
 * mes de referencia de 30 días, el consumo en un período de Dⱼ días es Eᵢ · Dⱼ / 30.
 * Por lo tanto la matriz es el producto de un vector columna por un vector fila:
 *   M = E · fᵀ,  con  fⱼ = Dⱼ / 30.
 * La suma de la fila i es el consumo del artefacto en todos los períodos, y la suma de la
 * columna j es el consumo total del hogar en el período j.
 */
import { DIAS_MES_REFERENCIA } from './funciones';
import { sumatoria, vectorConsumo } from './vectores';
import type { Artefacto, Matriz, Periodo, Vector } from './tipos';

/** Producto de un vector columna u por un vector fila v: (u · vᵀ)ᵢⱼ = uᵢ · vⱼ. */
export function productoExterior(u: Vector, v: Vector): Matriz {
	return u.map((x) => v.map((y) => x * y));
}

/** Vector de factores de período f, con fⱼ = Dⱼ / 30. */
export function vectorFactoresPeriodo(periodos: Periodo[]): Vector {
	return periodos.map((p) => p.dias / DIAS_MES_REFERENCIA);
}

/** Matriz M de consumo (artefactos × períodos), en kWh. */
export function matrizConsumo(artefactos: Artefacto[], periodos: Periodo[]): Matriz {
	return productoExterior(vectorConsumo(artefactos), vectorFactoresPeriodo(periodos));
}

/** Vector con la suma de cada fila de la matriz. */
export function totalesFilas(m: Matriz): Vector {
	return m.map(sumatoria);
}

/** Vector con la suma de cada columna de la matriz. */
export function totalesColumnas(m: Matriz): Vector {
	if (m.length === 0) return [];
	return m[0].map((_, j) => sumatoria(m.map((fila) => fila[j])));
}

/** Suma de todos los elementos de la matriz: Σᵢ Σⱼ Mᵢⱼ. */
export function totalMatriz(m: Matriz): number {
	return sumatoria(totalesFilas(m));
}

/** Matriz transpuesta: (Mᵀ)ⱼᵢ = Mᵢⱼ. */
export function transpuesta(m: Matriz): Matriz {
	if (m.length === 0) return [];
	return m[0].map((_, j) => m.map((fila) => fila[j]));
}

/** Multiplicación de una matriz por un escalar, por ejemplo el precio del kWh: c · M. */
export function multiplicarMatrizEscalar(c: number, m: Matriz): Matriz {
	return m.map((fila) => fila.map((x) => c * x));
}
