import { describe, expect, it } from 'vitest';
import { escenaConsumo, escenaCosto, escenaSucesion, escenaVectores, lista, num } from './escenas';
import { mesesDelAnio, type Artefacto, type Tarifa } from '#lib/matematica/index.js';

const refrigerador: Artefacto = {
	nombre: 'Refrigerador',
	potenciaW: 150,
	cantidad: 1,
	horasDia: 24,
	diasMes: 30,
	standbyW: 0
};
const televisor: Artefacto = {
	nombre: 'Televisor',
	potenciaW: 100,
	cantidad: 2,
	horasDia: 4,
	diasMes: 30,
	standbyW: 1
};
const tarifa: Tarifa = { precioKwh: 150, cargoFijo: 1000 };
const periodos = mesesDelAnio(2026);

describe('formato de números para GeoGebra', () => {
	it('usa punto decimal, redondea y no deja -0', () => {
		expect(num(1234.56789)).toBe('1234.5679');
		expect(num(-0.00001)).toBe('0');
		expect(num(Number.NaN)).toBe('0');
		expect(lista([1, 2.5, 1 / 3], 2)).toBe('{1, 2.5, 0.33}');
	});
});

describe('escenas de GeoGebra', () => {
	it('función de costo: define C(x) = p x + F y espera C(E) del hogar', () => {
		const e = escenaCosto(tarifa, 108);
		expect(e.comandos).toContain('p = 150');
		expect(e.comandos).toContain('F = 1000');
		expect(e.comandos).toContain('SetValue(E, 108)');
		expect(e.esperado({})).toBe(150 * 108 + 1000);
		expect(e.esperado({ E: 10 })).toBe(150 * 10 + 1000);
	});

	it('función de consumo: deslizador en las horas registradas', () => {
		const e = escenaConsumo(televisor);
		expect(e.comandos).toContain('SetValue(h, 4)');
		// 2 · 30 · (100 · 4 + 1 · 20) / 1000 = 25,2 kWh
		expect(e.esperado({})).toBeCloseTo(25.2);
		// Con el deslizador en 0 h solo queda el standby: 2 · 30 · 24 / 1000.
		expect(e.esperado({ h: 0 })).toBeCloseTo(1.44);
	});

	it('sucesión: 12 términos y total igual a la suma anual', () => {
		const e = escenaSucesion([refrigerador], periodos, 'mensual');
		const a = e.comandos.find((c) => c.startsWith('a = '))!;
		expect(a.split(',')).toHaveLength(12);
		// 150 W · 24 h = 3,6 kWh por día, durante 365 días.
		expect(e.esperado({})).toBeCloseTo(3.6 * 365);
		expect(escenaSucesion([refrigerador], periodos, 'acumulado').comandos).toContain(
			'puntos = Sequence((k, S(k)), k, 1, 12)'
		);
	});

	it('vectores: un componente por artefacto y total Σ Eᵢ', () => {
		const e = escenaVectores([refrigerador, televisor], periodos);
		expect(e.comandos).toContain('potencia = {150, 100}');
		expect(e.comandos).toContain('cantidad = {1, 2}');
		expect(e.esperado({})).toBeCloseTo(108 + 25.2);
	});
});
