<!--
	Formulario para agregar o editar un artefacto. Puede completarse desde el catálogo y muestra en
	vivo la función de consumo E = n · d · [P · h + S · (24 − h)] / 1000 con los valores ingresados.
-->
<script lang="ts">
	import Buscador, { type OpcionBuscador } from './Buscador.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { catalogo } from '#lib/datos/ejemplo.js';
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import { consumoMensual, HORAS_DIA, validarArtefacto, type Artefacto } from '#lib/matematica/index.js';
	import { formatearNumero } from '#lib/formato.js';

	interface Props {
		/** Artefacto a editar; si no se entrega, el formulario agrega uno nuevo. */
		inicial?: ArtefactoHogar | null;
		onGuardar: (artefacto: Artefacto, catalogoId?: string) => void;
		onCancelar?: () => void;
	}

	let { inicial = null, onGuardar, onCancelar }: Props = $props();

	const opcionesCatalogo: OpcionBuscador[] = catalogo.map((c) => ({
		id: c.id,
		etiqueta: c.nombre,
		detalle: `${formatearNumero(c.potenciaW, 0)} W`,
		grupo: c.categoria
	}));

	// El componente se vuelve a crear (con {#key}) al cambiar el artefacto a editar,
	// por eso basta con leer `inicial` una sola vez.
	const datos = (() => inicial)();
	let catalogoId = $state<string | undefined>(datos?.catalogoId);
	let nombre = $state(datos?.nombre ?? '');
	let potenciaW = $state<number | null>(datos?.potenciaW ?? null);
	let cantidad = $state<number | null>(datos?.cantidad ?? 1);
	let horasDia = $state<number | null>(datos?.horasDia ?? null);
	let diasMes = $state<number | null>(datos?.diasMes ?? 30);
	let standbyW = $state<number | null>(datos?.standbyW ?? 0);
	let intentado = $state(false);

	// Un campo numérico vacío queda en null o undefined; se trata como inválido (NaN).
	const numero = (x: number | null | undefined) => (x == null ? NaN : Number(x));

	const artefacto: Artefacto = $derived({
		nombre,
		potenciaW: numero(potenciaW),
		cantidad: numero(cantidad),
		horasDia: numero(horasDia),
		diasMes: numero(diasMes),
		standbyW: numero(standbyW)
	});
	const errores = $derived(validarArtefacto(artefacto));
	const valido = $derived(errores.length === 0);

	function usarCatalogo(id: string) {
		const c = catalogo.find((x) => x.id === id);
		if (!c) return;
		catalogoId = c.id;
		nombre = c.nombre;
		potenciaW = c.potenciaW;
		standbyW = c.standbyW;
		horasDia = c.horasDiaSugeridas;
		diasMes = c.diasMesSugeridos;
	}

	function reiniciar() {
		catalogoId = undefined;
		nombre = '';
		potenciaW = null;
		cantidad = 1;
		horasDia = null;
		diasMes = 30;
		standbyW = 0;
		intentado = false;
	}

	function enviar(evento: SubmitEvent) {
		evento.preventDefault();
		intentado = true;
		if (!valido) return;
		onGuardar({ ...artefacto, nombre: nombre.trim() }, catalogoId);
		if (!inicial) reiniciar();
	}
</script>

<form class="space-y-4" onsubmit={enviar} novalidate>
	<div class="space-y-2">
		<Label for="catalogo">Completar desde el catálogo (opcional)</Label>
		<Buscador
			id="catalogo"
			opciones={opcionesCatalogo}
			seleccionadoId={catalogoId}
			marcador="Elegir un artefacto típico"
			textoBusqueda="Buscar artefacto"
			textoSinResultados="No está en el catálogo; completa los datos a mano."
			onSeleccionar={usarCatalogo}
		/>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="space-y-1.5 sm:col-span-2">
			<Label for="nombre">Nombre</Label>
			<Input id="nombre" bind:value={nombre} placeholder="Por ejemplo, Refrigerador de la cocina" />
		</div>
		<div class="space-y-1.5">
			<Label for="potencia">Potencia en uso (W)</Label>
			<Input id="potencia" type="number" min="0" step="any" bind:value={potenciaW} />
		</div>
		<div class="space-y-1.5">
			<Label for="cantidad">Cantidad de unidades</Label>
			<Input id="cantidad" type="number" min="1" step="1" bind:value={cantidad} />
		</div>
		<div class="space-y-1.5">
			<Label for="horas">Horas de uso por día</Label>
			<Input id="horas" type="number" min="0" max={HORAS_DIA} step="any" bind:value={horasDia} />
		</div>
		<div class="space-y-1.5">
			<Label for="dias">Días de uso al mes (de 30)</Label>
			<Input id="dias" type="number" min="0" max="30" step="1" bind:value={diasMes} />
		</div>
		<div class="space-y-1.5 sm:col-span-2">
			<Label for="standby">Potencia en espera o standby (W)</Label>
			<Input id="standby" type="number" min="0" step="any" bind:value={standbyW} />
			<p class="text-muted-foreground text-xs">
				Lo que consume enchufado y apagado. Se cuenta en las horas del día sin uso.
			</p>
		</div>
	</div>

	<div class="bg-muted rounded-lg p-3 text-sm" aria-live="polite">
		<p class="text-muted-foreground mb-1">Consumo mensual estimado</p>
		{#if valido}
			<p class="font-mono text-xs break-words">
				E = {artefacto.cantidad} · {artefacto.diasMes} · [{formatearNumero(artefacto.potenciaW, 2)} · {formatearNumero(
					artefacto.horasDia,
					2
				)} + {formatearNumero(artefacto.standbyW, 2)} · ({HORAS_DIA} − {formatearNumero(artefacto.horasDia, 2)})] / 1000
			</p>
			<p class="mt-1 text-base font-semibold">
				{formatearNumero(consumoMensual(artefacto), 2)} kWh al mes
			</p>
		{:else}
			<p class="font-mono text-xs">E = n · d · [P · h + S · (24 − h)] / 1000</p>
		{/if}
	</div>

	{#if intentado && !valido}
		<Alert.Root variant="destructive">
			<Alert.Title>Revisa los datos del artefacto</Alert.Title>
			<Alert.Description>
				<ul class="list-disc pl-4">
					{#each errores as e (e)}<li>{e}</li>{/each}
				</ul>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button type="submit">{inicial ? 'Guardar cambios' : 'Agregar artefacto'}</Button>
		{#if inicial}
			<Button type="button" variant="ghost" onclick={() => onCancelar?.()}>Cancelar</Button>
		{/if}
	</div>
</form>
