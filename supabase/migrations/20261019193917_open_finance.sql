-- Part 2 · Open Finance: institutions, connections (Malvo consents), accounts and cards,
-- transactions and the user's category rules. Mirrors bank-connection.ts, bank-account.ts and
-- transaction.ts of @guara/types.
--
-- Writes come from the NestJS API and the workers (service role). Signed-in users can only read
-- their own rows; secrets of a connection are never readable outside the service role.

create extension if not exists pg_trgm with schema extensions;

create type public.currency as enum ('BRL', 'USD', 'EUR');
create type public.bank_connection_status as enum ('active', 'expiring', 'expired', 'revoked', 'error');
create type public.bank_account_type as enum ('checking', 'savings', 'credit_card');
create type public.transaction_direction as enum ('in', 'out');
create type public.transaction_type as enum (
  'pix',
  'debit_card',
  'credit_card',
  'boleto',
  'transfer',
  'direct_debit',
  'fee',
  'other'
);
create type public.transaction_source as enum ('open_finance', 'manual');
-- What made a consent billable at Malvo in a month.
create type public.consent_charge_kind as enum ('new_connection', 'monthly_refresh');

-- Institutions --------------------------------------------------------------------------------

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  -- Connector id at Malvo.
  malvo_connector_id text not null unique,
  name text not null check (char_length(name) >= 1),
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger institutions_updated_at before update on public.institutions
  for each row execute function public.set_updated_at();

-- Connections ---------------------------------------------------------------------------------

-- One Open Finance consent at one institution. Revoking keeps the row (status 'revoked'); the
-- imported history stays or goes depending on the user's choice ("keepHistory").
create table public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  institution_id uuid not null references public.institutions (id),
  -- Item id at Malvo. Not a secret by itself (useless without the API key).
  malvo_item_id text not null unique,
  status public.bank_connection_status not null default 'active',
  -- Last error reported by Malvo or the institution, safe to log (no personal data).
  status_detail text,
  consent_granted_at timestamptz,
  consent_expires_at timestamptz,
  last_synced_at timestamptz,
  -- Next scheduled sync; null = only by webhook.
  next_sync_at timestamptz,
  -- When the "consent expiring" notice went out, so it is sent once per consent.
  expiring_notified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check ((status = 'revoked') = (revoked_at is not null))
);

create index bank_connections_user_id_idx on public.bank_connections (user_id);
create index bank_connections_institution_id_idx on public.bank_connections (institution_id);
-- Workers: what to sync next and which consents are about to expire.
create index bank_connections_next_sync_idx on public.bank_connections (next_sync_at)
  where status in ('active', 'expiring');
create index bank_connections_consent_expires_idx on public.bank_connections (consent_expires_at)
  where status in ('active', 'expiring');

create trigger bank_connections_updated_at before update on public.bank_connections
  for each row execute function public.set_updated_at();

-- Tokens returned by Malvo, encrypted by the API before they get here (the key lives only in the
-- API). No policies: only the service role can read or write this table.
create table public.bank_connection_secrets (
  connection_id uuid primary key references public.bank_connections (id) on delete cascade,
  ciphertext bytea not null,
  -- Version of the API's encryption key, to allow rotation.
  key_version smallint not null check (key_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger bank_connection_secrets_updated_at before update on public.bank_connection_secrets
  for each row execute function public.set_updated_at();

-- Each billable consent per connection and month (Malvo charges per consent). The unique key
-- makes the worker idempotent and shows the month's Open Finance cost.
create table public.consent_charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  connection_id uuid not null,
  -- First day of the São Paulo month.
  month date not null check (extract(day from month) = 1),
  kind public.consent_charge_kind not null,
  created_at timestamptz not null default now(),
  unique (connection_id, month),
  foreign key (connection_id, user_id)
    references public.bank_connections (id, user_id) on delete cascade
);

create index consent_charges_user_id_idx on public.consent_charges (user_id);
create index consent_charges_month_idx on public.consent_charges (month);

-- New connections stay within the plan's limit (revoked ones do not count).
create or replace function public.check_bank_connections_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  connection_limit integer;
  current_count integer;
begin
  select p.bank_connections_limit into connection_limit
  from public.profiles pr
  join public.plans p on p.id = pr.plan_id
  where pr.id = new.user_id;

  select count(*) into current_count
  from public.bank_connections
  where user_id = new.user_id and status <> 'revoked' and id <> new.id;

  if current_count >= coalesce(connection_limit, 0) then
    raise exception 'plan_limit_reached: bank connections limit is %', coalesce(connection_limit, 0)
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger bank_connections_limit before insert on public.bank_connections
  for each row execute function public.check_bank_connections_limit();

create trigger bank_connections_limit_on_reactivate before update of status on public.bank_connections
  for each row when (old.status = 'revoked' and new.status <> 'revoked')
  execute function public.check_bank_connections_limit();

-- Accounts and cards --------------------------------------------------------------------------

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  connection_id uuid not null,
  institution_id uuid not null references public.institutions (id),
  -- Account id at Malvo.
  malvo_account_id text not null unique,
  type public.bank_account_type not null,
  -- Name given by the institution, e.g. "Conta corrente".
  name text not null check (char_length(name) >= 1),
  -- Masked number, e.g. "•••• 1234". Never the full number.
  masked_number text,
  currency public.currency not null default 'BRL',
  -- Checking/savings: available balance (negative in the overdraft).
  -- Credit card: amount of the open bill (positive = owed).
  balance_cents bigint,
  -- Credit cards only.
  credit_limit_cents bigint check (credit_limit_cents >= 0),
  bill_due_on date,
  balance_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (connection_id, user_id)
    references public.bank_connections (id, user_id) on delete cascade,
  check (type = 'credit_card' or (credit_limit_cents is null and bill_due_on is null))
);

create index bank_accounts_user_id_idx on public.bank_accounts (user_id);
create index bank_accounts_connection_id_idx on public.bank_accounts (connection_id);
create index bank_accounts_institution_id_idx on public.bank_accounts (institution_id);

create trigger bank_accounts_updated_at before update on public.bank_accounts
  for each row execute function public.set_updated_at();

-- Transactions --------------------------------------------------------------------------------

-- A subcategory is only valid together with its own category.
alter table public.subcategories add constraint subcategories_id_category_id_key
  unique (id, category_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  account_id uuid not null,
  -- Transaction id at Malvo; null for manual entries.
  malvo_transaction_id text,
  -- Always positive; the sign comes from direction.
  amount_cents bigint not null check (amount_cents > 0),
  currency public.currency not null default 'BRL',
  direction public.transaction_direction not null,
  type public.transaction_type not null default 'other',
  source public.transaction_source not null,
  -- Booking date (São Paulo calendar day).
  date date not null,
  -- Exact instant, when the institution reports it.
  occurred_at timestamptz,
  -- Raw statement text ("LOJAELETRON*ONLINE SP").
  description text not null check (char_length(description) >= 1),
  -- Cleaned-up merchant name, when recognised.
  merchant_name text check (char_length(merchant_name) >= 1),
  -- City reported by the institution, used by the unusual-purchase check.
  merchant_city text,
  auto_category_id text references public.categories (id),
  user_category_id text references public.categories (id),
  -- Effective category: the user's choice wins over the classifier.
  category_id text generated always as (coalesce(user_category_id, auto_category_id)) stored,
  -- Finer split of the effective category; the API clears it when the category changes.
  subcategory_id text,
  -- "3/10" for credit card installments; both null = paid at once.
  installment_current smallint,
  installment_total smallint,
  -- Credit card purchases only: bill month (first day) and its due date.
  invoice_month date check (extract(day from invoice_month) = 1),
  invoice_due_on date,
  -- Flagged as out of the user's usual pattern (details in Part 3).
  is_unusual boolean not null default false,
  -- Marked by the user as a repeated entry: left out of totals and caps.
  marked_duplicate boolean not null default false,
  -- Left out of reports (still counts in caps and balances).
  hidden_from_reports boolean not null default false,
  note text check (char_length(note) between 1 and 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (account_id, user_id)
    references public.bank_accounts (id, user_id) on delete cascade,
  foreign key (subcategory_id, category_id)
    references public.subcategories (id, category_id),
  check ((source = 'open_finance') = (malvo_transaction_id is not null)),
  check (
    (installment_current is null and installment_total is null)
    or (installment_total >= 2 and installment_current between 1 and installment_total)
  ),
  check ((invoice_month is null) = (invoice_due_on is null)),
  -- The composite key above skips rows with a null, so a subcategory needs a category.
  check (subcategory_id is null or category_id is not null)
);

-- Re-syncing the same Malvo transaction updates it instead of duplicating it.
create unique index transactions_malvo_transaction_id_key
  on public.transactions (account_id, malvo_transaction_id)
  where malvo_transaction_id is not null;

-- Lists, period filters, category totals and caps.
create index transactions_user_date_idx on public.transactions (user_id, date desc, id desc);
create index transactions_account_date_idx on public.transactions (account_id, date desc);
create index transactions_user_category_date_idx
  on public.transactions (user_id, category_id, date);
create index transactions_auto_category_id_idx on public.transactions (auto_category_id);
create index transactions_user_category_id_idx on public.transactions (user_category_id);
create index transactions_subcategory_id_idx on public.transactions (subcategory_id, category_id);
create index transactions_unusual_idx on public.transactions (user_id, date desc)
  where is_unusual;
-- Free-text search over description and merchant (ILIKE).
create index transactions_description_trgm_idx
  on public.transactions using gin (description extensions.gin_trgm_ops);
create index transactions_merchant_name_trgm_idx
  on public.transactions using gin (merchant_name extensions.gin_trgm_ops);

create trigger transactions_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

-- Category rules ------------------------------------------------------------------------------

-- "Também mudar os lançamentos parecidos": the category the user chose for a merchant, applied
-- by the API to past and future transactions of that merchant.
create table public.category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Normalised merchant (lower case, no accents or card suffixes), computed by the API.
  merchant_key text not null check (char_length(merchant_key) between 1 and 120),
  category_id text not null references public.categories (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, merchant_key)
);

create index category_rules_category_id_idx on public.category_rules (category_id);

create trigger category_rules_updated_at before update on public.category_rules
  for each row execute function public.set_updated_at();

-- Trigger functions are not callable through the API.
revoke execute on function public.check_bank_connections_limit() from public, anon, authenticated;

-- Row level security --------------------------------------------------------------------------

alter table public.institutions enable row level security;
alter table public.bank_connections enable row level security;
alter table public.bank_connection_secrets enable row level security;
alter table public.consent_charges enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.category_rules enable row level security;

create policy "institutions are readable" on public.institutions
  for select to authenticated using (true);

-- Own rows, read only. Writes go through the API (service role).
create policy "own bank connections are readable" on public.bank_connections
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own consent charges are readable" on public.consent_charges
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own bank accounts are readable" on public.bank_accounts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own transactions are readable" on public.transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own category rules are readable" on public.category_rules
  for select to authenticated using ((select auth.uid()) = user_id);

-- bank_connection_secrets: no policy on purpose (service role only).
