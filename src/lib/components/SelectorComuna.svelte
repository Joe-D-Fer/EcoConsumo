<!--
	Ingreso de la comuna: selecciona automáticamente la compañía distribuidora y el precio del kWh,
	con la opción de corregir el precio a mano (por ejemplo, para usar el de la propia boleta).
-->
<script lang="ts">
	import Buscador, { type OpcionBuscador } from './Buscador.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { referencia } from '#lib/estado/referencia.svelte.js';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	const opciones: OpcionBuscador[] = $derived(
		[...referencia.comunas]
			.sort((a, b) => a.region.localeCompare(b.region, 'es') || a.nombre.localeCompare(b.nombre, 'es'))
			.map((c) => ({ id: c.id, etiqueta: c.nombre, grupo: `Región ${c.region}` }))
	);

	let corrigiendo = $state(false);
	let precio = $state<number | null>(null);
	let cargo = $state<number | null>(null);
	let error = $state('');

	function abrirCorreccion() {
		precio = hogar.tarifa?.precioKwh ?? null;
		cargo = hogar.tarifa?.cargoFijo ?? null;
		error = '';
		corrigiendo = true;
	}

	function guardarCorreccion(evento: SubmitEvent) {
		evento.preventDefault();
		const p = Number(precio ?? NaN);
		const c = Number(cargo ?? NaN);
		if (!(p > 0) || !(c >= 0)) {
			error = 'El precio debe ser mayor que 0 y el cargo fijo no puede ser negativo.';
			return;
		}
		hogar.corregirTarifa({ precioKwh: p, cargoFijo: c });
		corrigiendo = false;
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="comuna">Comuna</Label>
		<Buscador
			id="comuna"
			{opciones}
			seleccionadoId={hogar.comunaId}
			marcador="Selecciona tu comuna"
			textoBusqueda="Buscar comuna o región"
			textoSinResultados="No se encontró la comuna."
			onSeleccionar={(id) => {
				hogar.seleccionarComuna(id);
				corrigiendo = false;
			}}
		/>
	</div>

	{#if hogar.tarifaAutomatica && hogar.tarifa}
		{@const auto = hogar.tarifaAutomatica}
		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
			<dt class="text-muted-foreground">Compañía</dt>
			<dd class="font-medium">{auto.distribuidora.nombre}</dd>
			<dt class="text-muted-foreground">Precio del kWh</dt>
			<dd class="font-medium">{formatearPesos(hogar.tarifa.precioKwh)}</dd>
			<dt class="text-muted-foreground">Cargo fijo mensual</dt>
			<dd class="font-medium">{formatearPesos(hogar.tarifa.cargoFijo)}</dd>
		</dl>
		<div class="flex flex-wrap items-center gap-2">
			{#if hogar.tarifaManual}
				<Badge variant="secondary">Precio corregido a mano</Badge>
			{:else if auto.origen === 'comuna'}
				<Badge variant="outline">Precio de {auto.distribuidora.nombre} en {auto.comuna.nombre}</Badge>
			{:else}
				<Badge variant="outline">Tarifa base de {auto.distribuidora.nombre}</Badge>
			{/if}
		</div>

		{#if corrigiendo}
			<form class="space-y-3 rounded-lg border p-3" onsubmit={guardarCorreccion} novalidate>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<Label for="precio-kwh">Precio del kWh ($)</Label>
						<Input id="precio-kwh" type="number" min="0" step="any" bind:value={precio} />
					</div>
					<div class="space-y-1.5">
						<Label for="cargo-fijo">Cargo fijo ($)</Label>
						<Input id="cargo-fijo" type="number" min="0" step="any" bind:value={cargo} />
					</div>
				</div>
				{#if error}<p class="text-destructive text-sm" role="alert">{error}</p>{/if}
				<div class="flex gap-2">
					<Button type="submit" size="sm">Guardar precio</Button>
					<Button type="button" size="sm" variant="ghost" onclick={() => (corrigiendo = false)}>
						Cancelar
					</Button>
				</div>
			</form>
		{:else}
			<div class="flex flex-wrap gap-2">
				<Button size="sm" variant="outline" onclick={abrirCorreccion}>Corregir precio</Button>
				{#if hogar.tarifaManual}
					<Button size="sm" variant="ghost" onclick={() => hogar.restablecerTarifa()}>
						Usar el precio automático
						({formatearNumero(auto.tarifa.precioKwh, 0)} $/kWh)
					</Button>
				{/if}
			</div>
		{/if}
	{:else}
		<p class="text-muted-foreground text-sm">
			Al elegir la comuna se seleccionan automáticamente la compañía distribuidora y el precio del kWh.
		</p>
	{/if}
</div>
