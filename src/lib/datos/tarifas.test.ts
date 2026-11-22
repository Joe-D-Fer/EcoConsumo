import { describe, expect, it } from 'vitest';
import { tarifaDeComuna } from './tarifas';
import type { Comuna, Distribuidora } from './tipos';

const distribuidoras: Distribuidora[] = [
	{ id: 'a', nombre: 'Distribuidora A', tarifaBase: { precioKwh: 200, cargoFijo: 1000 } }
];
const comunas: Comuna[] = [
	{ id: 'uno', nombre: 'Uno', region: 'R', distribuidoraId: 'a' },
	{ id: 'dos', nombre: 'Dos', region: 'R', distribuidoraId: 'a', tarifa: { precioKwh: 180, cargoFijo: 900 } },
	{ id: 'huerfana', nombre: 'Huérfana', region: 'R', distribuidoraId: 'no-existe' }
];

describe('tarifaDeComuna', () => {
	it('usa la tarifa base de la distribuidora si la comuna no tiene precio propio', () => {
		const r = tarifaDeComuna('uno', comunas, distribuidoras);
		expect(r?.distribuidora.id).toBe('a');
		expect(r?.tarifa).toEqual({ precioKwh: 200, cargoFijo: 1000 });
		expect(r?.origen).toBe('base');
	});

	it('usa el precio de la distribuidora en esa comuna cuando existe', () => {
		const r = tarifaDeComuna('dos', comunas, distribuidoras);
		expect(r?.tarifa).toEqual({ precioKwh: 180, cargoFijo: 900 });
		expect(r?.origen).toBe('comuna');
	});

	it('devuelve null si la comuna o su distribuidora no existen', () => {
		expect(tarifaDeComuna('nada', comunas, distribuidoras)).toBeNull();
		expect(tarifaDeComuna('huerfana', comunas, distribuidoras)).toBeNull();
	});
});
