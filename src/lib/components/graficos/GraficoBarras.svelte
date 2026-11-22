<!--
	Gráfico de barras horizontales: consumo mensual de cada artefacto (componentes del vector E),
	ordenado de mayor a menor. Una sola serie, por eso no lleva leyenda.
-->
<script lang="ts">
	import { BarChart, Tooltip } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import { costoEnergia, porcentajes, vectorConsumo, type Tarifa } from '#lib/matematica/index.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	interface Props {
		artefactos: ArtefactoHogar[];
		tarifa: Tarifa | null;
	}

	let { artefactos, tarifa }: Props = $props();

	interface Fila {
		id: string;
		nombre: string;
		kwh: number;
		porcentaje: number;
		costo: number | null;
	}

	const filas: Fila[] = $derived.by(() => {
		const e = vectorConsumo(artefactos);
		const p = porcentajes(e);
		return artefactos
			.map((a, i) => ({
				id: a.id,
				nombre: a.nombre,
				kwh: e[i],
				porcentaje: p[i],
				costo: tarifa ? costoEnergia(e[i], tarifa) : null
			}))
			.sort((a, b) => b.kwh - a.kwh);
	});

	const nombrePorId = $derived(new Map(filas.map((f) => [f.id, f.nombre])));

	/** Acorta los nombres largos para que quepan junto al eje. */
	const acortar = (x: string) => (x.length > 16 ? `${x.slice(0, 15)}…` : x);

	// Banda de 40 px con 45 % de relleno: barras de 22 px (máximo recomendado: 24 px).
	const ALTO_BANDA = 40;
	const alto = $derived(filas.length * ALTO_BANDA + 32);

	const config = { kwh: { label: 'Consumo', color: 'var(--chart-1)' } } satisfies Chart.ChartConfig;
</script>

<Chart.Container {config} class="aspect-auto w-full" style="height: {alto}px">
	<BarChart
		data={filas}
		orientation="horizontal"
		y="id"
		x="kwh"
		bandPadding={0.45}
		highlight={{ area: false }}
		padding={{ left: 124, right: 56, bottom: 24 }}
		series={[{ key: 'kwh', label: 'Consumo', color: 'var(--chart-1)' }]}
		labels={{ placement: 'outside', format: (v: number) => formatearNumero(v) }}
		props={{
			yAxis: { format: (id: string) => acortar(nombrePorId.get(id) ?? ''), tickLabelProps: { class: 'fill-foreground' } },
			xAxis: { format: (v: number) => formatearNumero(v, 0) },
			bars: { strokeWidth: 0 }
		}}
	>
		{#snippet tooltip()}
			<Tooltip.Root variant="none">
				{#snippet children({ data })}
					{@const f = data as Fila}
					<div class="bg-background grid min-w-40 gap-1 rounded-lg border px-3 py-2 text-xs shadow-lg">
						<p class="font-medium">{f.nombre}</p>
						<p class="flex justify-between gap-4">
							<span class="text-muted-foreground">Consumo</span>
							<span class="tabular-nums">{formatearNumero(f.kwh, 2)} kWh/mes</span>
						</p>
						<p class="flex justify-between gap-4">
							<span class="text-muted-foreground">Del total</span>
							<span class="tabular-nums">{formatearNumero(f.porcentaje)} %</span>
						</p>
						{#if f.costo !== null}
							<p class="flex justify-between gap-4">
								<span class="text-muted-foreground">Costo</span>
								<span class="tabular-nums">{formatearPesos(f.costo)}</span>
							</p>
						{/if}
					</div>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</Chart.Container>
