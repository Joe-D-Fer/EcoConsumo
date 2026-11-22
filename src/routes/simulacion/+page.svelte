<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import PlugZapIcon from '@lucide/svelte/icons/plug-zap';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import EditorSimulacion from '#lib/components/simulacion/EditorSimulacion.svelte';
	import ResumenSimulacion from '#lib/components/simulacion/ResumenSimulacion.svelte';
	import ComparacionBoleta from '#lib/components/simulacion/ComparacionBoleta.svelte';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import { simulacion } from '#lib/estado/simulacion.svelte.js';
	import { aplicarCambios, compararEscenarios, validarArtefacto } from '#lib/matematica/index.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	const simulados = $derived(aplicarCambios(hogar.artefactos, simulacion.cambios));

	// Para los totales, un artefacto con datos simulados inválidos se cuenta con sus datos registrados.
	const simuladosValidos = $derived(
		simulados.map((s, i) => (validarArtefacto(s).length === 0 ? s : hogar.artefactos[i]))
	);

	const hayStandby = $derived(simulados.some((a) => a.standbyW > 0));

	// Resumen breve para la barra inferior en pantallas angostas.
	const comparacion = $derived(
		compararEscenarios(hogar.artefactos, simuladosValidos, hogar.tarifa ?? { precioKwh: 0, cargoFijo: 0 })
	);
</script>

<svelte:head>
	<title>Simulación · EcoConsumo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight">Simulación de hábitos</h1>
		<p class="text-muted-foreground">
			Prueba cambios en el uso de tus artefactos y compara el consumo y el costo. Los datos registrados no se
			modifican.
		</p>
	</div>

	{#if !hogar.cargado}
		<p class="text-muted-foreground text-sm">Cargando…</p>
	{:else if hogar.artefactos.length === 0}
		<Card.Root>
			<Card.Content class="space-y-3">
				<p>Aún no hay artefactos registrados.</p>
				<Button href="/hogar">Registrar artefactos</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Escenario simulado</Card.Title>
					<Card.Description>Los campos destacados difieren de lo registrado.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex flex-wrap gap-2">
						<Button
							size="sm"
							variant="outline"
							disabled={!hayStandby}
							onclick={() => simulacion.quitarStandby(hogar.artefactos)}
						>
							<PlugZapIcon />
							Desenchufar todo al no usar
						</Button>
						<Button
							size="sm"
							variant="ghost"
							disabled={simulacion.cantidadCambiados === 0}
							onclick={() => simulacion.restablecer()}
						>
							<RotateCcwIcon />
							Restablecer todo
						</Button>
					</div>
					<EditorSimulacion actuales={hogar.artefactos} {simulados} tarifa={hogar.tarifa} />
				</Card.Content>
			</Card.Root>

			<Card.Root class="lg:sticky lg:top-4">
				<Card.Header>
					<Card.Title>Actual frente a simulado</Card.Title>
					<Card.Description>
						{simulacion.cantidadCambiados === 0
							? 'Sin cambios todavía.'
							: `${simulacion.cantidadCambiados} artefacto${simulacion.cantidadCambiados === 1 ? '' : 's'} con cambios.`}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<ResumenSimulacion actuales={hogar.artefactos} simulados={simuladosValidos} tarifa={hogar.tarifa} />
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Comparar con la boleta</Card.Title>
				<Card.Description>
					Ingresa el consumo de tu última boleta para ver qué tan cerca está la estimación.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<ComparacionBoleta />
			</Card.Content>
		</Card.Root>

		<!-- En celular el resumen queda al final; esta barra muestra el efecto mientras se edita. -->
		{#if simulacion.cantidadCambiados > 0}
			<div
				class="bg-background/95 sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t px-4 py-3 backdrop-blur lg:hidden"
				aria-live="polite"
			>
				<span class="text-muted-foreground text-sm">
					{comparacion.ahorroKwh >= 0 ? 'Ahorro' : 'Aumento'} mensual
				</span>
				<span class="text-right">
					<strong class="text-lg">
						{hogar.tarifa
							? formatearPesos(Math.abs(comparacion.ahorroPesos))
							: `${formatearNumero(Math.abs(comparacion.ahorroKwh))} kWh`}
					</strong>
					<span class="text-muted-foreground block text-xs">
						{formatearNumero(Math.abs(comparacion.ahorroKwh), 2)} kWh · {formatearNumero(
							Math.abs(comparacion.ahorroPorcentaje)
						)} %
					</span>
				</span>
			</div>
		{/if}
	{/if}
</div>
