create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

alter table public.contact_messages enable row level security;

create policy "anyone can submit contact message" on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy "admins read contact messages" on public.contact_messages
  for select to authenticated using (private.is_admin(auth.uid()));