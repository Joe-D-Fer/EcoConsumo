/**
 * Variables de entorno de la aplicación (se leen desde `.env` en desarrollo y desde la configuración
 * del proyecto en Vercel). Ver `.env.example`.
 *
 * Ambas son opcionales: si faltan, la aplicación funciona con los datos de ejemplo y guarda el hogar
 * solo en el navegador.
 */
import { defineEnvVars } from '@sveltejs/kit/env';

/** Texto vacío o ausente se trata como no configurado. */
const opcional = (valor: string | undefined) => (valor?.trim() ? valor.trim() : undefined);

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		static: true,
		schema: opcional,
		description: 'URL del proyecto de Supabase, por ejemplo https://xxxx.supabase.co'
	},
	PUBLIC_SUPABASE_ANON_KEY: {
		public: true,
		static: true,
		schema: opcional,
		description: 'Clave pública (anon / publishable) del proyecto de Supabase'
	}
});
