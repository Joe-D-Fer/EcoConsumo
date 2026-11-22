<!--
	Lista desplegable con búsqueda (combobox). Se usa para elegir la comuna y para sugerir
	artefactos del catálogo.
-->
<script lang="ts" module>
	export interface OpcionBuscador {
		id: string;
		etiqueta: string;
		/** Texto secundario, por ejemplo la región o la potencia. */
		detalle?: string;
		/** Título del grupo en que se muestra la opción. */
		grupo?: string;
	}
</script>

<script lang="ts">
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	interface Props {
		opciones: OpcionBuscador[];
		seleccionadoId?: string | null;
		/** Texto del botón cuando no hay selección. */
		marcador: string;
		/** Texto del campo de búsqueda. */
		textoBusqueda: string;
		textoSinResultados: string;
		/** Identificador del botón, para asociarlo a una etiqueta. */
		id?: string;
		onSeleccionar: (id: string) => void;
	}

	let {
		opciones,
		seleccionadoId = null,
		marcador,
		textoBusqueda,
		textoSinResultados,
		id,
		onSeleccionar
	}: Props = $props();

	let abierto = $state(false);
	let boton = $state<HTMLButtonElement | null>(null);

	const seleccionado = $derived(opciones.find((o) => o.id === seleccionadoId));

	const grupos = $derived.by(() => {
		const mapa = new Map<string, OpcionBuscador[]>();
		for (const o of opciones) {
			const g = o.grupo ?? '';
			mapa.set(g, [...(mapa.get(g) ?? []), o]);
		}
		return [...mapa.entries()];
	});

	/** Quita tildes y mayúsculas para que «maipu» encuentre «Maipú». */
	const normalizar = (x: string) =>
		x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

	/** Coincidencia por contenido en la etiqueta, el detalle o el grupo (1 = mostrar, 0 = ocultar). */
	function filtrar(valor: string, busqueda: string, palabras?: string[]): number {
		const termino = normalizar(busqueda.trim());
		if (termino === '') return 1;
		return [valor, ...(palabras ?? [])].some((p) => normalizar(p).includes(termino)) ? 1 : 0;
	}

	function elegir(opcion: OpcionBuscador) {
		onSeleccionar(opcion.id);
		abierto = false;
		// Devuelve el foco al botón para seguir navegando con el teclado.
		tick().then(() => boton?.focus());
	}
</script>

<Popover.Root bind:open={abierto}>
	<Popover.Trigger bind:ref={boton}>
		{#snippet child({ props })}
			<Button
				{...props}
				{id}
				variant="outline"
				class="w-full justify-between font-normal"
				role="combobox"
				aria-expanded={abierto}
			>
				<span class="truncate" class:text-muted-foreground={!seleccionado}>
					{seleccionado?.etiqueta ?? marcador}
				</span>
				<ChevronsUpDownIcon class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) min-w-64 p-0" align="start">
		<Command.Root filter={filtrar}>
			<Command.Input placeholder={textoBusqueda} />
			<Command.List>
				<Command.Empty>{textoSinResultados}</Command.Empty>
				{#each grupos as [grupo, items] (grupo)}
					<Command.Group heading={grupo || undefined}>
						{#each items as opcion (opcion.id)}
							<Command.Item
								value={opcion.id}
								keywords={[opcion.etiqueta, opcion.detalle ?? '', grupo]}
								onSelect={() => elegir(opcion)}
								data-checked={opcion.id === seleccionadoId}
							>
								<span>{opcion.etiqueta}</span>
								{#if opcion.detalle}
									<span class="text-muted-foreground ml-auto text-xs">{opcion.detalle}</span>
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				{/each}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
