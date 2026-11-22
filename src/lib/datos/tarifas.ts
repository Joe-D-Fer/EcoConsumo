/**
 * Selección automática de la compañía y del precio a partir de la comuna
 * (requisito de la retroalimentación de la docente en la Etapa 2).
 *
 * Cada distribuidora puede tener un precio distinto en cada comuna; si no hay precio propio para
 * la comuna, se usa la tarifa base de la distribuidora.
 */
import type { Comuna, Distribuidora, TarifaComuna } from './tipos';

/** Resuelve la distribuidora y la tarifa de una comuna, o `null` si la comuna no existe. */
export function tarifaDeComuna(
	comunaId: string,
	comunas: Comuna[],
	distribuidoras: Distribuidora[]
): TarifaComuna | null {
	const comuna = comunas.find((c) => c.id === comunaId);
	if (!comuna) return null;
	const distribuidora = distribuidoras.find((d) => d.id === comuna.distribuidoraId);
	if (!distribuidora) return null;
	return comuna.tarifa
		? { comuna, distribuidora, tarifa: comuna.tarifa, origen: 'comuna' }
		: { comuna, distribuidora, tarifa: distribuidora.tarifaBase, origen: 'base' };
}
