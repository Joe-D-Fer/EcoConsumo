/**
 * Datos de referencia: compañías distribuidoras, comunas con su tarifa y catálogo de artefactos.
 *
 * Se parte con los datos de ejemplo y, si hay base de datos configurada, se reemplazan por los de
 * Supabase al cargar la aplicación. Si la base de datos no responde, se mantienen los de ejemplo.
 */
import * as ejemplo from '#lib/datos/ejemplo.js';
import { hayBaseDeDatos, leerReferencia } from '#lib/datos/supabase.js';
import type { ArtefactoCatalogo, Comuna, Distribuidora } from '#lib/datos/tipos.js';

export class EstadoReferencia {
	distribuidoras = $state.raw<Distribuidora[]>(ejemplo.distribuidoras);
	comunas = $state.raw<Comuna[]>(ejemplo.comunas);
	catalogo = $state.raw<ArtefactoCatalogo[]>(ejemplo.catalogo);
	/** Origen de los datos que se están mostrando. */
	origen = $state<'ejemplo' | 'supabase'>('ejemplo');

	/** Hay datos sin fuente: se muestra el aviso de datos provisorios. */
	sonProvisorios = $derived(
		this.origen === 'ejemplo' ||
			this.distribuidoras.some((d) => !d.fuente) ||
			this.comunas.some((c) => c.tarifa && !c.fuente) ||
			this.catalogo.some((a) => !a.fuente)
	);

	async cargar(): Promise<void> {
		if (!hayBaseDeDatos) return;
		try {
			const datos = await leerReferencia();
			// Una base de datos vacía no reemplaza a los datos de ejemplo.
			if (datos.comunas.length === 0 || datos.distribuidoras.length === 0) return;
			this.distribuidoras = datos.distribuidoras;
			this.comunas = datos.comunas;
			if (datos.catalogo.length > 0) this.catalogo = datos.catalogo;
			this.origen = 'supabase';
		} catch (error) {
			console.error('No se pudieron leer los datos de referencia desde Supabase.', error);
		}
	}
}

/** Estado único de los datos de referencia. */
export const referencia = new EstadoReferencia();
