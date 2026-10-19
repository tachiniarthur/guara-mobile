-- Part 3 · Spending and warnings: caps (tetos) with their monthly history and sent warnings,
-- detected subscriptions, unusual purchases, the in-app inbox with per-channel delivery,
-- push devices and report exports. Mirrors budget.ts, subscription.ts, unusual.ts,
-- notification.ts and report.ts of @guara/types.
--
-- Writes come from the NestJS API and the workers (service role). Signed-in users can only read
-- their own rows. Idempotency lives in unique keys, so a retried job never warns twice.

create type public.notification_channel as enum ('push', 'email');
create type public.billing_cycle as enum ('weekly', 'monthly', 'quarterly', 'yearly');
create type public.subscription_status as enum ('active', 'not_subscription');
create type public.unusual_reason as enum (
  'unusual_amount',
  'unusual_time',
  'unusual_location',
  'new_category'
);
create type public.unusual_status as enum ('pending', 'acknowledged', 'reported');
create type public.delivery_status as enum ('queued', 'sent', 'failed', 'skipped');
create type public.device_platform as enum ('ios', 'android');
create type public.export_format as enum ('pdf', 'xlsx', 'csv');
create type public.export_status as enum ('queued', 'processing', 'ready', 'sent', 'failed');

-- Shared checks --------------------------------------------------------------------------------

-- Cap warnings: up to 3, strictly ascending, positive and below the cap.
create or replace function public.budget_warnings_are_valid(warnings bigint[], cap bigint)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(cardinality(warnings), 0) <= 3
    and not exists (
      select 1
      from unnest(warnings) with ordinality as w (amount, position)
      where w.amount is null
        or w.amount <= 0
        or w.amount >= cap
        or (w.position > 1 and w.amount <= warnings[w.position - 1])
    );
$$;

-- At least one channel, none repeated.
create or replace function public.notification_channels_are_valid(
  channels public.notification_channel[]
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(cardinality(channels), 0) >= 1
    and cardinality(channels) = (select count(distinct c) from unnest(channels) as c)
    and array_position(channels, null) is null;
$$;

-- Caps -----------------------------------------------------------------------------------------

-- One monthly cap per category; it starts over on day 1 (São Paulo).
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null references public.categories (id),
  limit_cents bigint not null check (limit_cents > 0),
  warnings_cents bigint[] not null default '{}',
  channels public.notification_channel[] not null default '{push,email}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id),
  unique (id, user_id),
  check (public.budget_warnings_are_valid(warnings_cents, limit_cents)),
  check (public.notification_channels_are_valid(channels))
);

create index budgets_category_id_idx on public.budgets (category_id);

create trigger budgets_updated_at before update on public.budgets
  for each row execute function public.set_updated_at();

-- The cap as it was in each month, for the history ("limit of that month"). The API upserts the
-- current month when a cap is created or changed; the worker opens each new month.
create table public.budget_months (
  budget_id uuid not null,
  user_id uuid not null,
  -- First day of the São Paulo month.
  month date not null check (extract(day from month) = 1),
  limit_cents bigint not null check (limit_cents > 0),
  warnings_cents bigint[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (budget_id, month),
  foreign key (budget_id, user_id) references public.budgets (id, user_id) on delete cascade,
  check (public.budget_warnings_are_valid(warnings_cents, limit_cents))
);

create index budget_months_budget_id_user_id_idx on public.budget_months (budget_id, user_id);
create index budget_months_user_month_idx on public.budget_months (user_id, month);

create trigger budget_months_updated_at before update on public.budget_months
  for each row execute function public.set_updated_at();

-- Each warning sent (the cap itself included). One row per cap, month and amount: the worker
-- inserts with "on conflict do nothing" and only notifies when the row is new.
create table public.budget_notices (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null,
  user_id uuid not null,
  month date not null check (extract(day from month) = 1),
  amount_cents bigint not null check (amount_cents > 0),
  -- true when amount_cents is the cap ("passou do teto").
  is_limit boolean not null,
  channels public.notification_channel[] not null,
  sent_at timestamptz not null default now(),
  unique (budget_id, month, amount_cents),
  foreign key (budget_id, user_id) references public.budgets (id, user_id) on delete cascade,
  check (public.notification_channels_are_valid(channels))
);

create index budget_notices_budget_id_user_id_idx on public.budget_notices (budget_id, user_id);
create index budget_notices_user_month_idx on public.budget_notices (user_id, month);

-- Subscriptions --------------------------------------------------------------------------------

-- Recurring charges found by the worker (same merchant and amount at a regular interval).
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Normalised merchant, same rule as category_rules.merchant_key.
  merchant_key text not null check (char_length(merchant_key) between 1 and 120),
  merchant_name text not null check (char_length(merchant_name) >= 1),
  amount_cents bigint not null check (amount_cents > 0),
  currency public.currency not null default 'BRL',
  cycle public.billing_cycle not null,
  category_id text not null references public.categories (id),
  -- Account or card it is charged to; null when it moved or the account was removed.
  account_id uuid,
  last_charged_on date,
  next_charge_on date,
  -- Price increase: previous amount and the date of the first charge with the new one.
  previous_amount_cents bigint check (previous_amount_cents > 0),
  price_changed_on date,
  -- No related usage spotted lately. Heuristic of the worker.
  apparently_unused boolean not null default false,
  status public.subscription_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, merchant_key),
  unique (id, user_id),
  foreign key (account_id, user_id)
    references public.bank_accounts (id, user_id) on delete set null (account_id),
  check ((previous_amount_cents is null) = (price_changed_on is null))
);

create index subscriptions_account_id_user_id_idx on public.subscriptions (account_id, user_id);
create index subscriptions_category_id_idx on public.subscriptions (category_id);
-- Calendar and "próxima cobrança".
create index subscriptions_user_next_charge_idx on public.subscriptions (user_id, next_charge_on)
  where status = 'active';

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Charges that belong to a subscription.
alter table public.transactions add column subscription_id uuid;
alter table public.transactions add constraint transactions_subscription_id_user_id_fkey
  foreign key (subscription_id, user_id)
  references public.subscriptions (id, user_id) on delete set null (subscription_id);
create index transactions_subscription_id_user_id_idx
  on public.transactions (subscription_id, user_id);

-- Unusual purchases ----------------------------------------------------------------------------

-- Purchases out of the user's pattern (Quero-quero). transactions.is_unusual follows this table.
create table public.unusual_transactions (
  transaction_id uuid primary key references public.transactions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reasons public.unusual_reason[] not null check (cardinality(reasons) >= 1),
  status public.unusual_status not null default 'pending',
  detected_at timestamptz not null default now(),
  -- When the user answered "Fui eu" or "Não reconheço".
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'pending') = (resolved_at is null))
);

create index unusual_transactions_user_detected_idx
  on public.unusual_transactions (user_id, detected_at desc);
create index unusual_transactions_pending_idx on public.unusual_transactions (user_id)
  where status = 'pending';

create trigger unusual_transactions_updated_at before update on public.unusual_transactions
  for each row execute function public.set_updated_at();

create or replace function public.sync_transaction_unusual_flag()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.transactions set is_unusual = false where id = old.transaction_id;
    return old;
  end if;
  update public.transactions set is_unusual = true
  where id = new.transaction_id and not is_unusual;
  return new;
end;
$$;

create trigger unusual_transactions_flag after insert or delete on public.unusual_transactions
  for each row execute function public.sync_transaction_unusual_flag();

-- The row must belong to the same user as its transaction.
create or replace function public.check_unusual_transaction_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.transactions where id = new.transaction_id and user_id = new.user_id
  ) then
    raise exception 'unusual transaction must belong to the transaction owner';
  end if;
  return new;
end;
$$;

create trigger unusual_transactions_owner before insert or update of user_id, transaction_id
  on public.unusual_transactions
  for each row execute function public.check_unusual_transaction_owner();

-- Notifications --------------------------------------------------------------------------------

-- In-app inbox. Texts are pt-BR, written by the API.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null check (char_length(title) >= 1),
  body text not null default '',
  -- Internal app path opened on tap, e.g. "/budgets/<id>".
  link text check (link like '/%'),
  -- Idempotency key of the event (e.g. "budget:<id>:2026-10:70000"); a retry finds the same row.
  dedupe_key text not null check (char_length(dedupe_key) between 1 and 200),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key),
  unique (id, user_id)
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- Delivery of each notification per channel, with retries. Channels turned off by the user are
-- recorded as 'skipped'.
create table public.notification_deliveries (
  notification_id uuid not null,
  user_id uuid not null,
  channel public.notification_channel not null,
  status public.delivery_status not null default 'queued',
  attempts smallint not null default 0 check (attempts >= 0),
  -- Error code from Expo or the e-mail provider, without personal data.
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (notification_id, channel),
  foreign key (notification_id, user_id)
    references public.notifications (id, user_id) on delete cascade,
  check ((status = 'sent') = (sent_at is not null))
);

create index notification_deliveries_notification_id_user_id_idx
  on public.notification_deliveries (notification_id, user_id);
create index notification_deliveries_queued_idx on public.notification_deliveries (created_at)
  where status = 'queued';

create trigger notification_deliveries_updated_at before update on public.notification_deliveries
  for each row execute function public.set_updated_at();

-- Devices that receive push (Expo push tokens).
create table public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null unique check (char_length(expo_push_token) between 1 and 255),
  platform public.device_platform not null,
  -- e.g. "iPhone de Arthur"; shown in the account screen.
  device_name text check (char_length(device_name) between 1 and 80),
  last_seen_at timestamptz not null default now(),
  -- Set when Expo reports the token as invalid (DeviceNotRegistered) or the user signs out.
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_devices_user_active_idx on public.push_devices (user_id)
  where disabled_at is null;

create trigger push_devices_updated_at before update on public.push_devices
  for each row execute function public.set_updated_at();

-- Report exports -------------------------------------------------------------------------------

create table public.report_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  format public.export_format not null,
  range_from date not null,
  range_to date not null,
  status public.export_status not null default 'queued',
  -- "guara-relatorio-setembro-2026.pdf".
  file_name text not null check (char_length(file_name) between 1 and 120),
  -- Object path in the private "report-exports" bucket: "<user_id>/<export_id>/<file_name>".
  storage_path text,
  -- Address the copy goes to; null without the e-mail copy.
  email text,
  -- Error code, without personal data.
  last_error text,
  completed_at timestamptz,
  -- When the file is removed from Storage and the download link stops working.
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (range_from <= range_to),
  check (status not in ('ready', 'sent') or (storage_path is not null and completed_at is not null))
);

create index report_exports_user_created_idx on public.report_exports (user_id, created_at desc);
create index report_exports_pending_idx on public.report_exports (created_at)
  where status in ('queued', 'processing');
create index report_exports_expires_idx on public.report_exports (expires_at)
  where storage_path is not null;

create trigger report_exports_updated_at before update on public.report_exports
  for each row execute function public.set_updated_at();

-- Private bucket for the exported files. No storage policies: the API uploads with the service
-- role and hands out signed links.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-exports',
  'report-exports',
  false,
  20971520,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
on conflict (id) do nothing;

-- Functions are not callable through the API.
revoke execute on function public.sync_transaction_unusual_flag() from public, anon, authenticated;
revoke execute on function public.check_unusual_transaction_owner() from public, anon, authenticated;

-- Row level security ---------------------------------------------------------------------------

alter table public.budgets enable row level security;
alter table public.budget_months enable row level security;
alter table public.budget_notices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.unusual_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.push_devices enable row level security;
alter table public.report_exports enable row level security;

-- Own rows, read only. Writes go through the API (service role).
create policy "own budgets are readable" on public.budgets
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own budget months are readable" on public.budget_months
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own budget notices are readable" on public.budget_notices
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own subscriptions are readable" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own unusual transactions are readable" on public.unusual_transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own notifications are readable" on public.notifications
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own notification deliveries are readable" on public.notification_deliveries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own push devices are readable" on public.push_devices
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own report exports are readable" on public.report_exports
  for select to authenticated using ((select auth.uid()) = user_id);
