<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { hogar } from '#lib/estado/hogar.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const enlaces = [
		{ href: '/', texto: 'Inicio' },
		{ href: '/hogar', texto: 'Mi hogar' },
		{ href: '/resultados', texto: 'Resultados' },
		{ href: '/simulacion', texto: 'Simulación' }
	];

	// Los datos del hogar se guardan en el navegador; se leen al montar la aplicación.
	onMount(() => hogar.cargar());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background text-foreground flex min-h-screen flex-col font-sans antialiased">
	<header class="border-b">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
			<a href="/" class="text-lg font-semibold tracking-tight">EcoConsumo</a>
			<nav aria-label="Principal">
				<ul class="flex flex-wrap gap-1">
					{#each enlaces as e (e.href)}
						<li>
							<a
								href={e.href}
								aria-current={page.url.pathname === e.href ? 'page' : undefined}
								class="hover:bg-muted aria-[current=page]:bg-muted rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap sm:px-3"
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

	<footer class="text-muted-foreground border-t">
		<p class="mx-auto max-w-6xl px-4 py-4 text-xs">
			Proyecto ABPro · MVFM01 Funciones y Matrices · INACAP
		</p>
	</footer>
</div>
