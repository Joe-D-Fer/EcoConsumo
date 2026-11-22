<!--
	Página «GeoGebra»: las funciones, sucesiones, vectores y matrices de EcoConsumo construidas en la
	calculadora de GeoGebra con los datos del hogar. GeoGebra recalcula los resultados y la página
	los compara con los de EcoConsumo.
-->
<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import GeoGebra from '#lib/components/GeoGebra.svelte';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import { consumoTotal, mesesDelAnio } from '#lib/matematica/index.js';
	import {
		escenaConsumo,
		escenaCosto,
		escenaSucesion,
		escenaVectores,
		type Escena,
		type ModoSucesion
	} from '#lib/geogebra/escenas.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';
	import { page } from '$app/state';

	type Vista = 'costo' | 'consumo' | 'sucesion' | 'vectores';

	const vistas: { valor: Vista; texto: string }[] = [
		{ valor: 'costo', texto: 'Función de costo' },
		{ valor: 'consumo', texto: 'Función de consumo' },
		{ valor: 'sucesion', texto: 'Sucesión' },
		{ valor: 'vectores', texto: 'Vectores y matriz' }
	];

	const anio = new Date().getFullYear();
	const periodos = mesesDelAnio(anio);

	// La vista inicial puede venir en la dirección, por ejemplo /geogebra?vista=sucesion.
	const vistaInicial = page.url.searchParams.get('vista');
	let vista = $state<Vista>(
		vistas.find((v) => v.valor === vistaInicial)?.valor ?? 'costo'
	);
	let modo = $state<ModoSucesion>('mensual');
	let artefactoId = $state<string | null>(null);
	let valores = $state<Record<string, number>>({});
	let copiado = $state(false);

	const artefacto = $derived(
		hogar.artefactos.find((a) => a.id === artefactoId) ?? hogar.artefactos[0] ?? null
	);

	const escena: Escena | null = $derived.by(() => {
		if (hogar.artefactos.length === 0) return null;
		switch (vista) {
			case 'costo':
				return hogar.tarifa ? escenaCosto(hogar.tarifa, consumoTotal(hogar.artefactos)) : null;
			case 'consumo':
				return artefacto ? escenaConsumo(artefacto) : null;
			case 'sucesion':
				return escenaSucesion(hogar.artefactos, periodos, modo);
			case 'vectores':
				return escenaVectores(hogar.artefactos, periodos);
		}
	});

	/** Resultado de GeoGebra y de EcoConsumo para el objeto de control de la escena. */
	const verificacion = $derived.by(() => {
		if (!escena || !(escena.control in valores)) return null;
		const geogebra = valores[escena.control];
		const ecoconsumo = escena.esperado(valores);
		const coincide = Math.abs(geogebra - ecoconsumo) <= Math.max(1e-6, Math.abs(ecoconsumo) * 1e-4);
		return { geogebra, ecoconsumo, coincide };
	});

	function formatear(x: number): string {
		return vista === 'costo' ? formatearPesos(x) : `${formatearNumero(x, 2)} kWh`;
	}

	async function copiarComandos(): Promise<void> {
		if (!escena) return;
		try {
			await navigator.clipboard.writeText(escena.comandos.join('\n'));
			copiado = true;
			setTimeout(() => (copiado = false), 2000);
		} catch {
			copiado = false;
		}
	}
</script>

<svelte:head>
	<title>GeoGebra · EcoConsumo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight">GeoGebra</h1>
		<p class="text-muted-foreground">
			Los modelos matemáticos de tu hogar en la calculadora que usamos en clases. GeoGebra recalcula los
			resultados con tus datos y los compara con los de EcoConsumo.
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
		<ToggleGroup.Root
			type="single"
			variant="outline"
			value={vista}
			onValueChange={(v) => v && (vista = v as Vista)}
			aria-label="Modelo matemático"
			class="flex-wrap"
		>
			{#each vistas as v (v.valor)}
				<ToggleGroup.Item value={v.valor}>{v.texto}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>

		<Card.Root>
			<Card.Header>
				{#if vista === 'costo'}
					<Card.Title>Función lineal de costo: C(E) = p · E + F</Card.Title>
					<Card.Description>
						p es el precio del kWh de tu comuna y F el cargo fijo. Mueve el deslizador E para ver cuánto
						costaría la boleta con otro consumo; el punto verde es el consumo estimado de tu hogar.
					</Card.Description>
				{:else if vista === 'consumo'}
					<Card.Title>Función de consumo: E(h) = n · d · [P · h + S · (24 − h)] / 1000</Card.Title>
					<Card.Description>
						Consumo mensual de un artefacto según sus horas de uso diarias h. Es una función lineal de h
						con pendiente n · d · (P − S) / 1000: cada hora más de uso suma ese consumo al mes.
					</Card.Description>
				{:else if vista === 'sucesion'}
					<Card.Title>
						{modo === 'mensual' ? 'Sucesión aⱼ del consumo mensual' : 'Sumas parciales Sₙ = a₁ + … + aₙ'}
					</Card.Title>
					<Card.Description>
						Consumo del hogar en cada mes de {anio} (j = 1 es enero), calculado con los días reales del
						mes. En GeoGebra, Sum(a, k) suma los primeros k términos.
					</Card.Description>
				{:else}
					<Card.Title>Vectores, sumatoria y matriz</Card.Title>
					<Card.Description>
						GeoGebra recibe los vectores de potencia, horas, standby, cantidad y días, calcula el vector
						de consumo E, la sumatoria Σ Eᵢ y la matriz M = E · fᵀ (artefactos × meses). Revisa los
						objetos en la vista algebraica; el gráfico muestra las componentes de E.
					</Card.Description>
				{/if}
			</Card.Header>

			<Card.Content class="space-y-4">
				{#if vista === 'consumo'}
					<div class="flex flex-wrap items-center gap-2">
						<Label for="artefacto-ggb">Artefacto</Label>
						<select
							id="artefacto-ggb"
							class="border-input bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm focus-visible:ring-[3px] focus-visible:outline-none"
							value={artefacto?.id}
							onchange={(e) => (artefactoId = e.currentTarget.value)}
						>
							{#each hogar.artefactos as a (a.id)}
								<option value={a.id}>{a.nombre}</option>
							{/each}
						</select>
					</div>
				{:else if vista === 'sucesion'}
					<ToggleGroup.Root
						type="single"
						variant="outline"
						size="sm"
						value={modo}
						onValueChange={(v) => v && (modo = v as ModoSucesion)}
						aria-label="Vista de la sucesión"
					>
						<ToggleGroup.Item value="mensual">Por mes (aⱼ)</ToggleGroup.Item>
						<ToggleGroup.Item value="acumulado">Acumulado (Sₙ)</ToggleGroup.Item>
					</ToggleGroup.Root>
				{/if}

				{#if escena}
					<GeoGebra {escena} onvalores={(v) => (valores = v)} />

					<div class="flex flex-wrap items-center justify-between gap-3">
						{#if verificacion}
							<p class="text-sm">
								<span class="text-muted-foreground">GeoGebra:</span>
								<span class="font-medium tabular-nums">{formatear(verificacion.geogebra)}</span>
								<span class="text-muted-foreground"> · EcoConsumo:</span>
								<span class="font-medium tabular-nums">{formatear(verificacion.ecoconsumo)}</span>
								{#if verificacion.coincide}
									<Badge class="bg-chart-2 ml-1 text-white">Coinciden</Badge>
								{:else}
									<Badge variant="destructive" class="ml-1">No coinciden</Badge>
								{/if}
							</p>
						{:else}
							<span></span>
						{/if}
						<Button variant="outline" size="sm" onclick={copiarComandos}>
							{copiado ? 'Comandos copiados' : 'Copiar comandos'}
						</Button>
					</div>

					<details class="text-sm">
						<summary class="text-muted-foreground cursor-pointer">
							Ver los comandos de GeoGebra ({escena.comandos.length})
						</summary>
						<p class="text-muted-foreground mt-2">
							Puedes pegarlos en la barra de entrada de
							<a href="https://www.geogebra.org/classic" target="_blank" rel="noopener" class="underline">
								GeoGebra Clásico
							</a>
							para repetir la construcción.
						</p>
						<pre class="bg-muted mt-2 max-h-64 overflow-auto rounded-md p-3 text-xs">{escena.comandos.join(
								'\n'
							)}</pre>
					</details>
				{:else}
					<p class="text-muted-foreground text-sm">
						Selecciona tu comuna en <a href="/hogar" class="underline">Mi hogar</a> para conocer el precio
						del kWh.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
