<!--
	Comparación de la estimación con el consumo real de la boleta. La estimación mensual se lleva a
	los días del período facturado (E · D / 30) y se calcula el error relativo.
-->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import {
		calidadEstimacion,
		consumoEnPeriodo,
		consumoTotal,
		errorRelativo
	} from '#lib/matematica/index.js';
	import { formatearNumero } from '#lib/formato.js';

	let kwh = $state<number | null | undefined>(hogar.boleta?.kwh ?? null);
	let dias = $state<number | null | undefined>(hogar.boleta?.dias ?? 30);
	let error = $state('');

	function guardar(evento: SubmitEvent) {
		evento.preventDefault();
		const k = Number(kwh ?? NaN);
		const d = Number(dias ?? NaN);
		if (!(k > 0) || !Number.isInteger(d) || d < 1 || d > 62) {
			error = 'Ingresa un consumo mayor que 0 kWh y un período entre 1 y 62 días.';
			return;
		}
		error = '';
		hogar.guardarBoleta({ kwh: k, dias: d });
	}

	const resultado = $derived.by(() => {
		const b = hogar.boleta;
		if (!b) return null;
		const estimado = consumoEnPeriodo(consumoTotal(hogar.artefactos), b.dias);
		const errorPct = errorRelativo(estimado, b.kwh);
		return { estimado, real: b.kwh, dias: b.dias, errorPct, calidad: calidadEstimacion(errorPct) };
	});

	const mensajes = {
		cercana: {
			icono: CircleCheckIcon,
			titulo: 'Estimación cercana',
			texto: 'La diferencia con la boleta es de 10 % o menos.'
		},
		aceptable: {
			icono: CircleAlertIcon,
			titulo: 'Estimación aceptable',
			texto: 'La diferencia está entre 10 % y 25 %. Revisa las horas de uso de los artefactos principales.'
		},
		lejana: {
			icono: TriangleAlertIcon,
			titulo: 'Estimación lejana',
			texto:
				'La diferencia supera el 25 %. Puede faltar algún artefacto o las horas y potencias no coinciden con el uso real.'
		}
	} as const;
</script>

<div class="grid gap-6 md:grid-cols-2">
	<form class="space-y-3" onsubmit={guardar} novalidate>
		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5">
				<Label for="boleta-kwh">Consumo de la boleta (kWh)</Label>
				<Input id="boleta-kwh" type="number" min="0" step="any" bind:value={kwh} />
			</div>
			<div class="space-y-1.5">
				<Label for="boleta-dias">Días del período</Label>
				<Input id="boleta-dias" type="number" min="1" max="62" step="1" bind:value={dias} />
			</div>
		</div>
		{#if error}<p class="text-destructive text-sm" role="alert">{error}</p>{/if}
		<div class="flex flex-wrap gap-2">
			<Button type="submit" size="sm">Comparar</Button>
			{#if hogar.boleta}
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onclick={() => {
						hogar.guardarBoleta(null);
						kwh = null;
						dias = 30;
					}}
				>
					Borrar
				</Button>
			{/if}
		</div>
		<p class="text-muted-foreground text-xs">
			Se compara el escenario actual (sin simulación). La estimación mensual se lleva a los días del
			período: E · D / 30.
		</p>
	</form>

	{#if resultado}
		{@const m = mensajes[resultado.calidad]}
		<div class="space-y-3" aria-live="polite">
			<dl class="grid grid-cols-3 gap-2 text-sm">
				<div>
					<dt class="text-muted-foreground text-xs">Estimado ({resultado.dias} días)</dt>
					<dd class="font-semibold">{formatearNumero(resultado.estimado)} kWh</dd>
				</div>
				<div>
					<dt class="text-muted-foreground text-xs">Boleta</dt>
					<dd class="font-semibold">{formatearNumero(resultado.real)} kWh</dd>
				</div>
				<div>
					<dt class="text-muted-foreground text-xs">Error relativo</dt>
					<dd class="font-semibold">{formatearNumero(resultado.errorPct)} %</dd>
				</div>
			</dl>
			<p class="text-muted-foreground font-mono text-xs">
				100 · |{formatearNumero(resultado.estimado)} − {formatearNumero(resultado.real)}| / {formatearNumero(
					resultado.real
				)} = {formatearNumero(resultado.errorPct)} %
			</p>
			<div class="flex gap-2 rounded-lg border p-3 text-sm">
				<m.icono class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<div>
					<p class="font-medium">{m.titulo}</p>
					<p class="text-muted-foreground">{m.texto}</p>
				</div>
			</div>
		</div>
	{/if}
</div>
