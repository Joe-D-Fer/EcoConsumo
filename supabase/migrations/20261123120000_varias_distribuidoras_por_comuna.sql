-- =============================================================================
-- EcoConsumo: una comuna puede ser atendida por más de una compañía distribuidora
--
-- En algunas comunas el servicio se reparte entre dos o más compañías (por ejemplo, en el límite
-- entre zonas de concesión o donde opera una cooperativa eléctrica); la compañía de cada hogar
-- depende de su dirección y aparece en la boleta.
--
-- Cambios:
--   comuna_distribuidoras  nueva tabla: qué compañías atienden cada comuna y cuál es la principal
--                          (la que se selecciona automáticamente)
--   comunas                se elimina la columna distribuidora_id (pasa a comuna_distribuidoras)
--   tarifas                una tarifa vigente por comuna y distribuidora (antes, una por comuna)
--   comunas_con_tarifa     una fila por cada par comuna–distribuidora, con su tarifa propia vigente
--   hogares                nueva columna distribuidora_id: compañía elegida por la persona usuaria
--                          (nula = la principal de la comuna)
--   obtener_hogar /
--   guardar_hogar          leen y guardan el campo distribuidoraId
--
-- Los datos existentes se conservan: la distribuidora actual de cada comuna pasa a ser su principal.
-- =============================================================================

-- La vista depende de comunas.distribuidora_id; se vuelve a crear más abajo.
drop view public.comunas_con_tarifa;

-- -----------------------------------------------------------------------------
-- Compañías que atienden cada comuna
-- -----------------------------------------------------------------------------

create table public.comuna_distribuidoras (
	comuna_id        text not null references public.comunas (id) on delete cascade,
	distribuidora_id text not null references public.distribuidoras (id),
	-- La principal se selecciona automáticamente al elegir la comuna.
	principal        boolean not null default false,
	primary key (comuna_id, distribuidora_id)
);
comment on table public.comuna_distribuidoras is
	'Compañías distribuidoras que atienden cada comuna; la principal se selecciona automáticamente.';
create index comuna_distribuidoras_distribuidora_idx on public.comuna_distribuidoras (distribuidora_id);
-- A lo más una principal por comuna. Si una comuna no tiene principal, la aplicación usa la primera
-- según el orden de su identificador.
create unique index comuna_distribuidoras_principal_idx
	on public.comuna_distribuidoras (comuna_id) where principal;

insert into public.comuna_distribuidoras (comuna_id, distribuidora_id, principal)
select id, distribuidora_id, true from public.comunas;

-- -----------------------------------------------------------------------------
-- Tarifas: una por comuna y distribuidora
-- -----------------------------------------------------------------------------

alter table public.tarifas
	drop constraint tarifas_comuna_id_distribuidora_id_fkey,
	drop constraint tarifas_comuna_id_vigente_desde_key,
	-- La distribuidora debe atender la comuna. Si deja de atenderla, sus tarifas se borran.
	add constraint tarifas_comuna_distribuidora_fkey foreign key (comuna_id, distribuidora_id)
		references public.comuna_distribuidoras (comuna_id, distribuidora_id) on delete cascade,
	add constraint tarifas_comuna_distribuidora_vigencia_key
		unique (comuna_id, distribuidora_id, vigente_desde);

comment on table public.tarifas is
	'Precio de una distribuidora en una comuna. Si no tiene tarifa vigente ahí, se usa su tarifa base.';

-- Elimina también el índice comunas_distribuidora_idx y la restricción unique (id, distribuidora_id).
alter table public.comunas drop column distribuidora_id;
comment on table public.comunas is 'Comunas de Chile; las compañías que las atienden están en comuna_distribuidoras.';

-- -----------------------------------------------------------------------------
-- Vista: una fila por comuna y distribuidora
-- -----------------------------------------------------------------------------

-- precio_kwh y cargo_fijo son nulos si la distribuidora no tiene tarifa propia en la comuna.
-- Las comunas sin ninguna distribuidora no aparecen.
create view public.comunas_con_tarifa
with (security_invoker = true) as
select
	c.id,
	c.nombre,
	c.region,
	cd.distribuidora_id,
	cd.principal,
	t.precio_kwh,
	t.cargo_fijo,
	t.vigente_desde,
	t.fuente
from public.comunas c
join public.comuna_distribuidoras cd on cd.comuna_id = c.id
left join lateral (
	select t.precio_kwh, t.cargo_fijo, t.vigente_desde, t.fuente
	from public.tarifas t
	where t.comuna_id = c.id
		and t.distribuidora_id = cd.distribuidora_id
		and t.vigente_desde <= current_date
	order by t.vigente_desde desc
	limit 1
) t on true;
comment on view public.comunas_con_tarifa is
	'Cada comuna con cada distribuidora que la atiende y su tarifa propia vigente, si existe.';

-- -----------------------------------------------------------------------------
-- Hogares: compañía elegida
-- -----------------------------------------------------------------------------

alter table public.hogares
	add column distribuidora_id text,
	-- La compañía debe atender la comuna del hogar. Si deja de atenderla, el hogar vuelve a la principal.
	add constraint hogares_comuna_distribuidora_fkey foreign key (comuna_id, distribuidora_id)
		references public.comuna_distribuidoras (comuna_id, distribuidora_id)
		on delete set null (distribuidora_id);
comment on column public.hogares.distribuidora_id is
	'Compañía elegida por la persona usuaria; nula = la principal de la comuna.';

create or replace function public.obtener_hogar(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
	select jsonb_build_object(
		'comunaId', h.comuna_id,
		'distribuidoraId', h.distribuidora_id,
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

-- p_datos: { comunaId, distribuidoraId?, tarifaManual: {precioKwh, cargoFijo} | null,
--            boleta: {kwh, dias} | null,
--            artefactos: [{ id, catalogoId?, nombre, potenciaW, cantidad, horasDia, diasMes, standbyW }] }
create or replace function public.guardar_hogar(p_token uuid, p_datos jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_hogar uuid;
	v_comuna text;
	v_distribuidora text;
	v_artefactos jsonb := coalesce(p_datos -> 'artefactos', '[]'::jsonb);
begin
	if p_token is null then
		raise exception 'Falta el token del hogar.';
	end if;
	if jsonb_typeof(v_artefactos) <> 'array' or jsonb_array_length(v_artefactos) > 200 then
		raise exception 'La lista de artefactos no es válida (máximo 200).';
	end if;

	-- Una comuna desconocida (por ejemplo, de los datos de ejemplo) se guarda como nula, y una
	-- distribuidora que no atiende la comuna también (se usa la principal).
	select c.id into v_comuna from public.comunas c where c.id = p_datos ->> 'comunaId';
	select cd.distribuidora_id into v_distribuidora
	from public.comuna_distribuidoras cd
	where cd.comuna_id = v_comuna and cd.distribuidora_id = p_datos ->> 'distribuidoraId';

	insert into public.hogares as h (
		token, comuna_id, distribuidora_id, precio_kwh_manual, cargo_fijo_manual, boleta_kwh, boleta_dias
	)
	values (
		p_token,
		v_comuna,
		v_distribuidora,
		(p_datos -> 'tarifaManual' ->> 'precioKwh')::numeric,
		(p_datos -> 'tarifaManual' ->> 'cargoFijo')::numeric,
		(p_datos -> 'boleta' ->> 'kwh')::numeric,
		(p_datos -> 'boleta' ->> 'dias')::integer
	)
	on conflict (token) do update set
		comuna_id         = excluded.comuna_id,
		distribuidora_id  = excluded.distribuidora_id,
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

-- -----------------------------------------------------------------------------
-- Seguridad
-- -----------------------------------------------------------------------------

alter table public.comuna_distribuidoras enable row level security;
create policy "Lectura pública" on public.comuna_distribuidoras for select to anon, authenticated using (true);

-- La vista se volvió a crear: hay que repetir sus permisos.
revoke all on public.comuna_distribuidoras, public.comunas_con_tarifa from anon, authenticated;
grant select on public.comuna_distribuidoras, public.comunas_con_tarifa to anon, authenticated;
