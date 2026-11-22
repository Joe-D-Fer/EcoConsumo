<!--
	Hogares tipo: cada tarjeta muestra la cantidad de artefactos y su consumo mensual estimado (Σ Eᵢ),
	y al elegirla reemplaza los artefactos registrados por los del hogar tipo.
-->
<script lang="ts">
	import HouseIcon from '@lucide/svelte/icons/house';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { hogaresTipo, type HogarTipo } from '#lib/datos/hogares-tipo.js';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import { simulacion } from '#lib/estado/simulacion.svelte.js';
	import { consumoTotal } from '#lib/matematica/index.js';
	import { formatearNumero } from '#lib/formato.js';

	interface Props {
		/** Se llama después de cargar un hogar tipo. */
		onCargado?: (tipo: HogarTipo) => void;
	}

	let { onCargado }: Props = $props();

	const opciones = hogaresTipo.map((h) => ({ ...h, kwh: consumoTotal(h.artefactos) }));

	function cargar(tipo: HogarTipo) {
		const n = hogar.artefactos.length;
		if (
			n > 0 &&
			!confirm(
				`Se reemplazarán los ${n} artefactos registrados por los de «${tipo.nombre}». ¿Continuar?`
			)
		)
			return;
		hogar.cargarHogarTipo(tipo);
		// Los cambios simulados se refieren a los artefactos anteriores.
		simulacion.restablecer();
		onCargado?.(tipo);
	}
</script>

<ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
	{#each opciones as h (h.id)}
		<li>
			<button
				type="button"
				class="hover:border-primary hover:bg-accent focus-visible:ring-ring/50 flex h-full w-full flex-col gap-2 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-[3px]"
				onclick={() => cargar(h)}
			>
				<span class="flex items-center gap-2 font-medium">
					<HouseIcon class="text-primary size-4 shrink-0" aria-hidden="true" />
					{h.nombre}
				</span>
				<span class="text-muted-foreground text-sm">{h.descripcion}</span>
				<span class="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
					<span class="inline-flex items-center gap-1">
						<UsersIcon class="size-3.5" aria-hidden="true" />
						{h.personas} {h.personas === 1 ? 'persona' : 'personas'}
					</span>
					<span>{h.artefactos.length} artefactos</span>
					<span class="text-foreground font-medium">≈ {formatearNumero(h.kwh, 0)} kWh/mes</span>
				</span>
			</button>
		</li>
	{/each}
</ul>
