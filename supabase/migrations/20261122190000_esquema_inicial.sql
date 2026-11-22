-- =============================================================================
-- EcoConsumo: esquema inicial de la base de datos (Supabase / PostgreSQL)
--
-- Datos de referencia (solo lectura para el público):
--   distribuidoras        compañías distribuidoras y su tarifa base
--   comunas               comunas y la distribuidora que las atiende
--   tarifas               precio de una distribuidora en una comuna, con vigencia
--   catalogo_artefactos   artefactos típicos con potencia y standby sugeridos
--
-- Datos de cada hogar (sin inicio de sesión):
--   hogares               un hogar anónimo, identificado por un token secreto que se guarda
--                         en el navegador
--   artefactos_hogar      artefactos registrados en un hogar
--
-- El público no accede directamente a las tablas de hogares: solo a través de las funciones
-- obtener_hogar(token) y guardar_hogar(token, datos), que exigen conocer el token.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Datos de referencia
-- -----------------------------------------------------------------------------

create table public.distribuidoras (
	id             text primary key check (id ~ '^[a-z0-9-]+$'),
	nombre         text not null check (length(trim(nombre)) > 0),
	-- Tarifa base: se usa en las comunas sin tarifa propia.
	precio_kwh     numeric not null check (precio_kwh > 0),
	cargo_fijo     numeric not null default 0 check (cargo_fijo >= 0),
	-- Referencia de la fuente (APA 7). Vacía = dato provisorio.
	fuente         text,
	actualizado_en timestamptz not null default now()
);
comment on table public.distribuidoras is 'Compañías distribuidoras de electricidad y su tarifa base.';
comment on column public.distribuidoras.precio_kwh is 'Precio base de la energía, en pesos chilenos por kWh.';
comment on column public.distribuidoras.cargo_fijo is 'Cargo fijo mensual base, en pesos chilenos.';

create table public.comunas (
	id               text primary key check (id ~ '^[a-z0-9-]+$'),
	nombre           text not null check (length(trim(nombre)) > 0),
	region           text not null check (length(trim(region)) > 0),
	distribuidora_id text not null references public.distribuidoras (id),
	-- Permite que tarifas exija que la distribuidora sea la que atiende la comuna.
	unique (id, distribuidora_id)
);
comment on table public.comunas is 'Comunas de Chile y la compañía distribuidora que las atiende.';
create index comunas_distribuidora_idx on public.comunas (distribuidora_id);

create table public.tarifas (
	id               bigint generated always as identity primary key,
	comuna_id        text not null,
	distribuidora_id text not null,
	precio_kwh       numeric not null check (precio_kwh > 0),
	cargo_fijo       numeric not null default 0 check (cargo_fijo >= 0),
	vigente_desde    date not null default current_date,
	fuente           text,
	-- La distribuidora debe ser la que atiende la comuna. Si la comuna cambia de compañía,
	-- primero hay que borrar o corregir sus tarifas.
	foreign key (comuna_id, distribuidora_id)
		references public.comunas (id, distribuidora_id) on delete cascade,
	unique (comuna_id, vigente_desde)
);
comment on table public.tarifas is
	'Precio de la distribuidora en una comuna. Si una comuna no tiene tarifa vigente, se usa la tarifa base de su distribuidora.';

create table public.catalogo_artefactos (
	id                  text primary key check (id ~ '^[a-z0-9-]+$'),
	nombre              text not null check (length(trim(nombre)) > 0),
	categoria           text not null check (length(trim(categoria)) > 0),
	potencia_w          numeric not null check (potencia_w > 0),
	standby_w           numeric not null default 0 check (standby_w >= 0),
	horas_dia_sugeridas numeric not null check (horas_dia_sugeridas between 0 and 24),
	dias_mes_sugeridos  numeric not null check (dias_mes_sugeridos between 0 and 30),
	fuente              text
);
comment on table public.catalogo_artefactos is 'Artefactos domésticos típicos, para sugerir valores en el formulario.';

-- Comunas con su tarifa propia vigente (precio_kwh y cargo_fijo nulos si no tiene).
-- security_invoker: la vista respeta los permisos de quien consulta.
create view public.comunas_con_tarifa
with (security_invoker = true) as
select
	c.id,
	c.nombre,
	c.region,
	c.distribuidora_id,
	t.precio_kwh,
	t.cargo_fijo,
	t.vigente_desde,
	t.fuente
from public.comunas c
left join lateral (
	select t.precio_kwh, t.cargo_fijo, t.vigente_desde, t.fuente
	from public.tarifas t
	where t.comuna_id = c.id
		and t.distribuidora_id = c.distribuidora_id
		and t.vigente_desde <= current_date
	order by t.vigente_desde desc
	limit 1
) t on true;
comment on view public.comunas_con_tarifa is 'Comunas con la tarifa propia vigente de su distribuidora, si existe.';

-- -----------------------------------------------------------------------------
-- Datos de cada hogar
-- -----------------------------------------------------------------------------

create table public.hogares (
	id                uuid primary key default gen_random_uuid(),
	-- Secreto guardado en el navegador; quien lo conoce puede leer y modificar el hogar.
	token             uuid not null unique,
	comuna_id         text references public.comunas (id) on delete set null,
	-- Tarifa corregida a mano (ambos valores o ninguno).
	precio_kwh_manual numeric check (precio_kwh_manual > 0),
	cargo_fijo_manual numeric check (cargo_fijo_manual >= 0),
	-- Boleta real para comparar con la estimación (ambos valores o ninguno).
	boleta_kwh        numeric check (boleta_kwh >= 0),
	boleta_dias       integer check (boleta_dias between 1 and 62),
	creado_en         timestamptz not null default now(),
	actualizado_en    timestamptz not null default now(),
	check ((precio_kwh_manual is null) = (cargo_fijo_manual is null)),
	check ((boleta_kwh is null) = (boleta_dias is null))
);
comment on table public.hogares is 'Hogar anónimo; no requiere inicio de sesión.';

create table public.artefactos_hogar (
	hogar_id    uuid not null references public.hogares (id) on delete cascade,
	-- Identificador generado en el navegador.
	id          text not null check (length(id) between 1 and 64),
	orden       integer not null default 0,
	catalogo_id text references public.catalogo_artefactos (id) on delete set null,
	nombre      text not null check (length(trim(nombre)) between 1 and 100),
	-- Mismas reglas que validarArtefacto() en src/lib/matematica/funciones.ts.
	potencia_w  numeric not null check (potencia_w > 0),
	cantidad    integer not null check (cantidad >= 1),
	horas_dia   numeric not null check (horas_dia between 0 and 24),
	dias_mes    numeric not null check (dias_mes between 0 and 30),
	standby_w   numeric not null default 0 check (standby_w >= 0),
	primary key (hogar_id, id)
);
comment on table public.artefactos_hogar is 'Artefactos registrados en un hogar.';
create index artefactos_hogar_catalogo_idx on public.artefactos_hogar (catalogo_id);

-- -----------------------------------------------------------------------------
-- Funciones de acceso a un hogar
-- -----------------------------------------------------------------------------

-- Devuelve los datos de un hogar con la misma forma que usa la aplicación, o null si no existe.
create function public.obtener_hogar(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
	select jsonb_build_object(
		'comunaId', h.comuna_id,
		'tarifaManual', case when h.precio_kwh_manual is null then null else jsonb_build_object(
			'precioKwh', h.precio_kwh_manual, 'cargoFijo', h.cargo_fijo_manual) end,
		'boleta', case when h.boleta_kwh is null then null else jsonb_build_object(
			'kwh', h.boleta_kwh, 'dias', h.boleta_dias) end,
		'artefactos', coalesce((
			select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
				'id', a.id,
				'catalogoId', a.catalogo_id,
				'nombre', a.nombre,
				'potenciaW', a.potencia_w,
				'cantidad', a.cantidad,
				'horasDia', a.horas_dia,
				'diasMes', a.dias_mes,
				'standbyW', a.standby_w
			)) order by a.orden)
			from public.artefactos_hogar a
			where a.hogar_id = h.id
		), '[]'::jsonb)
	)
	from public.hogares h
	where h.token = p_token;
$$;

-- Crea o reemplaza los datos de un hogar en una sola transacción.
-- p_datos: { comunaId, tarifaManual: {precioKwh, cargoFijo} | null, boleta: {kwh, dias} | null,
--            artefactos: [{ id, catalogoId?, nombre, potenciaW, cantidad, horasDia, diasMes, standbyW }] }
create function public.guardar_hogar(p_token uuid, p_datos jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_hogar uuid;
	v_artefactos jsonb := coalesce(p_datos -> 'artefactos', '[]'::jsonb);
begin
	if p_token is null then
		raise exception 'Falta el token del hogar.';
	end if;
	if jsonb_typeof(v_artefactos) <> 'array' or jsonb_array_length(v_artefactos) > 200 then
		raise exception 'La lista de artefactos no es válida (máximo 200).';
	end if;

	insert into public.hogares as h (
		token, comuna_id, precio_kwh_manual, cargo_fijo_manual, boleta_kwh, boleta_dias
	)
	values (
		p_token,
		-- Una comuna desconocida (por ejemplo, de los datos de ejemplo) se guarda como nula.
		(select c.id from public.comunas c where c.id = p_datos ->> 'comunaId'),
		(p_datos -> 'tarifaManual' ->> 'precioKwh')::numeric,
		(p_datos -> 'tarifaManual' ->> 'cargoFijo')::numeric,
		(p_datos -> 'boleta' ->> 'kwh')::numeric,
		(p_datos -> 'boleta' ->> 'dias')::integer
	)
	on conflict (token) do update set
		comuna_id         = excluded.comuna_id,
		precio_kwh_manual = excluded.precio_kwh_manual,
		cargo_fijo_manual = excluded.cargo_fijo_manual,
		boleta_kwh        = excluded.boleta_kwh,
		boleta_dias       = excluded.boleta_dias,
		actualizado_en    = now()
	returning h.id into v_hogar;

	delete from public.artefactos_hogar where hogar_id = v_hogar;

	insert into public.artefactos_hogar (
		hogar_id, id, orden, catalogo_id, nombre, potencia_w, cantidad, horas_dia, dias_mes, standby_w
	)
	select
		v_hogar,
		a.elemento ->> 'id',
		a.orden - 1,
		(select c.id from public.catalogo_artefactos c where c.id = a.elemento ->> 'catalogoId'),
		a.elemento ->> 'nombre',
		(a.elemento ->> 'potenciaW')::numeric,
		(a.elemento ->> 'cantidad')::integer,
		(a.elemento ->> 'horasDia')::numeric,
		(a.elemento ->> 'diasMes')::numeric,
		coalesce((a.elemento ->> 'standbyW')::numeric, 0)
	from jsonb_array_elements(v_artefactos) with ordinality as a (elemento, orden);
end;
$$;

-- Borra un hogar y sus artefactos.
create function public.eliminar_hogar(p_token uuid)
returns void
language sql
security definer
set search_path = ''
as $$
	delete from public.hogares where token = p_token;
$$;

-- -----------------------------------------------------------------------------
-- Seguridad: Row Level Security y permisos
-- -----------------------------------------------------------------------------

alter table public.distribuidoras      enable row level security;
alter table public.comunas             enable row level security;
alter table public.tarifas             enable row level security;
alter table public.catalogo_artefactos enable row level security;
alter table public.hogares             enable row level security;
alter table public.artefactos_hogar    enable row level security;

-- Datos de referencia: lectura pública; solo se modifican desde el panel de Supabase.
create policy "Lectura pública" on public.distribuidoras      for select to anon, authenticated using (true);
create policy "Lectura pública" on public.comunas             for select to anon, authenticated using (true);
create policy "Lectura pública" on public.tarifas             for select to anon, authenticated using (true);
create policy "Lectura pública" on public.catalogo_artefactos for select to anon, authenticated using (true);

revoke all on public.distribuidoras, public.comunas, public.tarifas, public.catalogo_artefactos,
	public.comunas_con_tarifa from anon, authenticated;
grant select on public.distribuidoras, public.comunas, public.tarifas, public.catalogo_artefactos,
	public.comunas_con_tarifa to anon, authenticated;

-- Hogares: sin políticas ni permisos directos; solo mediante las funciones.
revoke all on public.hogares, public.artefactos_hogar from anon, authenticated;

revoke execute on function public.obtener_hogar(uuid), public.guardar_hogar(uuid, jsonb),
	public.eliminar_hogar(uuid) from public;
grant execute on function public.obtener_hogar(uuid), public.guardar_hogar(uuid, jsonb),
	public.eliminar_hogar(uuid) to anon, authenticated;
