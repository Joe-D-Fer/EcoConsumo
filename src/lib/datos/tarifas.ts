/**
 * Selección automática de la compañía y del precio a partir de la comuna
 * (requisito de la retroalimentación de la docente en la Etapa 2).
 *
 * Una comuna puede ser atendida por más de una compañía; si la persona usuaria no elige una, se usa
 * la principal (la primera). Cada distribuidora puede tener un precio distinto en cada comuna; si no
 * hay precio propio para la comuna, se usa la tarifa base de la distribuidora.
 */
import type { Comuna, Distribuidora, TarifaComuna } from './tipos';

/**
 * Resuelve la distribuidora y la tarifa de una comuna, o `null` si la comuna no existe o no tiene
 * ninguna distribuidora conocida.
 *
 * @param distribuidoraId compañía elegida; si es `null` o no atiende la comuna, se usa la principal.
 */
export function tarifaDeComuna(
	comunaId: string,
	distribuidoraId: string | null,
	comunas: Comuna[],
	distribuidoras: Distribuidora[]
): TarifaComuna | null {
	const comuna = comunas.find((c) => c.id === comunaId);
	if (!comuna) return null;
	const conocidos = comuna.servicios.filter((s) => distribuidoras.some((d) => d.id === s.distribuidoraId));
	const servicio = conocidos.find((s) => s.distribuidoraId === distribuidoraId) ?? conocidos[0];
	if (!servicio) return null;
	const distribuidora = distribuidoras.find((d) => d.id === servicio.distribuidoraId)!;
	const principal = servicio === comuna.servicios[0];
	return servicio.tarifa
		? { comuna, distribuidora, principal, tarifa: servicio.tarifa, origen: 'comuna' }
		: { comuna, distribuidora, principal, tarifa: distribuidora.tarifaBase, origen: 'base' };
}

/** Compañías que atienden una comuna, con la principal primero. */
export function distribuidorasDeComuna(comuna: Comuna, distribuidoras: Distribuidora[]): Distribuidora[] {
	return comuna.servicios.flatMap((s) => distribuidoras.find((d) => d.id === s.distribuidoraId) ?? []);
}

/** Fila de la vista `comunas_con_tarifa` de Supabase. */
export interface FilaComunaConTarifa {
	id: string;
	nombre: string;
	region: string;
	distribuidora_id: string;
	principal: boolean;
	precio_kwh: unknown;
	cargo_fijo: unknown;
	fuente: string | null;
}

/**
 * Agrupa las filas de `comunas_con_tarifa` (una por comuna y distribuidora) en comunas, con la
 * compañía principal primero y las demás por orden alfabético.
 */
export function agruparComunas(filas: FilaComunaConTarifa[]): Comuna[] {
	const comunas = new Map<string, Comuna>();
	const ordenadas = [...filas].sort(
		(a, b) => Number(b.principal) - Number(a.principal) || a.distribuidora_id.localeCompare(b.distribuidora_id)
	);
	for (const x of ordenadas) {
		let comuna = comunas.get(x.id);
		if (!comuna) {
			comuna = { id: x.id, nombre: x.nombre, region: x.region, servicios: [] };
			comunas.set(x.id, comuna);
		}
		comuna.servicios.push({
			distribuidoraId: x.distribuidora_id,
			tarifa:
				x.precio_kwh == null
					? undefined
					: { precioKwh: Number(x.precio_kwh), cargoFijo: Number(x.cargo_fijo) },
			fuente: x.fuente ?? undefined
		});
	}
	return [...comunas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
