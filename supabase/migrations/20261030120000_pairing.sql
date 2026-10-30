-- Codes stored as sha256 hex, never plaintext. Service role only, no policy.
create table public.pairing_codes (
  code_hash text primary key,
  user_id uuid not null references auth.users on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null,
  primary key (key, window_start)
);

alter table public.pairing_codes enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.pairing_codes, public.rate_limits from anon, authenticated;

-- Public so PostgREST rpc sees it; execute restricted to service role below.
create function public.hit_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits int;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  delete from public.rate_limits where key = p_key and window_start < v_window;

  return v_hits <= p_max;
end;
$$;

revoke all on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;
