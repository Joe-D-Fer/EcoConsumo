<!--
	Tabla de los artefactos registrados con su consumo, su porcentaje del total y su costo.
	El pie muestra la sumatoria del consumo del hogar y el costo total con el cargo fijo.
-->
<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import type { ArtefactoHogar } from '#lib/estado/hogar.svelte.js';
	import {
		costoEnergia,
		costoTotal,
		porcentajes,
		sumatoria,
		vectorConsumo,
		type Tarifa
	} from '#lib/matematica/index.js';
	import { formatearNumero, formatearPesos } from '#lib/formato.js';

	interface Props {
		artefactos: ArtefactoHogar[];
		tarifa: Tarifa | null;
		editandoId?: string | null;
		onEditar: (id: string) => void;
		onEliminar: (id: string) => void;
	}

	let { artefactos, tarifa, editandoId = null, onEditar, onEliminar }: Props = $props();

	const consumos = $derived(vectorConsumo(artefactos));
	const aportes = $derived(porcentajes(consumos));
	const total = $derived(sumatoria(consumos));
</script>

{#if artefactos.length === 0}
	<p class="text-muted-foreground text-sm">
		Aún no hay artefactos. Agrega el primero con el formulario.
	</p>
{:else}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Artefacto</Table.Head>
				<Table.Head class="text-right">P (W)</Table.Head>
				<Table.Head class="text-right">n</Table.Head>
				<Table.Head class="text-right">h/día</Table.Head>
				<Table.Head class="text-right">d/mes</Table.Head>
				<Table.Head class="text-right">S (W)</Table.Head>
				<Table.Head class="text-right">E (kWh/mes)</Table.Head>
				<Table.Head class="text-right">% del total</Table.Head>
				{#if tarifa}<Table.Head class="text-right">Costo</Table.Head>{/if}
				<Table.Head><span class="sr-only">Acciones</span></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each artefactos as a, i (a.id)}
				<Table.Row data-state={a.id === editandoId ? 'selected' : undefined}>
					<Table.Cell class="font-medium">{a.nombre}</Table.Cell>
					<Table.Cell class="text-right">{formatearNumero(a.potenciaW)}</Table.Cell>
					<Table.Cell class="text-right">{a.cantidad}</Table.Cell>
					<Table.Cell class="text-right">{formatearNumero(a.horasDia, 2)}</Table.Cell>
					<Table.Cell class="text-right">{a.diasMes}</Table.Cell>
					<Table.Cell class="text-right">{formatearNumero(a.standbyW)}</Table.Cell>
					<Table.Cell class="text-right font-medium">{formatearNumero(consumos[i], 2)}</Table.Cell>
					<Table.Cell class="text-right">{formatearNumero(aportes[i])} %</Table.Cell>
					{#if tarifa}
						<Table.Cell class="text-right">{formatearPesos(costoEnergia(consumos[i], tarifa))}</Table.Cell>
					{/if}
					<Table.Cell>
						<div class="flex justify-end gap-1">
							<Button
								size="icon-sm"
								variant="ghost"
								aria-label="Editar {a.nombre}"
								onclick={() => onEditar(a.id)}
							>
								<PencilIcon />
							</Button>
							<Button
								size="icon-sm"
								variant="ghost"
								aria-label="Eliminar {a.nombre}"
								onclick={() => onEliminar(a.id)}
							>
								<Trash2Icon />
							</Button>
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
		<Table.Footer>
			<Table.Row>
				<Table.Cell colspan={6}>Total del hogar (Σ Eᵢ)</Table.Cell>
				<Table.Cell class="text-right">{formatearNumero(total, 2)}</Table.Cell>
				<Table.Cell class="text-right">100 %</Table.Cell>
				{#if tarifa}<Table.Cell class="text-right">{formatearPesos(costoEnergia(total, tarifa))}</Table.Cell>{/if}
				<Table.Cell></Table.Cell>
			</Table.Row>
		</Table.Footer>
	</Table.Root>

	{#if tarifa}
		<p class="mt-4 text-sm">
			Costo mensual estimado de la boleta, C(E) = p · E + F =
			{formatearPesos(tarifa.precioKwh)} · {formatearNumero(total, 2)} + {formatearPesos(tarifa.cargoFijo)} =
			<strong>{formatearPesos(costoTotal(total, tarifa))}</strong>
		</p>
	{:else}
		<p class="text-muted-foreground mt-4 text-sm">Selecciona tu comuna para estimar el costo.</p>
	{/if}
{/if}
