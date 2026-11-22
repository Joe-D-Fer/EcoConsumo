/** Formato de números y montos para Chile. */

/** Número con separadores chilenos, por ejemplo 1.234,5. */
export function formatearNumero(x: number, decimales = 1): string {
	return new Intl.NumberFormat('es-CL', { maximumFractionDigits: decimales }).format(x);
}

/** Monto en pesos chilenos, por ejemplo $ 21.000. */
export function formatearPesos(x: number): string {
	return new Intl.NumberFormat('es-CL', {
		style: 'currency',
		currency: 'CLP',
		maximumFractionDigits: 0
	}).format(x);
}
