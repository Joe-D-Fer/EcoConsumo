<!--
	Indicadores principales del hogar: consumo total (Σ Eᵢ), costo estimado de la boleta C(E) y el
	artefacto de mayor consumo.
-->
<script lang="ts">
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import {
		costoTotal,
		indiceMaximo,
		porcentajes,
		sumatoria,
		vectorConsumo,
		type Tarifa
	} from '#lib/matematica/index.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	interface Props {
		artefactos: ArtefactoHogar[];
		tarifa: Tarifa | null;
	}

	let { artefactos, tarifa }: Props = $props();

	const consumos = $derived(vectorConsumo(artefactos));
	const total = $derived(sumatoria(consumos));
	const iMax = $derived(indiceMaximo(consumos));
	const aporteMax = $derived(iMax === -1 ? 0 : porcentajes(consumos)[iMax]);
</script>

<dl class="grid gap-4 sm:grid-cols-3 [&>div]:min-w-0">
	<div class="bg-card rounded-xl border p-5">
		<dt class="text-muted-foreground text-sm">Consumo mensual del hogar</dt>
		<dd class="mt-1">
			<span class="text-4xl font-semibold tracking-tight">{formatearNumero(total)}</span>
			<span class="text-muted-foreground">kWh</span>
		</dd>
		<dd class="text-muted-foreground mt-1 text-xs">Σ Eᵢ de {artefactos.length} artefactos</dd>
	</div>

	<div class="bg-card rounded-xl border p-5">
		<dt class="text-muted-foreground text-sm">Costo estimado de la boleta</dt>
		{#if tarifa}
			<dd class="mt-1 text-4xl font-semibold tracking-tight">{formatearPesos(costoTotal(total, tarifa))}</dd>
			<dd class="text-muted-foreground mt-1 text-xs">
				C(E) = {formatearPesos(tarifa.precioKwh)} · E + {formatearPesos(tarifa.cargoFijo)}
			</dd>
		{:else}
			<dd class="mt-1 text-sm">
				<a href="/hogar" class="underline underline-offset-4">Selecciona tu comuna</a> para estimarlo.
			</dd>
		{/if}
	</div>

	<div class="bg-card rounded-xl border p-5">
		<dt class="text-muted-foreground text-sm">Mayor consumo</dt>
		{#if iMax !== -1}
			<dd class="mt-1 truncate text-2xl font-semibold tracking-tight" title={artefactos[iMax].nombre}>
				{artefactos[iMax].nombre}
			</dd>
			<dd class="text-muted-foreground mt-1 text-xs">
				{formatearNumero(consumos[iMax])} kWh al mes · {formatearNumero(aporteMax)} % del total
			</dd>
		{/if}
	</div>
</dl>
