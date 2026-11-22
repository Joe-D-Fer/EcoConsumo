<!--
	Comparación del escenario actual con el simulado (kWh, costo y ahorro) y gráfico del ahorro
	acumulado en 12 meses, que es la sucesión aritmética Aₙ = n · r (r = ahorro mensual).
-->
<script lang="ts">
	import { LineChart, Tooltip } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import {
		ahorroAcumulado,
		compararEscenarios,
		type Artefacto,
		type Tarifa
	} from '#lib/matematica/index.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	interface Props {
		actuales: Artefacto[];
		simulados: Artefacto[];
		tarifa: Tarifa | null;
	}

	let { actuales, simulados, tarifa }: Props = $props();

	// Sin tarifa se compara solo la energía (precio 0 y sin cargo fijo).
	const r = $derived(compararEscenarios(actuales, simulados, tarifa ?? { precioKwh: 0, cargoFijo: 0 }));
	const enPesos = $derived(tarifa !== null);
	const ahorroMensual = $derived(enPesos ? r.ahorroPesos : r.ahorroKwh);
	const formato = $derived(enPesos ? formatearPesos : (v: number) => `${formatearNumero(v)} kWh`);
	const hayCambio = $derived(Math.abs(r.ahorroKwh) > 1e-9);
	const ahorra = $derived(r.ahorroKwh > 0);

	const MESES = 12;
	interface Punto {
		n: number;
		valor: number;
	}
	const puntos: Punto[] = $derived(
		// Se grafica el valor absoluto; el título indica si es ahorro o aumento.
		ahorroAcumulado(Math.abs(ahorroMensual), MESES).map((valor, i) => ({ n: i + 1, valor }))
	);

	let ancho = $state(0);
	const angosto = $derived(ancho > 0 && ancho < 420);
	const marcas = $derived(angosto ? [1, 3, 6, 9, 12] : puntos.map((p) => p.n));

	const config = { valor: { label: 'Ahorro acumulado', color: 'var(--chart-2)' } } satisfies Chart.ChartConfig;
</script>

<div class="space-y-5">
	<dl class="grid grid-cols-2 gap-3">
		<div class="rounded-lg border p-3">
			<dt class="text-muted-foreground text-xs">Consumo al mes</dt>
			<dd class="mt-1 text-sm">
				<span class="text-muted-foreground">{formatearNumero(r.kwhActual)} →</span>
				<span class="text-lg font-semibold">{formatearNumero(r.kwhSimulado)}</span> kWh
			</dd>
		</div>
		<div class="rounded-lg border p-3">
			<dt class="text-muted-foreground text-xs">Costo de la boleta</dt>
			<dd class="mt-1 text-sm">
				{#if tarifa}
					<span class="text-muted-foreground">{formatearPesos(r.costoActual)} →</span>
					<span class="text-lg font-semibold">{formatearPesos(r.costoSimulado)}</span>
				{:else}
					<a href="/hogar" class="underline underline-offset-4">Selecciona tu comuna</a>
				{/if}
			</dd>
		</div>
		<div class="col-span-2 rounded-lg border p-4">
			<dt class="text-muted-foreground text-sm">
				{!hayCambio ? 'Ahorro mensual' : ahorra ? 'Ahorro mensual' : 'Aumento mensual'}
			</dt>
			<dd class="mt-1 text-4xl font-semibold tracking-tight">{formato(Math.abs(ahorroMensual))}</dd>
			<dd class="text-muted-foreground mt-1 text-xs">
				{#if hayCambio}
					{formatearNumero(Math.abs(r.ahorroKwh), 2)} kWh al mes, {formatearNumero(Math.abs(r.ahorroPorcentaje))} %
					{ahorra ? 'menos' : 'más'} que el consumo actual
				{:else}
					Cambia horas, días o potencia de un artefacto para ver el efecto.
				{/if}
			</dd>
		</div>
	</dl>

	{#if hayCambio}
		<div class="space-y-2">
			<h3 class="text-sm font-medium">
				{ahorra ? 'Ahorro' : 'Aumento'} acumulado en {MESES} meses: Aₙ = n · {formato(Math.abs(ahorroMensual))}
			</h3>
			<div bind:clientWidth={ancho}>
				<Chart.Container {config} class="aspect-auto h-48 w-full">
					<LineChart
						data={puntos}
						x="n"
						y="valor"
						xDomain={[0.5, MESES + 0.5]}
						yDomain={[0, null]}
						yNice
						padding={{ left: 56, right: 72, bottom: 24, top: 8 }}
						series={[{ key: 'valor', label: 'Acumulado', color: 'var(--chart-2)' }]}
						points={angosto ? false : { r: 4, class: 'stroke-background', strokeWidth: 2 }}
						props={{
							spline: { strokeWidth: 2 },
							xAxis: { ticks: marcas, format: (n: number) => `${n}` },
							yAxis: { format: (v: number) => (enPesos ? formatearPesos(v) : formatearNumero(v, 0)) },
							highlight: { points: { r: 5 } }
						}}
						annotations={[
							{
								type: 'point',
								x: MESES,
								y: puntos[MESES - 1].valor,
								r: 0,
								label: formato(puntos[MESES - 1].valor),
								labelPlacement: 'right',
								labelXOffset: 8,
								props: { label: { class: 'fill-foreground text-xs font-medium' } }
							}
						]}
					>
						{#snippet tooltip()}
							<Tooltip.Root variant="none">
								{#snippet children({ data })}
									{@const p = data as Punto}
									<div class="bg-background grid gap-1 rounded-lg border px-3 py-2 text-xs shadow-lg">
										<p class="font-medium">Mes {p.n}</p>
										<p class="flex justify-between gap-4">
											<span class="text-muted-foreground">A<sub>{p.n}</sub></span>
											<span class="tabular-nums">{formato(p.valor)}</span>
										</p>
									</div>
								{/snippet}
							</Tooltip.Root>
						{/snippet}
					</LineChart>
				</Chart.Container>
			</div>
			<p class="text-muted-foreground text-xs">Eje horizontal: meses transcurridos.</p>
		</div>
	{/if}
</div>
