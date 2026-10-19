create table public.couples (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  time_zone text not null default 'Europe/Paris',
  created_at timestamptz not null default now()
);

create type public.partner_role as enum ('partner_a', 'partner_b');

create table public.couple_members (
  user_id uuid primary key references auth.users on delete cascade,
  couple_id uuid not null references public.couples on delete cascade,
  role public.partner_role not null,
  unique (couple_id, role)
);

-- Security definer in a non-exposed schema: reading couple_members
-- from its own policy would recurse through RLS.
create schema if not exists private;

create function private.my_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select couple_id from public.couple_members where user_id = (select auth.uid())
$$;

revoke all on function private.my_couple_id() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.my_couple_id() to authenticated;

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;

create policy "partners read their couple" on public.couples
  for select to authenticated
  using (id = (select private.my_couple_id()));

create policy "partners read their couple members" on public.couple_members
  for select to authenticated
  using (couple_id = (select private.my_couple_id()));

revoke all on public.couples, public.couple_members from anon, authenticated;
grant select on public.couples, public.couple_members to authenticated;
