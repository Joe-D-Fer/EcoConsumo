/**
 * Estado del hogar: artefactos registrados, comuna y tarifa.
 *
 * Por ahora se guarda en el navegador (localStorage). Cuando exista la base de datos en Supabase,
 * los métodos de esta clase guardarán ahí los mismos datos, asociados a un identificador anónimo.
 */
import { comunas, distribuidoras } from '#lib/datos/ejemplo.js';
import { tarifaDeComuna } from '#lib/datos/tarifas.js';
import type { Artefacto, Tarifa } from '#lib/matematica/index.js';

/** Artefacto registrado en el hogar, con identificador propio. */
export interface ArtefactoHogar extends Artefacto {
	id: string;
	/** Artefacto del catálogo desde el que se completó, si corresponde. */
	catalogoId?: string;
}

/** Datos de la boleta real, para comparar la estimación. */
export interface DatosBoleta {
	/** Consumo informado en la boleta, en kWh. */
	kwh: number;
	/** Días del período facturado. */
	dias: number;
}

interface DatosGuardados {
	artefactos: ArtefactoHogar[];
	comunaId: string | null;
	tarifaManual: Tarifa | null;
	boleta: DatosBoleta | null;
}

const CLAVE = 'ecoconsumo:hogar';

function nuevoId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class EstadoHogar {
	artefactos = $state<ArtefactoHogar[]>([]);
	comunaId = $state<string | null>(null);
	/** Tarifa corregida a mano por la persona usuaria; reemplaza la tarifa automática. */
	tarifaManual = $state<Tarifa | null>(null);
	/** Consumo de la boleta real ingresado por la persona usuaria. */
	boleta = $state<DatosBoleta | null>(null);
	/** Indica si ya se leyeron los datos guardados en el navegador. */
	cargado = $state(false);

	/** Compañía y tarifa seleccionadas automáticamente según la comuna. */
	tarifaAutomatica = $derived(
		this.comunaId ? tarifaDeComuna(this.comunaId, comunas, distribuidoras) : null
	);

	/** Tarifa vigente para los cálculos: la manual si existe; si no, la automática. */
	tarifa: Tarifa | null = $derived(this.tarifaManual ?? this.tarifaAutomatica?.tarifa ?? null);

	/** Lee los datos guardados. Se llama al montar la aplicación en el navegador. */
	cargar(): void {
		try {
			const texto = localStorage.getItem(CLAVE);
			if (texto) {
				const datos = JSON.parse(texto) as Partial<DatosGuardados>;
				this.artefactos = Array.isArray(datos.artefactos) ? datos.artefactos : [];
				this.comunaId = datos.comunaId ?? null;
				this.tarifaManual = datos.tarifaManual ?? null;
				this.boleta = datos.boleta ?? null;
			}
		} catch {
			// Sin acceso al almacenamiento o datos dañados: se parte con un hogar vacío.
		}
		this.cargado = true;
	}

	private guardar(): void {
		const datos: DatosGuardados = {
			artefactos: this.artefactos,
			comunaId: this.comunaId,
			tarifaManual: this.tarifaManual,
			boleta: this.boleta
		};
		try {
			localStorage.setItem(CLAVE, JSON.stringify(datos));
		} catch {
			// Si no se puede guardar, los datos se mantienen solo durante la visita.
		}
	}

	agregar(artefacto: Artefacto, catalogoId?: string): void {
		this.artefactos.push({ ...artefacto, id: nuevoId(), catalogoId });
		this.guardar();
	}

	actualizar(id: string, artefacto: Artefacto, catalogoId?: string): void {
		const i = this.artefactos.findIndex((a) => a.id === id);
		if (i === -1) return;
		this.artefactos[i] = { ...artefacto, id, catalogoId };
		this.guardar();
	}

	eliminar(id: string): void {
		this.artefactos = this.artefactos.filter((a) => a.id !== id);
		this.guardar();
	}

	/** Cambia la comuna; la tarifa vuelve a ser la automática de la nueva comuna. */
	seleccionarComuna(id: string): void {
		this.comunaId = id;
		this.tarifaManual = null;
		this.guardar();
	}

	corregirTarifa(tarifa: Tarifa): void {
		this.tarifaManual = tarifa;
		this.guardar();
	}

	restablecerTarifa(): void {
		this.tarifaManual = null;
		this.guardar();
	}

	guardarBoleta(boleta: DatosBoleta | null): void {
		this.boleta = boleta;
		this.guardar();
	}
}

/** Estado único del hogar en el navegador. */
export const hogar = new EstadoHogar();
