<!--
	Lista de artefactos con los datos que se pueden cambiar en la simulación. Cada cambio se compara
	con el valor registrado y se muestra el consumo antes y después.
-->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import { simulacion, type CampoSimulable } from '#lib/estado/simulacion.svelte.js';
	import { consumoMensual, costoEnergia, validarArtefacto, type Tarifa } from '#lib/matematica/index.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	interface Props {
		actuales: ArtefactoHogar[];
		simulados: ArtefactoHogar[];
		tarifa: Tarifa | null;
	}

	let { actuales, simulados, tarifa }: Props = $props();

	const campos: { campo: CampoSimulable; etiqueta: string; paso: string }[] = [
		{ campo: 'horasDia', etiqueta: 'Horas/día', paso: 'any' },
		{ campo: 'diasMes', etiqueta: 'Días/mes', paso: '1' },
		{ campo: 'potenciaW', etiqueta: 'Potencia (W)', paso: 'any' },
		{ campo: 'cantidad', etiqueta: 'Cantidad', paso: '1' },
		{ campo: 'standbyW', etiqueta: 'Standby (W)', paso: 'any' }
	];

	/** Diferencia con signo y su unidad, por ejemplo "−11,9 kWh". */
	const conSigno = (x: number, formato: (v: number) => string) =>
		`${x > 0 ? '+' : x < 0 ? '−' : ''}${formato(Math.abs(x))}`;
</script>

<ul class="divide-y">
	{#each actuales as actual, i (actual.id)}
		{@const sim = simulados[i]}
		{@const errores = validarArtefacto(sim)}
		{@const cambiado = actual.id in simulacion.cambios}
		{@const eAntes = consumoMensual(actual)}
		{@const eDespues = errores.length === 0 ? consumoMensual(sim) : eAntes}
		{@const delta = eDespues - eAntes}
		<li class="space-y-3 py-4 first:pt-0 last:pb-0">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<h3 class="font-medium">{actual.nombre}</h3>
					{#if cambiado}<Badge variant="outline">Modificado</Badge>{/if}
				</div>
				{#if cambiado}
					<Button size="sm" variant="ghost" onclick={() => simulacion.restablecerArtefacto(actual.id)}>
						<RotateCcwIcon />
						Restablecer
					</Button>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
				{#each campos as c (c.campo)}
					{@const id = `${actual.id}-${c.campo}`}
					{@const distinto = sim[c.campo] !== actual[c.campo]}
					<div class="space-y-1">
						<Label for={id} class="text-xs">{c.etiqueta}</Label>
						<Input
							{id}
							type="number"
							min="0"
							step={c.paso}
							value={sim[c.campo]}
							class={distinto ? 'border-primary' : ''}
							oninput={(e) =>
								simulacion.cambiar(actual.id, c.campo, e.currentTarget.valueAsNumber, actual[c.campo])}
						/>
						{#if distinto}
							<p class="text-muted-foreground text-xs">Registrado: {formatearNumero(actual[c.campo], 2)}</p>
						{/if}
					</div>
				{/each}
			</div>

			{#if errores.length > 0}
				<p class="text-destructive text-sm" role="alert">{errores.join(' ')}</p>
			{:else}
				<p class="text-sm">
					<span class="text-muted-foreground">Consumo:</span>
					{formatearNumero(eAntes, 2)} → <strong>{formatearNumero(eDespues, 2)} kWh/mes</strong>
					{#if delta !== 0}
						<span class="text-muted-foreground">
							({conSigno(delta, (v) => `${formatearNumero(v, 2)} kWh`)}{#if tarifa}, {conSigno(
									costoEnergia(delta, tarifa),
									formatearPesos
								)}{/if})
						</span>
					{/if}
				</p>
			{/if}
		</li>
	{/each}
</ul>
