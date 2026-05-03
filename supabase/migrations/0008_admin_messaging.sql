-- Admin threads: flag conversations started by admin messaging

alter table public.conversations
  add column if not exists is_admin_thread boolean not null default false;

create index if not exists conversations_admin_thread_idx
  on public.conversations (is_admin_thread, created_at desc);
