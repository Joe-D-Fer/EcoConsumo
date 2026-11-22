<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import Logo from '#lib/components/Logo.svelte';
	import inacap from '#lib/assets/inacap.svg';
</script>

<svelte:head>
	<title>EcoConsumo</title>
	<meta
		name="description"
		content="Estima el consumo eléctrico y el costo de cada artefacto de tu hogar según la tarifa de tu comuna."
	/>
</svelte:head>

<!-- Portada con la identidad de la presentación: fondo oscuro, acento naranja y la hoja verde. -->
<section
	class="bg-marca-oscuro relative overflow-hidden rounded-2xl px-6 py-10 text-white sm:px-10 sm:py-14"
>
	<div
		class="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(249_140_0/0.35),transparent_70%)]"
		aria-hidden="true"
	></div>
	<div class="relative max-w-2xl space-y-5">
		<div class="flex items-center gap-3">
			<img src={inacap} alt="INACAP" class="h-7 w-auto sm:h-8" />
			<span class="h-7 w-px bg-white/40" aria-hidden="true"></span>
			<span class="text-xs leading-tight font-bold tracking-wide uppercase">Sede<br />Curicó</span>
		</div>
		<Logo class="text-3xl sm:text-4xl" />
		<p class="border-marca-naranja text-marca-naranja border-l-4 pl-3 text-sm font-semibold italic sm:text-base">
			Análisis y optimización del consumo eléctrico residencial en Chile mediante modelación matemática.
		</p>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
			¿Cuánto consume cada artefacto de tu hogar?
		</h1>
		<p class="text-lg text-white/75">
			La boleta de electricidad informa solo el consumo total del mes, y el precio del kWh cambia según la
			comuna y la compañía distribuidora. EcoConsumo estima el consumo y el costo de cada artefacto con la
			tarifa de tu comuna, para que puedas decidir dónde ahorrar.
		</p>
		<Button href="/hogar" size="lg">Registrar mis artefactos</Button>
	</div>
</section>
