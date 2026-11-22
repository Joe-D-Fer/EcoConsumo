<!--
	Vista de la matriz M (artefactos × meses) como mapa de calor: un solo tono naranja (color de marca), de claro
	(menor consumo) a oscuro (mayor consumo). Incluye los totales por fila y por columna.
	M = E · fᵀ, con fⱼ = Dⱼ / 30 (días del mes j sobre el mes de referencia de 30 días).
-->
<script lang="ts">
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import {
		matrizConsumo,
		mesesDelAnio,
		totalMatriz,
		totalesColumnas,
		totalesFilas
	} from '#lib/matematica/index.js';
	import { formatearNumero } from '#lib/formato.js';

	interface Props {
		artefactos: ArtefactoHogar[];
		anio: number;
	}

	let { artefactos, anio }: Props = $props();

	const periodos = $derived(mesesDelAnio(anio));
	const m = $derived(matrizConsumo(artefactos, periodos));
	const filas = $derived(totalesFilas(m));
	const columnas = $derived(totalesColumnas(m));
	const total = $derived(totalMatriz(m));
	const maximo = $derived(Math.max(0, ...m.flat()));

	/** Pasos de la escala secuencial naranja (definidos en layout.css), de claro a oscuro. */
	const PASOS = [100, 200, 300, 400, 500, 600, 700] as const;

	/**
	 * Escala secuencial continua: interpola entre los dos pasos vecinos de la escala, así los tonos
	 * intermedios conservan la saturación de la escala original.
	 */
	function mezcla(fraccion: number): string {
		const posicion = Math.min(1, Math.max(0, fraccion)) * (PASOS.length - 1);
		const k = Math.min(PASOS.length - 2, Math.floor(posicion));
		const t = Math.round((posicion - k) * 100);
		return `color-mix(in oklch, var(--mapa-calor-${PASOS[k + 1]}) ${t}%, var(--mapa-calor-${PASOS[k]}))`;
	}

	/**
	 * Color de fondo y de texto de una celda: texto blanco solo en los tonos más oscuros de la escala,
	 * donde supera en contraste al texto negro.
	 */
	function estilo(valor: number): string {
		const fraccion = maximo === 0 ? 0 : valor / maximo;
		const texto = fraccion > 0.8 ? '#ffffff' : '#0b0b0b';
		return `background-color: ${mezcla(fraccion)}; color: ${texto}`;
	}
</script>

<div class="space-y-3">
	<div class="relative w-full overflow-x-auto rounded-lg border">
		<table class="w-full border-separate border-spacing-0.5 text-xs tabular-nums">
			<caption class="sr-only">
				Matriz de consumo en kWh: una fila por artefacto y una columna por mes de {anio}
			</caption>
			<thead>
				<tr>
					<th scope="col" class="bg-background sticky left-0 px-2 py-1.5 text-left font-medium">
						Artefacto
					</th>
					{#each periodos as p (p.etiqueta)}
						<th scope="col" class="px-1.5 py-1.5 text-right font-medium">
							{p.etiqueta}
							<span class="text-muted-foreground block font-normal">{p.dias} d</span>
						</th>
					{/each}
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Σ fila</th>
				</tr>
			</thead>
			<tbody>
				{#each artefactos as a, i (a.id)}
					<tr>
						<th scope="row" class="bg-background sticky left-0 max-w-36 truncate px-2 py-1.5 text-left font-medium">
							{a.nombre}
						</th>
						{#each m[i] as valor, j (j)}
							<td class="rounded px-1.5 py-1.5 text-right" style={estilo(valor)}>
								{formatearNumero(valor)}
							</td>
						{/each}
						<td class="px-2 py-1.5 text-right font-semibold">{formatearNumero(filas[i])}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" class="bg-background sticky left-0 px-2 py-1.5 text-left font-semibold">
						Σ columna (aⱼ)
					</th>
					{#each columnas as valor, j (j)}
						<td class="px-1.5 py-1.5 text-right font-semibold">{formatearNumero(valor)}</td>
					{/each}
					<td class="px-2 py-1.5 text-right font-semibold">{formatearNumero(total)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<div class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs" aria-hidden="true">
		<span>Menor consumo</span>
		<span
			class="h-3 w-32 rounded-sm"
			style="background: linear-gradient(to right, {PASOS.map((p) => `var(--mapa-calor-${p})`).join(', ')})"
		></span>
		<span>Mayor consumo</span>
	</div>
</div>
