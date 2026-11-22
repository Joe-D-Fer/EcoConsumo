<!--
	Logotipo de EcoConsumo, tomado de la portada de la presentación: casa de contorno con un enchufe
	naranja y una hoja verde, junto a la palabra «EcoConsumo» («Eco» en el color del texto y «Consumo» en
	naranja). La casa usa currentColor, por lo que el logotipo está pensado para fondos oscuros.
-->
<script lang="ts">
	interface Props {
		/** Muestra la palabra «EcoConsumo» junto al símbolo. */
		conTexto?: boolean;
		class?: string;
	}

	let { conTexto = true, class: clase = '' }: Props = $props();
</script>

<span class="inline-flex items-center gap-2 {clase}">
	<svg viewBox="0 0 64 64" class="h-[1.6em] w-[1.6em] shrink-0" aria-hidden="true">
		<g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M5 31 L32 9 L59 31" />
			<path d="M13 25 V54 H25" />
			<path d="M51 25 V54 H39" />
		</g>
		<g fill="var(--marca-naranja)">
			<!-- Enchufe como en la portada: patas hacia el techo y el cable hacia abajo. -->
			<rect x="27.5" y="15" width="3" height="8" rx="1.2" />
			<rect x="33.5" y="15" width="3" height="8" rx="1.2" />
			<rect x="25" y="22" width="14" height="13" rx="3" />
			<rect x="30.5" y="34" width="3" height="13" rx="1.5" />
		</g>
		<path d="M46 16 C46 7 52 2 61 2 C61 11 55 16 46 16 Z" fill="var(--marca-verde)" />
		<path d="M47.5 14.5 L56 6" stroke="var(--marca-oscuro)" stroke-width="1.4" stroke-linecap="round" />
	</svg>
	{#if conTexto}
		<span class="font-extrabold tracking-tight italic">
			Eco<span class="text-marca-naranja">Consumo</span>
		</span>
	{/if}
</span>
