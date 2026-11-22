<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
</script>

<svelte:head>
	<title>EcoConsumo</title>
	<meta
		name="description"
		content="Estima el consumo eléctrico y el costo de cada artefacto de tu hogar según la tarifa de tu comuna."
	/>
</svelte:head>

<section class="max-w-2xl space-y-4 py-6 sm:py-12">
	<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
		¿Cuánto consume cada artefacto de tu hogar?
	</h1>
	<p class="text-muted-foreground text-lg">
		La boleta de electricidad informa solo el consumo total del mes, y el precio del kWh cambia según la
		comuna y la compañía distribuidora. EcoConsumo estima el consumo y el costo de cada artefacto con la
		tarifa de tu comuna, para que puedas decidir dónde ahorrar.
	</p>
	<Button href="/hogar" size="lg">Registrar mis artefactos</Button>
</section>
