<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import Logo from '#lib/components/Logo.svelte';
	import inacap from '#lib/assets/inacap.svg';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import { referencia } from '#lib/estado/referencia.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const enlaces = [
		{ href: '/', texto: 'Inicio' },
		{ href: '/hogar', texto: 'Mi hogar' },
		{ href: '/resultados', texto: 'Resultados' },
		{ href: '/simulacion', texto: 'Simulación' },
		{ href: '/geogebra', texto: 'GeoGebra' }
	];

	// Al montar la aplicación se leen los datos de referencia (Supabase o ejemplo) y los del hogar.
	onMount(() => {
		void referencia.cargar();
		hogar.cargar();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background text-foreground flex min-h-screen flex-col font-sans antialiased">
	<header class="bg-marca-oscuro border-marca-naranja border-b-2 text-white">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
			<a href="/" class="text-xl" aria-label="EcoConsumo, inicio"><Logo /></a>
			<nav aria-label="Principal">
				<ul class="flex flex-wrap gap-1">
					{#each enlaces as e (e.href)}
						<li>
							<a
								href={e.href}
								aria-current={page.url.pathname === e.href ? 'page' : undefined}
								class="aria-[current=page]:text-marca-naranja rounded-md text-white/80 hover:bg-white/10 hover:text-white aria-[current=page]:bg-white/10 px-2.5 py-1.5 text-sm font-medium whitespace-nowrap sm:px-3"
							>
								{e.texto}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</header>

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
		{@render children()}
	</main>

	<footer class="bg-marca-oscuro text-white/65">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-xs">
			<img src={inacap} alt="INACAP" class="h-5 w-auto" />
			<p>Proyecto ABPro · MVFM01 Funciones y Matrices · Sede Curicó</p>
		</div>
	</footer>
</div>
