import { describe, expect, it } from 'vitest';
import { hogaresTipo } from './hogares-tipo';
import { catalogo, comunas } from './ejemplo';
import { consumoTotal, validarArtefacto } from '#lib/matematica/index.js';

describe('hogares tipo', () => {
	it('tienen identificadores únicos', () => {
		const ids = hogaresTipo.map((h) => h.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it.each(hogaresTipo)('$nombre: todos sus artefactos son válidos', (h) => {
		expect(h.artefactos.length).toBeGreaterThan(0);
		for (const a of h.artefactos) expect(validarArtefacto(a), a.nombre).toEqual([]);
	});

	it.each(hogaresTipo)('$nombre: su comuna y sus artefactos de catálogo existen', (h) => {
		expect(comunas.some((c) => c.id === h.comunaId)).toBe(true);
		for (const a of h.artefactos) {
			if (a.catalogoId) expect(catalogo.some((c) => c.id === a.catalogoId), a.nombre).toBe(true);
		}
	});

	it.each(hogaresTipo)('$nombre: consumo mensual entre 50 y 600 kWh', (h) => {
		const total = consumoTotal(h.artefactos);
		expect(total).toBeGreaterThan(50);
		expect(total).toBeLessThan(600);
	});
});
