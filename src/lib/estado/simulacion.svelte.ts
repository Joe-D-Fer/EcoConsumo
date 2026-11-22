/**
 * Estado de la simulación de cambios de hábitos.
 *
 * Guarda solo las diferencias respecto de los artefactos registrados, en memoria: los datos del
 * hogar no se modifican y la simulación se reinicia al recargar la página.
 */
import type { CambiosArtefacto } from '#lib/matematica/index.js';

export type CampoSimulable = keyof Required<CambiosArtefacto>;

export class EstadoSimulacion {
	cambios = $state<Record<string, CambiosArtefacto>>({});

	/** Cantidad de artefactos con al menos un cambio. */
	cantidadCambiados = $derived(Object.keys(this.cambios).length);

	/** Cambia un dato de un artefacto; si vuelve al valor original, se descarta el cambio. */
	cambiar(id: string, campo: CampoSimulable, valor: number, original: number): void {
		const actuales = { ...this.cambios[id] };
		if (valor === original) delete actuales[campo];
		else actuales[campo] = valor;

		const { [id]: _, ...resto } = this.cambios;
		this.cambios = Object.keys(actuales).length > 0 ? { ...resto, [id]: actuales } : resto;
	}

	/** Simula desenchufar los artefactos indicados cuando no se usan (standby = 0 W). */
	quitarStandby(artefactos: { id: string; standbyW: number }[]): void {
		for (const a of artefactos) {
			if (a.standbyW > 0) this.cambiar(a.id, 'standbyW', 0, a.standbyW);
		}
	}

	restablecerArtefacto(id: string): void {
		const { [id]: _, ...resto } = this.cambios;
		this.cambios = resto;
	}

	restablecer(): void {
		this.cambios = {};
	}
}

export const simulacion = new EstadoSimulacion();
