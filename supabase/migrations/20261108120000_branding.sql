alter table public.couples
  add column partner_a_name text check (char_length(partner_a_name) between 1 and 50),
  add column partner_b_name text check (char_length(partner_b_name) between 1 and 50),
  add column seed text check (seed ~ '^#[0-9a-f]{6}$');

update public.couples
set partner_a_name = 'Partenaire A', partner_b_name = 'Partenaire B', seed = '#4f6f8a';

alter table public.couples
  alter column partner_a_name set not null,
  alter column partner_b_name set not null,
  alter column seed set not null;

-- Public so PostgREST rpc sees it; execute restricted to service role below.
create function public.create_couple(
  p_user_id uuid,
  p_partner_a_name text,
  p_partner_b_name text,
  p_start_date date,
  p_seed text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  lock table public.couples in exclusive mode;
  if exists (select 1 from public.couples) then
    return null;
  end if;
  insert into public.couples (partner_a_name, partner_b_name, start_date, seed)
  values (p_partner_a_name, p_partner_b_name, p_start_date, p_seed)
  returning id into v_id;
  insert into public.couple_members (user_id, couple_id, role)
  values (p_user_id, v_id, 'partner_a');
  return v_id;
end;
$$;

revoke all on function public.create_couple(uuid, text, text, date, text) from public, anon, authenticated;
grant execute on function public.create_couple(uuid, text, text, date, text) to service_role;
