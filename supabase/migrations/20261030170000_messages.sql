create table public.messages (
  id bigint generated always as identity primary key,
  couple_id uuid not null references public.couples on delete cascade,
  author_id uuid not null references auth.users on delete cascade,
  body_enc text not null,
  created_at timestamptz not null default now()
);

create index messages_couple_id_idx on public.messages (couple_id, id desc);

alter table public.messages enable row level security;

create policy "partners read their messages" on public.messages
  for select to authenticated
  using (couple_id = (select private.my_couple_id()));

create policy "partners write their messages" on public.messages
  for insert to authenticated
  with check (
    couple_id = (select private.my_couple_id())
    and author_id = (select auth.uid())
  );

revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to authenticated;
