create table public.special_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  label text not null check (length(label) between 1 and 100),
  date date not null,
  private_to uuid references auth.users on delete cascade
);

alter table public.special_dates enable row level security;

create policy "partners read shared or own special dates" on public.special_dates
  for select to authenticated
  using (
    couple_id = (select private.my_couple_id())
    and (private_to is null or private_to = (select auth.uid()))
  );

revoke all on public.special_dates from anon, authenticated;
grant select on public.special_dates to authenticated;
