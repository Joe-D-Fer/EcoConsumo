import { describe, expect, it } from 'vitest';
import { agruparComunas, distribuidorasDeComuna, tarifaDeComuna } from './tarifas';
import type { Comuna, Distribuidora } from './tipos';

const distribuidoras: Distribuidora[] = [
	{ id: 'a', nombre: 'Distribuidora A', tarifaBase: { precioKwh: 200, cargoFijo: 1000 } },
	{ id: 'b', nombre: 'Distribuidora B', tarifaBase: { precioKwh: 230, cargoFijo: 1200 } }
];
const comunas: Comuna[] = [
	{ id: 'uno', nombre: 'Uno', region: 'R', servicios: [{ distribuidoraId: 'a' }] },
	{
		id: 'dos',
		nombre: 'Dos',
		region: 'R',
		servicios: [{ distribuidoraId: 'a', tarifa: { precioKwh: 180, cargoFijo: 900 } }]
	},
	{
		id: 'compartida',
		nombre: 'Compartida',
		region: 'R',
		servicios: [
			{ distribuidoraId: 'a' },
			{ distribuidoraId: 'b', tarifa: { precioKwh: 240, cargoFijo: 1300 } }
		]
	},
	{ id: 'huerfana', nombre: 'Huérfana', region: 'R', servicios: [{ distribuidoraId: 'no-existe' }] }
];

describe('tarifaDeComuna', () => {
	it('usa la tarifa base de la distribuidora si la comuna no tiene precio propio', () => {
		const r = tarifaDeComuna('uno', null, comunas, distribuidoras);
		expect(r?.distribuidora.id).toBe('a');
		expect(r?.tarifa).toEqual({ precioKwh: 200, cargoFijo: 1000 });
		expect(r?.origen).toBe('base');
		expect(r?.principal).toBe(true);
	});

	it('usa el precio de la distribuidora en esa comuna cuando existe', () => {
		const r = tarifaDeComuna('dos', null, comunas, distribuidoras);
		expect(r?.tarifa).toEqual({ precioKwh: 180, cargoFijo: 900 });
		expect(r?.origen).toBe('comuna');
	});

	it('en una comuna con varias compañías usa la principal si no se elige otra', () => {
		const r = tarifaDeComuna('compartida', null, comunas, distribuidoras);
		expect(r?.distribuidora.id).toBe('a');
		expect(r?.principal).toBe(true);
	});

	it('usa la compañía elegida y su precio en la comuna', () => {
		const r = tarifaDeComuna('compartida', 'b', comunas, distribuidoras);
		expect(r?.distribuidora.id).toBe('b');
		expect(r?.tarifa).toEqual({ precioKwh: 240, cargoFijo: 1300 });
		expect(r?.origen).toBe('comuna');
		expect(r?.principal).toBe(false);
	});

	it('vuelve a la principal si la compañía elegida no atiende la comuna', () => {
		expect(tarifaDeComuna('uno', 'b', comunas, distribuidoras)?.distribuidora.id).toBe('a');
	});

	it('devuelve null si la comuna o su distribuidora no existen', () => {
		expect(tarifaDeComuna('nada', null, comunas, distribuidoras)).toBeNull();
		expect(tarifaDeComuna('huerfana', null, comunas, distribuidoras)).toBeNull();
	});
});

describe('distribuidorasDeComuna', () => {
	it('lista las compañías de la comuna con la principal primero y omite las desconocidas', () => {
		expect(distribuidorasDeComuna(comunas[2], distribuidoras).map((d) => d.id)).toEqual(['a', 'b']);
		expect(distribuidorasDeComuna(comunas[3], distribuidoras)).toEqual([]);
	});
});

describe('agruparComunas', () => {
	it('agrupa las filas de la vista por comuna, con la principal primero', () => {
		const fila = { nombre: 'Compartida', region: 'R', precio_kwh: null, cargo_fijo: null, fuente: null };
		const r = agruparComunas([
			{ ...fila, id: 'compartida', distribuidora_id: 'a', principal: false },
			{ ...fila, id: 'compartida', distribuidora_id: 'b', principal: true, precio_kwh: '240', cargo_fijo: '1300' },
			{ ...fila, id: 'uno', nombre: 'Uno', distribuidora_id: 'a', principal: true }
		]);
		expect(r.map((c) => c.id)).toEqual(['compartida', 'uno']);
		expect(r[0].servicios).toEqual([
			{ distribuidoraId: 'b', tarifa: { precioKwh: 240, cargoFijo: 1300 }, fuente: undefined },
			{ distribuidoraId: 'a', tarifa: undefined, fuente: undefined }
		]);
	});
});
