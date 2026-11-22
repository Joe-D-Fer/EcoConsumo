import { describe, expect, it } from 'vitest';
import {
	ahorroAcumulado,
	compararEscenarios,
	consumoDiario,
	consumoMensual,
	consumoTotal,
	costoEnergia,
	costoTotal,
	errorRelativo,
	indiceMaximo,
	matrizConsumo,
	porcentajes,
	productoPunto,
	sucesionConsumo,
	sumasParciales,
	sumatoria,
	totalMatriz,
	totalesColumnas,
	totalesFilas,
	transpuesta,
	validarArtefacto,
	mesesDelAnio,
	aplicarCambios,
	calidadEstimacion,
	consumoEnPeriodo,
	vectorConsumo,
	vectorHoras,
	vectorPotencias,
	type Artefacto,
	type Periodo,
	type Tarifa
} from './index';

// Hogar de ejemplo; los valores esperados se calcularon a mano.
const refrigerador: Artefacto = {
	nombre: 'Refrigerador',
	potenciaW: 150,
	cantidad: 1,
	horasDia: 24,
	diasMes: 30,
	standbyW: 0
}; // 150 · 24 / 1000 = 3,6 kWh/día → 108 kWh/mes
const televisor: Artefacto = {
	nombre: 'Televisor',
	potenciaW: 100,
	cantidad: 2,
	horasDia: 4,
	diasMes: 30,
	standbyW: 1
}; // 2 · (100 · 4 + 1 · 20) / 1000 = 0,84 kWh/día → 25,2 kWh/mes
const microondas: Artefacto = {
	nombre: 'Microondas',
	potenciaW: 1200,
	cantidad: 1,
	horasDia: 0.25,
	diasMes: 20,
	standbyW: 2
}; // (1200 · 0,25 + 2 · 23,75) / 1000 = 0,3475 kWh/día → 6,95 kWh/mes

const hogar = [refrigerador, televisor, microondas];
const tarifa: Tarifa = { precioKwh: 200, cargoFijo: 1000 };
const periodos: Periodo[] = [
	{ etiqueta: 'Ene', dias: 31 },
	{ etiqueta: 'Feb', dias: 28 },
	{ etiqueta: 'Mar', dias: 30 }
];

describe('funciones de consumo y costo', () => {
	it('calcula el consumo diario con uso y standby', () => {
		expect(consumoDiario(televisor)).toBeCloseTo(0.84);
	});

	it('calcula el consumo mensual de cada artefacto', () => {
		expect(consumoMensual(refrigerador)).toBeCloseTo(108);
		expect(consumoMensual(televisor)).toBeCloseTo(25.2);
		expect(consumoMensual(microondas)).toBeCloseTo(6.95);
	});

	it('aplica la función lineal de costo C(E) = p · E + F', () => {
		expect(costoEnergia(100, tarifa)).toBe(20000);
		expect(costoTotal(100, tarifa)).toBe(21000);
		expect(costoTotal(0, tarifa)).toBe(1000);
	});

	it('valida los datos del artefacto', () => {
		expect(validarArtefacto(refrigerador)).toEqual([]);
		const invalido = { ...refrigerador, nombre: ' ', horasDia: 25, cantidad: 0, standbyW: -1 };
		expect(validarArtefacto(invalido)).toHaveLength(4);
	});
});

describe('vectores y sumatorias', () => {
	it('forma los vectores de potencia, horas y consumo', () => {
		expect(vectorPotencias(hogar)).toEqual([150, 100, 1200]);
		expect(vectorHoras(hogar)).toEqual([24, 4, 0.25]);
		const e = vectorConsumo(hogar);
		expect(e[0]).toBeCloseTo(108);
		expect(e[1]).toBeCloseTo(25.2);
		expect(e[2]).toBeCloseTo(6.95);
	});

	it('suma el consumo total del hogar', () => {
		expect(consumoTotal(hogar)).toBeCloseTo(140.15);
		expect(sumatoria([])).toBe(0);
	});

	it('calcula los porcentajes de aporte', () => {
		const p = porcentajes([1, 3]);
		expect(p).toEqual([25, 75]);
		expect(sumatoria(porcentajes(vectorConsumo(hogar)))).toBeCloseTo(100);
		expect(porcentajes([0, 0])).toEqual([0, 0]);
	});

	it('calcula el producto punto y el índice máximo', () => {
		expect(productoPunto([1, 2, 3], [4, 5, 6])).toBe(32);
		expect(() => productoPunto([1], [1, 2])).toThrow();
		expect(indiceMaximo(vectorConsumo(hogar))).toBe(0);
		expect(indiceMaximo([])).toBe(-1);
	});
});

describe('matriz artefactos × períodos', () => {
	const m = matrizConsumo(hogar, periodos);

	it('tiene una fila por artefacto y una columna por período', () => {
		expect(m).toHaveLength(3);
		m.forEach((fila) => expect(fila).toHaveLength(3));
		expect(m[0][0]).toBeCloseTo((108 * 31) / 30);
		expect(m[0][2]).toBeCloseTo(108);
	});

	it('suma filas, columnas y el total de forma coherente', () => {
		const diasTotales = 31 + 28 + 30;
		expect(totalesColumnas(m)[2]).toBeCloseTo(140.15);
		expect(totalesFilas(m)[0]).toBeCloseTo((108 * diasTotales) / 30);
		expect(totalMatriz(m)).toBeCloseTo((140.15 * diasTotales) / 30);
		expect(sumatoria(totalesFilas(m))).toBeCloseTo(sumatoria(totalesColumnas(m)));
	});

	it('transpone la matriz', () => {
		expect(transpuesta([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
		expect(transpuesta([])).toEqual([]);
	});
});

describe('sucesiones', () => {
	it('obtiene la sucesión del consumo por período', () => {
		const a = sucesionConsumo(hogar, periodos);
		expect(a[0]).toBeCloseTo((140.15 * 31) / 30);
		expect(a[1]).toBeCloseTo((140.15 * 28) / 30);
	});

	it('calcula las sumas parciales y el ahorro acumulado', () => {
		expect(sumasParciales([1, 2, 3, 4])).toEqual([1, 3, 6, 10]);
		expect(ahorroAcumulado(500, 4)).toEqual([500, 1000, 1500, 2000]);
	});
});

describe('simulación y boleta', () => {
	it('compara el escenario actual con uno simulado', () => {
		// Simulación: los televisores se usan 2 horas en vez de 4 → 2 · (200 + 22) / 1000 · 30 = 13,32
		const simulado = hogar.map((a) => (a === televisor ? { ...a, horasDia: 2 } : a));
		const r = compararEscenarios(hogar, simulado, tarifa);
		expect(r.ahorroKwh).toBeCloseTo(25.2 - 13.32);
		expect(r.ahorroPesos).toBeCloseTo(200 * (25.2 - 13.32));
		expect(r.costoActual).toBeCloseTo(200 * 140.15 + 1000);
		expect(r.ahorroPorcentaje).toBeCloseTo((100 * 11.88) / 140.15);
	});

	it('calcula el error relativo respecto de la boleta', () => {
		expect(errorRelativo(90, 100)).toBeCloseTo(10);
		expect(errorRelativo(110, 100)).toBeCloseTo(10);
		expect(() => errorRelativo(10, 0)).toThrow();
	});
});

describe('períodos mensuales', () => {
	it('usa los días reales de cada mes', () => {
		const p2026 = mesesDelAnio(2026);
		expect(p2026).toHaveLength(12);
		expect(p2026[1]).toEqual({ etiqueta: 'Feb', dias: 28 });
		expect(sumatoria(p2026.map((p) => p.dias))).toBe(365);
	});

	it('considera los años bisiestos', () => {
		expect(mesesDelAnio(2028)[1].dias).toBe(29);
	});
});

describe('escenario simulado', () => {
	const conId = hogar.map((a, i) => ({ ...a, id: String(i) }));

	it('aplica los cambios sin modificar los artefactos originales', () => {
		const simulado = aplicarCambios(conId, { '1': { horasDia: 2, standbyW: 0 } });
		expect(simulado[1].horasDia).toBe(2);
		expect(simulado[1].standbyW).toBe(0);
		expect(simulado[1].potenciaW).toBe(100);
		expect(conId[1].horasDia).toBe(4);
		expect(simulado[0]).toEqual(conId[0]);
	});

	it('escala el consumo mensual a los días del período de la boleta', () => {
		expect(consumoEnPeriodo(140.15, 30)).toBeCloseTo(140.15);
		expect(consumoEnPeriodo(30, 31)).toBeCloseTo(31);
	});

	it('clasifica la calidad de la estimación', () => {
		expect(calidadEstimacion(5)).toBe('cercana');
		expect(calidadEstimacion(10)).toBe('cercana');
		expect(calidadEstimacion(20)).toBe('aceptable');
		expect(calidadEstimacion(40)).toBe('lejana');
	});
});
