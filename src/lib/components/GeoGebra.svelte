<!--
	Calculadora gráfica de GeoGebra integrada con la API oficial (deployggb.js).

	A diferencia de un iframe, la API permite enviar comandos a la calculadora (`evalCommand`) y leer
	valores de vuelta (`getValue`), por eso la construcción se actualiza con los datos del hogar.
	Cada vez que cambia `escena` se borra la construcción y se vuelven a ejecutar sus comandos.
	Los objetos de `escena.observar` se observan: cuando la persona mueve un deslizador, se informan
	los nuevos valores con `onvalores`.
-->
<script lang="ts" module>
	/** Parte de la API de GeoGebra que usa EcoConsumo. */
	export interface ApiGeoGebra {
		evalCommand(comando: string): boolean;
		newConstruction(): void;
		getValue(objeto: string): number;
		setSize(ancho: number, alto: number): void;
		setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): void;
		setPerspective(perspectiva: string): void;
		registerObjectUpdateListener(objeto: string, funcion: () => void): void;
		unregisterObjectUpdateListener(objeto: string): void;
		remove(): void;
	}

	interface Applet {
		inject(contenedor: HTMLElement | string): void;
	}

	declare global {
		interface Window {
			GGBApplet?: new (parametros: Record<string, unknown>, html5: boolean) => Applet;
		}
	}

	const URL_SCRIPT = 'https://www.geogebra.org/apps/deployggb.js';
	let carga: Promise<void> | null = null;
	let contador = 0;

	/** Carga el script de GeoGebra una sola vez por visita. */
	function cargarScript(): Promise<void> {
		if (window.GGBApplet) return Promise.resolve();
		carga ??= new Promise<void>((resolver, rechazar) => {
			const script = document.createElement('script');
			script.src = URL_SCRIPT;
			script.async = true;
			script.onload = () => resolver();
			script.onerror = () => {
				carga = null;
				script.remove();
				rechazar(new Error('No se pudo cargar GeoGebra.'));
			};
			document.head.append(script);
		});
		return carga;
	}
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Escena } from '#lib/geogebra/escenas.js';

	interface Props {
		escena: Escena;
		/** Alto de la calculadora, en píxeles. */
		alto?: number;
		/** Se llama con los valores que calcula GeoGebra para los objetos de `escena.observar`. */
		onvalores?: (valores: Record<string, number>) => void;
	}

	let { escena, alto = 480, onvalores }: Props = $props();

	let contenedor: HTMLDivElement;
	let ancho = $state(0);
	let api = $state<ApiGeoGebra | null>(null);
	let estado = $state<'cargando' | 'listo' | 'error'>('cargando');
	const id = `ggb${++contador}`;
	/** Bajo este ancho se oculta la vista algebraica para dar espacio al gráfico. */
	const ANCHO_MINIMO_ALGEBRA = 640;
	let perspectiva = '';

	/** Muestra la región del plano definida por la escena. */
	function encuadrar(a: ApiGeoGebra, e: Escena): void {
		const v = e.ventana;
		a.setCoordSystem(v.xmin, v.xmax, v.ymin, v.ymax);
	}

	function leerValores(a: ApiGeoGebra, nombres: string[]): void {
		onvalores?.(Object.fromEntries(nombres.map((n) => [n, a.getValue(n)])));
	}

	/** Borra la construcción y ejecuta los comandos de la escena. */
	function construir(a: ApiGeoGebra, e: Escena): () => void {
		const nombres = e.observar;
		a.newConstruction();
		for (const comando of e.comandos) {
			// evalCommand devuelve false también en los comandos de estilo (SetColor, ZoomIn…), que no
			// crean objetos; solo se avisa si falla una definición («nombre = …»).
			if (!a.evalCommand(comando) && /^\w+(\(x\))? = /.test(comando))
				console.warn('GeoGebra no aceptó el comando:', comando);
		}
		for (const n of nombres) a.registerObjectUpdateListener(n, () => leerValores(a, nombres));
		encuadrar(a, e);
		leerValores(a, nombres);
		return () => {
			for (const n of nombres) a.unregisterObjectUpdateListener(n);
		};
	}

	onMount(() => {
		let activo = true;
		cargarScript()
			.then(() => {
				if (!activo || !window.GGBApplet) return;
				const applet = new window.GGBApplet(
					{
						id,
						// GeoGebra Clásico: la calculadora gráfica no permite Segment ni Polyline.
						appName: 'classic',
						perspective: 'AG',
						width: contenedor.clientWidth || 640,
						height: alto,
						language: 'es',
						showToolBar: false,
						showMenuBar: false,
						// Sin barra de entrada ni teclado virtual: el teclado tapaba el gráfico. Los objetos
						// siguen visibles en la vista algebraica.
						showAlgebraInput: false,
						showKeyboardOnFocus: false,
						preventFocus: true,
						showResetIcon: false,
						showZoomButtons: false,
						enableShiftDragZoom: true,
						enableRightClick: false,
						errorDialogsActive: false,
						borderRadius: 8,
						rounding: '2',
						appletOnLoad: (a: ApiGeoGebra) => {
							if (!activo) return a.remove();
							api = a;
							estado = 'listo';
						}
					},
					true
				);
				applet.inject(contenedor);
			})
			.catch(() => (estado = 'error'));

		return () => {
			activo = false;
			api?.remove();
		};
	});

	// Reconstruye cuando cambian los datos o la escena.
	$effect(() => {
		if (api) return construir(api, escena);
	});

	// Ajusta el tamaño cuando cambia el ancho del contenedor y vuelve a encuadrar la escena, porque
	// GeoGebra conserva la escala al cambiar de tamaño y la región visible quedaría recortada.
	$effect(() => {
		if (!api || ancho <= 0) return;
		const nueva = ancho < ANCHO_MINIMO_ALGEBRA ? 'G' : 'AG';
		if (nueva !== perspectiva) {
			api.setPerspective(nueva);
			perspectiva = nueva;
		}
		api.setSize(Math.floor(ancho), alto);
		encuadrar(api, untrack(() => escena));
	});
</script>

<!-- contain: inline-size evita que el ancho fijo de la calculadora ensanche la página en celular. -->
<div
	class="relative w-full overflow-hidden rounded-lg border [contain:inline-size]"
	style:height="{alto}px"
	bind:clientWidth={ancho}
>
	<div bind:this={contenedor} class="h-full w-full"></div>
	{#if estado !== 'listo'}
		<div class="bg-muted/60 text-muted-foreground absolute inset-0 grid place-items-center p-4 text-center text-sm">
			{estado === 'cargando'
				? 'Cargando GeoGebra…'
				: 'No se pudo cargar GeoGebra. Revisa tu conexión a internet; puedes copiar los comandos y pegarlos en geogebra.org/classic.'}
		</div>
	{/if}
</div>
