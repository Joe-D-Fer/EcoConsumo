<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import SelectorComuna from '#lib/components/SelectorComuna.svelte';
	import FormularioArtefacto from '#lib/components/FormularioArtefacto.svelte';
	import ListaArtefactos from '#lib/components/ListaArtefactos.svelte';
	import { SON_DATOS_DE_EJEMPLO } from '#lib/datos/ejemplo.js';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import type { Artefacto } from '#lib/matematica/index.js';
	import { tick } from 'svelte';

	let editandoId = $state<string | null>(null);
	let tarjetaFormulario = $state<HTMLElement | null>(null);

	const editando = $derived(hogar.artefactos.find((a) => a.id === editandoId) ?? null);

	function guardar(artefacto: Artefacto, catalogoId?: string) {
		if (editando) {
			hogar.actualizar(editando.id, artefacto, catalogoId);
			editandoId = null;
		} else {
			hogar.agregar(artefacto, catalogoId);
		}
	}

	async function editar(id: string) {
		editandoId = id;
		await tick();
		tarjetaFormulario?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		tarjetaFormulario?.querySelector<HTMLInputElement>('#nombre')?.focus({ preventScroll: true });
	}

	function eliminar(id: string) {
		const a = hogar.artefactos.find((x) => x.id === id);
		if (!a || !confirm(`¿Eliminar «${a.nombre}»?`)) return;
		if (editandoId === id) editandoId = null;
		hogar.eliminar(id);
	}
</script>

<svelte:head>
	<title>Mi hogar · EcoConsumo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight">Mi hogar</h1>
		<p class="text-muted-foreground">Indica tu comuna y registra los artefactos que usas.</p>
	</div>

	{#if SON_DATOS_DE_EJEMPLO}
		<Alert.Root>
			<Alert.Title>Datos de ejemplo</Alert.Title>
			<Alert.Description>
				Los precios, las comunas y el catálogo son provisorios y se reemplazarán por los datos investigados.
			</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
		<div class="space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Ubicación y tarifa</Card.Title>
					<Card.Description>El precio del kWh depende de la comuna y de la compañía.</Card.Description>
				</Card.Header>
				<Card.Content>
					<SelectorComuna />
				</Card.Content>
			</Card.Root>

			<div bind:this={tarjetaFormulario} class="scroll-mt-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>{editando ? `Editar «${editando.nombre}»` : 'Agregar artefacto'}</Card.Title>
					</Card.Header>
					<Card.Content>
						{#key editandoId}
							<FormularioArtefacto
								inicial={editando}
								onGuardar={guardar}
								onCancelar={() => (editandoId = null)}
							/>
						{/key}
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Artefactos registrados</Card.Title>
				<Card.Description>
					Consumo mensual por artefacto: E = n · d · [P · h + S · (24 − h)] / 1000
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if hogar.cargado}
					<ListaArtefactos
						artefactos={hogar.artefactos}
						tarifa={hogar.tarifa}
						{editandoId}
						onEditar={editar}
						onEliminar={eliminar}
					/>
					{#if hogar.artefactos.length > 0}
						<Button href="/resultados" variant="outline" class="mt-4">Ver gráficos y resultados</Button>
					{/if}
				{:else}
					<p class="text-muted-foreground text-sm">Cargando…</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
