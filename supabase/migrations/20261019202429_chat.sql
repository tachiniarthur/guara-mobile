-- Part 6 · Chat with the assistants: conversations, messages (content blocks and suggested
-- actions), attachments, the monthly AI message counter of the plan and the token usage/cost of
-- each Claude call. Mirrors chat.ts of @guara/types.
--
-- Claude is called only by the API. Own rows readable; writes through the API (service role).

create type public.assistant_id as enum (
  'capivara',
  'tamandua',
  'pacu',
  'caramelo',
  'quero_quero',
  'onca'
);
create type public.chat_role as enum ('user', 'assistant');
-- 'streaming' while the SSE reply is open; 'failed' when it broke ("não enviada").
create type public.chat_message_status as enum ('streaming', 'complete', 'failed');

-- Conversations --------------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text check (char_length(title) between 1 and 80),
  -- "Fixar no topo".
  pinned boolean not null default false,
  -- Assistant picked when starting (null = the Capivara routes).
  started_with_assistant_id public.assistant_id,
  -- Assistant that answered last, kept by a trigger.
  assistant_id public.assistant_id,
  last_message_at timestamptz,
  last_message_preview text check (char_length(last_message_preview) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- History: pinned first, then most recent.
create index conversations_user_history_idx
  on public.conversations (user_id, pinned desc, last_message_at desc nulls last);
create index conversations_title_trgm_idx
  on public.conversations using gin (title extensions.gin_trgm_ops);

create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

-- Messages -------------------------------------------------------------------------------------

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null,
  role public.chat_role not null,
  -- Who answered (assistant messages only).
  assistant_id public.assistant_id,
  status public.chat_message_status not null default 'complete',
  -- ContentBlock[] (text, budget_bar, mini_chart, position_summary).
  blocks jsonb not null check (jsonb_typeof(blocks) = 'array'),
  -- SuggestedAction[] (create_alert, create_budget, open_asset).
  actions jsonb not null default '[]' check (jsonb_typeof(actions) = 'array'),
  -- Text of the blocks, for search and for the history preview.
  plain_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete cascade,
  check ((role = 'assistant') = (assistant_id is not null)),
  check (role = 'assistant' or jsonb_array_length(actions) = 0),
  check (status = 'streaming' or jsonb_array_length(blocks) >= 1)
);

create index chat_messages_conversation_id_user_id_idx
  on public.chat_messages (conversation_id, user_id);
-- Messages newest first, cursor going back in time.
create index chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at desc, id desc);
create index chat_messages_plain_text_trgm_idx
  on public.chat_messages using gin (plain_text extensions.gin_trgm_ops);

create trigger chat_messages_updated_at before update on public.chat_messages
  for each row execute function public.set_updated_at();

-- The conversation shows its latest message and the assistant that answered last.
create or replace function public.touch_conversation_from_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'streaming' then
    return null;
  end if;
  update public.conversations
  set last_message_at = greatest(coalesce(last_message_at, new.created_at), new.created_at),
      last_message_preview = nullif(left(regexp_replace(new.plain_text, '\s+', ' ', 'g'), 160), ''),
      assistant_id = coalesce(new.assistant_id, assistant_id)
  where id = new.conversation_id
    and (last_message_at is null or new.created_at >= last_message_at);
  return null;
end;
$$;

create trigger chat_messages_touch_conversation after insert or update of status, plain_text
  on public.chat_messages
  for each row execute function public.touch_conversation_from_message();

-- Attachments ----------------------------------------------------------------------------------

-- Files sent with a message: PDF, JPG or PNG up to 10 MB, kept 30 days.
create table public.chat_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null,
  user_id uuid not null,
  name text not null check (char_length(name) between 1 and 200),
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  -- Object path in the private "chat-attachments" bucket: "<user_id>/<message_id>/<id>".
  storage_path text not null unique,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  foreign key (message_id, user_id)
    references public.chat_messages (id, user_id) on delete cascade
);

create index chat_attachments_message_id_user_id_idx
  on public.chat_attachments (message_id, user_id);
create index chat_attachments_expires_idx on public.chat_attachments (expires_at);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- Plan usage and cost --------------------------------------------------------------------------

-- Questions sent to the assistants in each São Paulo month (the plan limit counts these).
create table public.ai_usage_months (
  user_id uuid not null references public.profiles (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  messages_count integer not null default 0 check (messages_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create trigger ai_usage_months_updated_at before update on public.ai_usage_months
  for each row execute function public.set_updated_at();

-- Counts one question for the user in the current São Paulo month, if the plan allows it.
-- Atomic (one upsert), so two questions at the same time cannot pass the limit together.
-- Returns the questions left; raises plan_limit_reached when there are none.
create or replace function public.consume_ai_message(p_user_id uuid)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  current_month date := date_trunc('month', now() at time zone 'America/Sao_Paulo')::date;
  message_limit integer;
  used integer;
begin
  select p.ai_messages_per_month into message_limit
  from public.profiles pr
  join public.plans p on p.id = pr.plan_id
  where pr.id = p_user_id;

  if message_limit is null then
    raise exception 'profile % not found', p_user_id;
  end if;

  insert into public.ai_usage_months as m (user_id, month, messages_count)
  values (p_user_id, current_month, 1)
  on conflict (user_id, month) do update
    set messages_count = m.messages_count + 1
    where m.messages_count < message_limit
  returning m.messages_count into used;

  if used is null or used > message_limit then
    raise exception 'plan_limit_reached: AI messages limit is %', message_limit
      using errcode = 'P0001';
  end if;
  return message_limit - used;
end;
$$;

-- Each call to the Claude API: tokens and cost, per user and conversation. Cost in millionths
-- of a dollar (integer), never a float.
create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid,
  message_id uuid,
  assistant_id public.assistant_id not null,
  -- e.g. "claude-sonnet-5-5".
  model text not null check (char_length(model) between 1 and 80),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cost_micro_usd bigint not null default 0 check (cost_micro_usd >= 0),
  created_at timestamptz not null default now(),
  foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete set null (conversation_id),
  foreign key (message_id, user_id)
    references public.chat_messages (id, user_id) on delete set null (message_id)
);

create index ai_usage_events_user_created_idx on public.ai_usage_events (user_id, created_at);
create index ai_usage_events_conversation_id_user_id_idx
  on public.ai_usage_events (conversation_id, user_id);
create index ai_usage_events_message_id_user_id_idx
  on public.ai_usage_events (message_id, user_id);

-- Functions are not callable through the API (the NestJS API uses the service role).
revoke execute on function public.touch_conversation_from_message() from public, anon, authenticated;
revoke execute on function public.consume_ai_message(uuid) from public, anon, authenticated;

-- Row level security ---------------------------------------------------------------------------

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_attachments enable row level security;
alter table public.ai_usage_months enable row level security;
alter table public.ai_usage_events enable row level security;

create policy "own conversations are readable" on public.conversations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own chat messages are readable" on public.chat_messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own chat attachments are readable" on public.chat_attachments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own ai usage months are readable" on public.ai_usage_months
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own ai usage events are readable" on public.ai_usage_events
  for select to authenticated using ((select auth.uid()) = user_id);
