<!--
	Gráfico de líneas de la evolución del consumo durante un año.
	- Por mes: sucesión aⱼ = Σᵢ Mᵢⱼ (consumo del hogar en cada mes, según sus días).
	- Acumulado: sucesión de sumas parciales Sₙ = a₁ + … + aₙ.
	Una sola serie por vista, por eso no lleva leyenda.
-->
<script lang="ts">
	import { LineChart, Tooltip } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import { mesesDelAnio, sucesionConsumo, sumasParciales } from '#lib/matematica/index.js';
	import { formatearNumero } from '#lib/formato.js';

	interface Props {
		artefactos: ArtefactoHogar[];
		anio: number;
	}

	let { artefactos, anio }: Props = $props();

	type Modo = 'mensual' | 'acumulado';
	let modo = $state<Modo>('mensual');

	interface Punto {
		fecha: Date;
		etiqueta: string;
		n: number;
		mensual: number;
		acumulado: number;
	}

	const puntos: Punto[] = $derived.by(() => {
		const periodos = mesesDelAnio(anio);
		const a = sucesionConsumo(artefactos, periodos);
		const s = sumasParciales(a);
		return periodos.map((p, j) => ({
			// Mitad de mes: deja margen a ambos lados del eje x.
			fecha: new Date(anio, j, 15),
			etiqueta: `${p.etiqueta} ${anio}`,
			n: j + 1,
			mensual: a[j],
			acumulado: s[j]
		}));
	});

	const ultimo = $derived(puntos.at(-1));

	// En pantallas angostas: un rótulo cada tres meses y sin marcadores, para que no se encimen.
	let ancho = $state(0);
	const angosto = $derived(ancho > 0 && ancho < 520);
	const marcas = $derived(angosto ? puntos.filter((_, j) => j % 3 === 0) : puntos);
	const config = {
		mensual: { label: 'Consumo del mes', color: 'var(--chart-1)' },
		acumulado: { label: 'Consumo acumulado', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<p class="text-muted-foreground text-sm">
			{#if modo === 'mensual'}
				Sucesión aⱼ: consumo del hogar en cada mes (kWh)
			{:else}
				Sumas parciales Sₙ = a₁ + … + aₙ (kWh)
			{/if}
		</p>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			value={modo}
			onValueChange={(v) => v && (modo = v as Modo)}
			aria-label="Vista del gráfico"
		>
			<ToggleGroup.Item value="mensual">Por mes</ToggleGroup.Item>
			<ToggleGroup.Item value="acumulado">Acumulado</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>

	<div bind:clientWidth={ancho}>
		<Chart.Container {config} class="aspect-auto h-64 w-full">
			<LineChart
				data={puntos}
				x="fecha"
				y={modo}
				xDomain={[new Date(anio, 0, 1), new Date(anio, 11, 31)]}
				yDomain={[0, null]}
				yNice
				padding={{ left: 48, right: 64, bottom: 24, top: 8 }}
				series={[{ key: modo, label: config[modo].label, color: 'var(--chart-1)' }]}
				points={angosto ? false : { r: 4, class: 'stroke-background', strokeWidth: 2 }}
				props={{
					spline: { strokeWidth: 2, class: 'stroke-linecap-round stroke-linejoin-round' },
					xAxis: {
						ticks: marcas.map((p) => p.fecha),
						format: (d: Date) => mesesDelAnio(anio)[d.getMonth()].etiqueta
					},
					yAxis: { format: (v: number) => formatearNumero(v, 0) },
					highlight: { points: { r: 5 } }
				}}
				annotations={ultimo
					? [
							{
								type: 'point',
								x: ultimo.fecha,
								y: ultimo[modo],
								r: 0,
								label: `${formatearNumero(ultimo[modo], 0)} kWh`,
								labelPlacement: 'right',
								labelXOffset: 8,
								props: { label: { class: 'fill-foreground text-xs font-medium' } }
							}
						]
					: []}
			>
				{#snippet tooltip()}
					<Tooltip.Root variant="none">
						{#snippet children({ data })}
							{@const p = data as Punto}
							<div class="bg-background grid min-w-44 gap-1 rounded-lg border px-3 py-2 text-xs shadow-lg">
								<p class="font-medium">{p.etiqueta}</p>
								<p class="flex justify-between gap-4">
									<span class="text-muted-foreground">a<sub>{p.n}</sub> del mes</span>
									<span class="tabular-nums">{formatearNumero(p.mensual, 2)} kWh</span>
								</p>
								<p class="flex justify-between gap-4">
									<span class="text-muted-foreground">S<sub>{p.n}</sub> acumulado</span>
									<span class="tabular-nums">{formatearNumero(p.acumulado, 2)} kWh</span>
								</p>
							</div>
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</LineChart>
		</Chart.Container>
	</div>
</div>
