/**
 * Acceso a la base de datos en Supabase (esquema en `supabase/migrations/`).
 *
 * - Los datos de referencia (distribuidoras, comunas con su tarifa y catálogo) se leen de forma pública.
 * - Los datos del hogar solo se leen y guardan con las funciones `obtener_hogar` y `guardar_hogar`,
 *   que exigen el token anónimo del hogar guardado en el navegador.
 *
 * Las filas de la base de datos (snake_case) se convierten a los tipos de la aplicación (camelCase).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import { agruparComunas, type FilaComunaConTarifa } from './tarifas';
import type { ArtefactoCatalogo, Comuna, Distribuidora } from './tipos';

/** Datos de un hogar tal como se guardan (misma forma en el navegador y en la base de datos). */
export interface DatosHogar {
	artefactos: {
		id: string;
		catalogoId?: string;
		nombre: string;
		potenciaW: number;
		cantidad: number;
		horasDia: number;
		diasMes: number;
		standbyW: number;
	}[];
	comunaId: string | null;
	/** Compañía elegida en una comuna con varias; `null` = la principal. Opcional en datos antiguos. */
	distribuidoraId?: string | null;
	tarifaManual: { precioKwh: number; cargoFijo: number } | null;
	boleta: { kwh: number; dias: number } | null;
}

export interface DatosReferencia {
	distribuidoras: Distribuidora[];
	comunas: Comuna[];
	catalogo: ArtefactoCatalogo[];
}

let cliente: SupabaseClient | null = null;

/** Indica si la aplicación tiene configurada una base de datos. */
export const hayBaseDeDatos = Boolean(PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY);

function obtenerCliente(): SupabaseClient {
	if (!hayBaseDeDatos) throw new Error('Supabase no está configurado.');
	cliente ??= createClient(PUBLIC_SUPABASE_URL!, PUBLIC_SUPABASE_ANON_KEY!, {
		// No hay inicio de sesión: no se guardan sesiones de usuario.
		auth: { persistSession: false, autoRefreshToken: false }
	});
	return cliente;
}

/** Convierte un valor numérico de la base de datos (puede llegar como texto) a número. */
const num = (x: unknown): number => Number(x);

/** Lee distribuidoras, comunas con su tarifa vigente y el catálogo de artefactos. */
export async function leerReferencia(): Promise<DatosReferencia> {
	const db = obtenerCliente();
	const [d, c, a] = await Promise.all([
		db.from('distribuidoras').select('id, nombre, precio_kwh, cargo_fijo, fuente').order('nombre'),
		db
			.from('comunas_con_tarifa')
			.select('id, nombre, region, distribuidora_id, principal, precio_kwh, cargo_fijo, fuente'),
		db
			.from('catalogo_artefactos')
			.select('id, nombre, categoria, potencia_w, standby_w, horas_dia_sugeridas, dias_mes_sugeridos, fuente')
			.order('categoria')
			.order('nombre')
	]);
	const error = d.error ?? c.error ?? a.error;
	if (error) throw error;

	return {
		distribuidoras: (d.data ?? []).map((x) => ({
			id: x.id,
			nombre: x.nombre,
			tarifaBase: { precioKwh: num(x.precio_kwh), cargoFijo: num(x.cargo_fijo) },
			fuente: x.fuente ?? undefined
		})),
		comunas: agruparComunas((c.data ?? []) as FilaComunaConTarifa[]),
		catalogo: (a.data ?? []).map((x) => ({
			id: x.id,
			nombre: x.nombre,
			categoria: x.categoria,
			potenciaW: num(x.potencia_w),
			standbyW: num(x.standby_w),
			horasDiaSugeridas: num(x.horas_dia_sugeridas),
			diasMesSugeridos: num(x.dias_mes_sugeridos),
			fuente: x.fuente ?? undefined
		}))
	};
}

/** Lee los datos de un hogar, o `null` si todavía no se ha guardado. */
export async function leerHogar(token: string): Promise<DatosHogar | null> {
	const { data, error } = await obtenerCliente().rpc('obtener_hogar', { p_token: token });
	if (error) throw error;
	if (!data) return null;
	const datos = data as DatosHogar;
	return {
		comunaId: datos.comunaId ?? null,
		distribuidoraId: datos.distribuidoraId ?? null,
		tarifaManual: datos.tarifaManual
			? { precioKwh: num(datos.tarifaManual.precioKwh), cargoFijo: num(datos.tarifaManual.cargoFijo) }
			: null,
		boleta: datos.boleta ? { kwh: num(datos.boleta.kwh), dias: num(datos.boleta.dias) } : null,
		artefactos: (datos.artefactos ?? []).map((a) => ({
			id: a.id,
			catalogoId: a.catalogoId ?? undefined,
			nombre: a.nombre,
			potenciaW: num(a.potenciaW),
			cantidad: num(a.cantidad),
			horasDia: num(a.horasDia),
			diasMes: num(a.diasMes),
			standbyW: num(a.standbyW)
		}))
	};
}

/** Crea o reemplaza los datos de un hogar en la base de datos. */
export async function escribirHogar(token: string, datos: DatosHogar): Promise<void> {
	const { error } = await obtenerCliente().rpc('guardar_hogar', { p_token: token, p_datos: datos });
	if (error) throw error;
}
