/**
 * Escenas de GeoGebra: traducen los datos del hogar a comandos de GeoGebra.
 *
 * Son funciones puras que devuelven una lista de comandos (texto). La interfaz los envía a la
 * calculadora con la API de GeoGebra (`evalCommand`), y la persona usuaria también puede copiarlos y
 * pegarlos en GeoGebra Clásico para repetir la construcción en clases.
 *
 * GeoGebra exige los nombres de los comandos en inglés (Slider, Sequence, Sum…), aunque la interfaz
 * esté en español. Los nombres de los objetos sí están en español para que se lean en la vista
 * algebraica: potencia, horas, consumo, total…
 *
 * Cada escena define además un objeto numérico de control (`total`, `costoQ` o `consumoA`) que la
 * aplicación lee de vuelta para verificar que GeoGebra obtiene el mismo resultado que EcoConsumo,
 * incluso después de mover un deslizador.
 */
import { HORAS_DIA, consumoMensual, costoTotal } from '#lib/matematica/funciones.js';
import { sucesionConsumo, sumasParciales } from '#lib/matematica/sucesiones.js';
import { consumoTotal } from '#lib/matematica/vectores.js';
import { vectorFactoresPeriodo } from '#lib/matematica/matrices.js';
import type { Artefacto, Periodo, Tarifa } from '#lib/matematica/tipos.js';

/** Construcción lista para enviar a GeoGebra. */
export interface Escena {
	/** Comandos de GeoGebra, en orden. */
	comandos: string[];
	/** Objetos cuyo valor se lee de GeoGebra: el de control y el deslizador, si hay. */
	observar: string[];
	/** Nombre del objeto de control, calculado por GeoGebra. */
	control: string;
	/**
	 * Valor que EcoConsumo calcula para el objeto de control, a partir de los valores leídos de
	 * GeoGebra (por ejemplo, la posición del deslizador).
	 */
	esperado: (valores: Record<string, number>) => number;
	/** Región visible del plano; se vuelve a aplicar cuando cambia el tamaño de la calculadora. */
	ventana: Ventana;
}

/** Región visible del plano cartesiano. */
export interface Ventana {
	xmin: number;
	xmax: number;
	ymin: number;
	ymax: number;
}

/** Colores de la marca, oscurecidos para contrastar con el fondo blanco de GeoGebra. */
export const COLORES = {
	naranja: '#E07800',
	verde: '#3F8F0B',
	oscuro: '#0A0D12',
	gris: '#6B7280'
} as const;

/** Número en el formato que entiende GeoGebra: punto decimal y sin notación científica. */
export function num(x: number, decimales = 4): string {
	if (!Number.isFinite(x)) return '0';
	const redondeado = Number(x.toFixed(decimales));
	return Object.is(redondeado, -0) ? '0' : String(redondeado);
}

/** Lista de GeoGebra, por ejemplo {1, 2.5, 3}. */
export function lista(v: number[], decimales = 4): string {
	return `{${v.map((x) => num(x, decimales)).join(', ')}}`;
}

/** Texto entre comillas para GeoGebra (sin comillas internas). */
function texto(s: string): string {
	return `"${s.replace(/"/g, "'")}"`;
}

/** Ventana redondeada a 2 decimales. */
function ventana(xmin: number, xmax: number, ymin: number, ymax: number): Ventana {
	const r = (x: number) => Number(num(x, 2));
	return { xmin: r(xmin), xmax: r(xmax), ymin: r(ymin), ymax: r(ymax) };
}

/** Comando ZoomIn que muestra la ventana (para quien copia los comandos a GeoGebra). */
function zoom(v: Ventana): string {
	return `ZoomIn(${v.xmin}, ${v.ymin}, ${v.xmax}, ${v.ymax})`;
}

/** Máximo positivo para escalar los ejes (evita un eje de largo 0). */
function techo(x: number, minimo = 1): number {
	return Math.max(x, minimo);
}

/**
 * Función de costo C(E) = p · E + F, con un deslizador E y el punto del hogar.
 * Objeto de control: costoQ = C(E) con E en el consumo del hogar.
 */
export function escenaCosto(tarifa: Tarifa, kwhHogar: number): Escena {
	const xmax = techo(Math.ceil((kwhHogar * 2) / 50) * 50, 100);
	const ymax = techo(costoTotal(xmax, tarifa));
	const vista = ventana(-0.1 * xmax, xmax * 1.05, -0.12 * ymax, ymax * 1.1);
	return {
		ventana: vista,
		comandos: [
			`p = ${num(tarifa.precioKwh)}`,
			`F = ${num(tarifa.cargoFijo)}`,
			'C(x) = If(x >= 0, p * x + F)',
			`E = Slider(0, ${num(xmax, 0)}, 1)`,
			`SetValue(E, ${num(kwhHogar, 2)})`,
			'Q = (E, C(E))',
			'costoQ = C(E)',
			'v = Segment((E, 0), Q)',
			'w = Segment((0, C(E)), Q)',
			`Hogar = (${num(kwhHogar, 2)}, C(${num(kwhHogar, 2)}))`,
			`SetColor(C, ${texto(COLORES.naranja)})`,
			'SetLineThickness(C, 7)',
			`SetColor(Q, ${texto(COLORES.oscuro)})`,
			'SetPointSize(Q, 6)',
			'ShowLabel(Q, false)',
			`SetColor(v, ${texto(COLORES.gris)})`,
			`SetColor(w, ${texto(COLORES.gris)})`,
			'SetLineStyle(v, 1)',
			'SetLineStyle(w, 1)',
			'ShowLabel(v, false)',
			'ShowLabel(w, false)',
			// Los segmentos guía no se listan en la vista algebraica.
			'SetAuxiliary(v, true)',
			'SetAuxiliary(w, true)',
			`SetColor(Hogar, ${texto(COLORES.verde)})`,
			'SetPointSize(Hogar, 5)',
			`SetCaption(Hogar, ${texto('Tu hogar')})`,
			'SetLabelMode(Hogar, 3)',
			'SetFixed(Hogar, true)',
			zoom(vista)
		],
		observar: ['costoQ', 'E'],
		control: 'costoQ',
		esperado: (v) => costoTotal(v.E ?? kwhHogar, tarifa)
	};
}

/**
 * Función de consumo de un artefacto según sus horas de uso:
 *   E(h) = n · d · [P · h + S · (24 − h)] / 1000,  con 0 ≤ h ≤ 24.
 * Es una función lineal de h con pendiente n · d · (P − S) / 1000.
 * Objeto de control: consumoA = E(h) con h en las horas registradas.
 */
export function escenaConsumo(a: Artefacto): Escena {
	const extremo = (h: number) => consumoMensual({ ...a, horasDia: h });
	const ymax = techo(Math.max(extremo(0), extremo(HORAS_DIA)), 0.1);
	const vista = ventana(-2.5, 25.5, -0.12 * ymax, ymax * 1.15);
	return {
		ventana: vista,
		comandos: [
			`P = ${num(a.potenciaW)}`,
			`S = ${num(a.standbyW)}`,
			`n = ${num(a.cantidad)}`,
			`d = ${num(a.diasMes)}`,
			`E(x) = If(x >= 0 && x <= ${HORAS_DIA}, n * d * (P * x + S * (${HORAS_DIA} - x)) / 1000)`,
			`h = Slider(0, ${HORAS_DIA}, 0.25)`,
			`SetValue(h, ${num(a.horasDia, 2)})`,
			'A = (h, E(h))',
			'consumoA = E(h)',
			'pendiente = n * d * (P - S) / 1000',
			'v = Segment((h, 0), A)',
			'w = Segment((0, E(h)), A)',
			`SetColor(E, ${texto(COLORES.naranja)})`,
			'SetLineThickness(E, 7)',
			`SetColor(A, ${texto(COLORES.oscuro)})`,
			'SetPointSize(A, 6)',
			'SetLabelMode(A, 2)',
			`SetColor(v, ${texto(COLORES.gris)})`,
			`SetColor(w, ${texto(COLORES.gris)})`,
			'SetLineStyle(v, 1)',
			'SetLineStyle(w, 1)',
			'ShowLabel(v, false)',
			'ShowLabel(w, false)',
			// Los segmentos guía no se listan en la vista algebraica.
			'SetAuxiliary(v, true)',
			'SetAuxiliary(w, true)',
			zoom(vista)
		],
		observar: ['consumoA', 'h'],
		control: 'consumoA',
		esperado: (v) => extremo(v.h ?? a.horasDia)
	};
}

/** Vista de la escena de sucesiones: consumo de cada mes o acumulado. */
export type ModoSucesion = 'mensual' | 'acumulado';

/**
 * Sucesión del consumo por mes aⱼ y sus sumas parciales Sₙ = a₁ + … + aₙ.
 * Objeto de control: total = Σ aⱼ (consumo del año).
 */
export function escenaSucesion(
	artefactos: Artefacto[],
	periodos: Periodo[],
	modo: ModoSucesion
): Escena {
	const a = sucesionConsumo(artefactos, periodos);
	const s = sumasParciales(a);
	const m = a.length;
	const ymax = techo(Math.max(...(modo === 'mensual' ? a : s), 0));
	const serie = modo === 'mensual' ? 'a' : 'S';
	const vista = ventana(-0.8, m + 0.8, -0.12 * ymax, ymax * 1.15);
	return {
		ventana: vista,
		comandos: [
			`a = ${lista(a)}`,
			// Sum(lista, k) suma los primeros k términos de la lista.
			`S = Sequence(Sum(a, k), k, 1, ${m})`,
			'total = Sum(a)',
			`puntos = Sequence((k, ${serie}(k)), k, 1, ${m})`,
			'linea = Polyline(puntos)',
			`SetColor(puntos, ${texto(COLORES.naranja)})`,
			'SetPointSize(puntos, 5)',
			`SetColor(linea, ${texto(COLORES.naranja)})`,
			'SetLineThickness(linea, 5)',
			'ShowLabel(linea, false)',
			zoom(vista)
		],
		observar: ['total'],
		control: 'total',
		esperado: () => s.at(-1) ?? 0
	};
}

/**
 * Vectores, sumatoria y matriz del hogar, calculados por GeoGebra a partir de los datos:
 *   consumo = E (vector de consumos),  total = Σ Eᵢ,  M = E · fᵀ,  a = (Σᵢ Mᵢⱼ)ⱼ.
 * El gráfico de barras muestra las componentes del vector E.
 * Objeto de control: total = Σ Eᵢ.
 */
export function escenaVectores(artefactos: Artefacto[], periodos: Periodo[]): Escena {
	const k = artefactos.length;
	const ymax = techo(Math.max(...artefactos.map(consumoMensual), 0));
	const vista = ventana(-0.6, k + 1, -0.12 * ymax, ymax * 1.15);
	return {
		ventana: vista,
		comandos: [
			`potencia = ${lista(artefactos.map((a) => a.potenciaW))}`,
			`horas = ${lista(artefactos.map((a) => a.horasDia))}`,
			`standby = ${lista(artefactos.map((a) => a.standbyW))}`,
			`cantidad = ${lista(artefactos.map((a) => a.cantidad))}`,
			`dias = ${lista(artefactos.map((a) => a.diasMes))}`,
			`consumo = Sequence(cantidad(i) * dias(i) * (potencia(i) * horas(i) + standby(i) * (${HORAS_DIA} - horas(i))) / 1000, i, 1, ${k})`,
			'total = Sum(consumo)',
			`f = ${lista(vectorFactoresPeriodo(periodos), 6)}`,
			// {consumo} es una matriz de 1 × k; su transpuesta (k × 1) por {f} (1 × 12) da M (k × 12).
			'M = Transpose({consumo}) * {f}',
			`a = Flatten({Sequence(1, i, 1, ${k})} * M)`,
			`barras = BarChart(Sequence(${k}), consumo, 0.7)`,
			`SetColor(barras, ${texto(COLORES.naranja)})`,
			'SetFilling(barras, 0.75)',
			'ShowLabel(barras, false)',
			// Nombre de cada artefacto bajo su barra (componente i del vector E).
			...artefactos.flatMap((a, i) => [
				`nombre${i + 1} = Text(${texto(a.nombre.slice(0, 14))}, (${num(i + 0.65, 2)}, ${num(-0.08 * ymax, 2)}))`,
				`SetColor(nombre${i + 1}, ${texto(COLORES.oscuro)})`
			]),
			zoom(vista)
		],
		observar: ['total'],
		control: 'total',
		esperado: () => consumoTotal(artefactos)
	};
}
