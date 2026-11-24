/**
 * Tipos de los datos de referencia: compañías distribuidoras, comunas y catálogo de artefactos.
 * Se leen desde Supabase (`supabase.ts`) o, si no está configurado, desde `ejemplo.ts`.
 */
import type { Tarifa } from '#lib/matematica/index.js';

/** Compañía distribuidora de electricidad. */
export interface Distribuidora {
	id: string;
	nombre: string;
	/** Tarifa que se usa en las comunas que no tienen una tarifa propia. */
	tarifaBase: Tarifa;
	/** Referencia de la fuente del dato (APA 7); si falta, el dato es provisorio. */
	fuente?: string;
}

/** Una compañía distribuidora que atiende una comuna, con su precio en esa comuna. */
export interface ServicioComuna {
	distribuidoraId: string;
	/** Tarifa de la distribuidora en esta comuna, si difiere de su tarifa base. */
	tarifa?: Tarifa;
	/** Referencia de la fuente de la tarifa de la comuna (APA 7); si falta, el dato es provisorio. */
	fuente?: string;
}

/** Comuna y las compañías que la atienden. */
export interface Comuna {
	id: string;
	nombre: string;
	region: string;
	/**
	 * Compañías que atienden la comuna; la primera es la principal, que se selecciona automáticamente.
	 * Si hay más de una, la persona usuaria elige la que aparece en su boleta.
	 */
	servicios: ServicioComuna[];
}

/** Artefacto del catálogo, con valores típicos para sugerir en el formulario. */
export interface ArtefactoCatalogo {
	id: string;
	nombre: string;
	categoria: string;
	potenciaW: number;
	standbyW: number;
	horasDiaSugeridas: number;
	diasMesSugeridos: number;
	/** Referencia de la fuente del dato (APA 7); si falta, el dato es provisorio. */
	fuente?: string;
}

/** Tarifa resuelta para una comuna, con su origen. */
export interface TarifaComuna {
	comuna: Comuna;
	distribuidora: Distribuidora;
	/** Indica si es la compañía principal de la comuna (la seleccionada automáticamente). */
	principal: boolean;
	tarifa: Tarifa;
	/** `comuna` si la distribuidora tiene un precio propio en la comuna; `base` si se usó su tarifa base. */
	origen: 'comuna' | 'base';
}
