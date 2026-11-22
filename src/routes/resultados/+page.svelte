<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Indicadores from '#lib/components/graficos/Indicadores.svelte';
	import GraficoBarras from '#lib/components/graficos/GraficoBarras.svelte';
	import GraficoEvolucion from '#lib/components/graficos/GraficoEvolucion.svelte';
	import MatrizConsumo from '#lib/components/graficos/MatrizConsumo.svelte';
	import { hogar } from '#lib/estado/hogar.svelte.js';

	const anio = new Date().getFullYear();
</script>

<svelte:head>
	<title>Resultados · EcoConsumo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight">Resultados</h1>
		<p class="text-muted-foreground">Consumo y costo estimados de tu hogar.</p>
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
		<Indicadores artefactos={hogar.artefactos} tarifa={hogar.tarifa} />

		<Card.Root>
			<Card.Header>
				<Card.Title>Consumo mensual por artefacto</Card.Title>
				<Card.Description>Componentes del vector E, en kWh al mes, de mayor a menor.</Card.Description>
			</Card.Header>
			<Card.Content>
				<GraficoBarras artefactos={hogar.artefactos} tarifa={hogar.tarifa} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Evolución del consumo en {anio}</Card.Title>
				<Card.Description>
					Cada mes se calcula con sus días reales, por eso febrero consume menos que enero.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<GraficoEvolucion artefactos={hogar.artefactos} {anio} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Matriz artefactos × meses</Card.Title>
				<Card.Description>
					Mᵢⱼ = Eᵢ · Dⱼ / 30: consumo del artefacto i en el mes j, en kWh. La suma de cada columna es
					el término aⱼ de la sucesión del gráfico anterior.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<MatrizConsumo artefactos={hogar.artefactos} {anio} />
			</Card.Content>
		</Card.Root>
	{/if}
</div>
