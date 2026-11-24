/**
 * Estado del hogar: artefactos registrados, comuna y tarifa.
 *
 * Los datos siempre se guardan en el navegador (localStorage). Si hay base de datos configurada,
 * además se guardan en Supabase asociados a un token anónimo que se genera en el navegador
 * (no hay inicio de sesión). Si la base de datos no responde, los cambios quedan pendientes y se
 * envían la próxima vez que se abra la aplicación.
 */
import { referencia } from './referencia.svelte.js';
import { escribirHogar, hayBaseDeDatos, leerHogar, type DatosHogar } from '#lib/datos/supabase.js';
import { tarifaDeComuna } from '#lib/datos/tarifas.js';
import type { HogarTipo } from '#lib/datos/hogares-tipo.js';
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

/** Estado del guardado en la base de datos. */
export type EstadoSincronizacion = 'solo-navegador' | 'cargando' | 'guardando' | 'guardado' | 'error';

const CLAVE = 'ecoconsumo:hogar';
const CLAVE_TOKEN = 'ecoconsumo:token';
/** Marca de cambios que aún no se guardan en la base de datos. */
const CLAVE_PENDIENTE = 'ecoconsumo:pendiente';
/** Espera antes de enviar los cambios, para agrupar varios seguidos. */
const ESPERA_MS = 800;

function nuevoId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** UUID v4; respaldo para navegadores sin `crypto.randomUUID`. */
function nuevoToken(): string {
	if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
	b[6] = (b[6] & 0x0f) | 0x40;
	b[8] = (b[8] & 0x3f) | 0x80;
	const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Lee del almacenamiento del navegador sin fallar si no está disponible. */
function leerLocal(clave: string): string | null {
	try {
		return localStorage.getItem(clave);
	} catch {
		return null;
	}
}

function escribirLocal(clave: string, valor: string | null): void {
	try {
		if (valor === null) localStorage.removeItem(clave);
		else localStorage.setItem(clave, valor);
	} catch {
		// Sin acceso al almacenamiento: los datos se mantienen solo durante la visita.
	}
}

export class EstadoHogar {
	artefactos = $state<ArtefactoHogar[]>([]);
	comunaId = $state<string | null>(null);
	/** Compañía elegida en una comuna atendida por varias; `null` = la principal de la comuna. */
	distribuidoraId = $state<string | null>(null);
	/** Tarifa corregida a mano por la persona usuaria; reemplaza la tarifa automática. */
	tarifaManual = $state<Tarifa | null>(null);
	/** Consumo de la boleta real ingresado por la persona usuaria. */
	boleta = $state<DatosBoleta | null>(null);
	/** Indica si ya se leyeron los datos guardados en el navegador. */
	cargado = $state(false);
	sincronizacion = $state<EstadoSincronizacion>('solo-navegador');

	private token: string | null = null;
	private temporizador: ReturnType<typeof setTimeout> | null = null;

	/** Compañía y tarifa seleccionadas automáticamente según la comuna. */
	tarifaAutomatica = $derived(
		this.comunaId
			? tarifaDeComuna(this.comunaId, this.distribuidoraId, referencia.comunas, referencia.distribuidoras)
			: null
	);

	/** Tarifa vigente para los cálculos: la manual si existe; si no, la automática. */
	tarifa: Tarifa | null = $derived(this.tarifaManual ?? this.tarifaAutomatica?.tarifa ?? null);

	private get datos(): DatosHogar {
		return {
			artefactos: $state.snapshot(this.artefactos),
			comunaId: this.comunaId,
			distribuidoraId: this.distribuidoraId,
			tarifaManual: $state.snapshot(this.tarifaManual),
			boleta: $state.snapshot(this.boleta)
		};
	}

	private aplicar(datos: Partial<DatosHogar>): void {
		this.artefactos = Array.isArray(datos.artefactos) ? datos.artefactos : [];
		this.comunaId = datos.comunaId ?? null;
		this.distribuidoraId = datos.distribuidoraId ?? null;
		this.tarifaManual = datos.tarifaManual ?? null;
		this.boleta = datos.boleta ?? null;
	}

	/** Lee los datos guardados. Se llama al montar la aplicación en el navegador. */
	cargar(): void {
		try {
			const texto = leerLocal(CLAVE);
			if (texto) this.aplicar(JSON.parse(texto) as Partial<DatosHogar>);
		} catch {
			// Datos dañados: se parte con un hogar vacío.
		}
		this.cargado = true;
		if (hayBaseDeDatos) void this.cargarDesdeBaseDeDatos();
	}

	/**
	 * Lee el hogar desde Supabase. Si en el navegador hay cambios sin enviar, o el hogar aún no existe
	 * en la base de datos, se envían los datos del navegador; si no, se usan los de la base de datos.
	 */
	private async cargarDesdeBaseDeDatos(): Promise<void> {
		this.token = leerLocal(CLAVE_TOKEN);
		if (!this.token) {
			this.token = nuevoToken();
			escribirLocal(CLAVE_TOKEN, this.token);
		}
		this.sincronizacion = 'cargando';
		try {
			const remoto = await leerHogar(this.token);
			const pendiente = leerLocal(CLAVE_PENDIENTE) !== null;
			if (remoto && !pendiente && !this.temporizador) {
				this.aplicar(remoto);
				escribirLocal(CLAVE, JSON.stringify(remoto));
				this.sincronizacion = 'guardado';
			} else if (!remoto && !this.tieneDatos() && !this.temporizador) {
				// Hogar nuevo y vacío: no se crea una fila hasta que haya algo que guardar.
				this.sincronizacion = 'guardado';
			} else {
				await this.enviar();
			}
		} catch (error) {
			console.error('No se pudo leer el hogar desde Supabase.', error);
			this.sincronizacion = 'error';
		}
	}

	private tieneDatos(): boolean {
		return this.artefactos.length > 0 || this.comunaId !== null || this.boleta !== null;
	}

	private async enviar(): Promise<void> {
		this.temporizador = null;
		if (!this.token) return;
		this.sincronizacion = 'guardando';
		try {
			await escribirHogar(this.token, this.datos);
			// Solo se borra la marca si no hubo otro cambio mientras se enviaba.
			if (!this.temporizador) {
				escribirLocal(CLAVE_PENDIENTE, null);
				this.sincronizacion = 'guardado';
			}
		} catch (error) {
			console.error('No se pudo guardar el hogar en Supabase.', error);
			this.sincronizacion = 'error';
		}
	}

	private guardar(): void {
		escribirLocal(CLAVE, JSON.stringify(this.datos));
		if (!hayBaseDeDatos) return;
		escribirLocal(CLAVE_PENDIENTE, '1');
		if (this.temporizador) clearTimeout(this.temporizador);
		this.temporizador = setTimeout(() => void this.enviar(), ESPERA_MS);
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

	/**
	 * Reemplaza los artefactos registrados por los de un hogar tipo. Si aún no se ha indicado una
	 * comuna, se selecciona la del hogar tipo; la comuna, la tarifa y la boleta ya ingresadas se mantienen.
	 */
	cargarHogarTipo(tipo: HogarTipo): void {
		this.artefactos = tipo.artefactos.map((a) => ({ ...a, id: nuevoId() }));
		if (this.comunaId === null && referencia.comunas.some((c) => c.id === tipo.comunaId)) {
			this.comunaId = tipo.comunaId;
			this.distribuidoraId = null;
			this.tarifaManual = null;
		}
		this.guardar();
	}

	/** Cambia la comuna; la compañía vuelve a ser la principal y la tarifa, la automática. */
	seleccionarComuna(id: string): void {
		this.comunaId = id;
		this.distribuidoraId = null;
		this.tarifaManual = null;
		this.guardar();
	}

	/** Elige otra compañía de las que atienden la comuna; la tarifa vuelve a ser la automática. */
	seleccionarDistribuidora(id: string): void {
		this.distribuidoraId = id;
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
