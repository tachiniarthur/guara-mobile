-- Part 4 · Investments: investor profile and target allocation, market data cached from Brapi
-- (assets, quotes, price history, dividends, corporate events, earnings, CDI), positions from
-- Malvo or typed in, their movements, suspected duplicates, monthly portfolio snapshots,
-- properties and price alerts. Mirrors investor-profile.ts, allocation.ts, asset.ts,
-- position.ts, duplicate.ts, wealth.ts, property.ts and price-alert.ts of @guara/types.
--
-- Market data is shared by every user (readable when signed in, written by the workers).
-- User data: own rows readable, writes through the API (service role).

create type public.investor_profile_type as enum (
  'conservative',
  'moderate',
  'aggressive',
  'sophisticated'
);
create type public.allocation_group as enum ('brFixed', 'intlFixed', 'brEquity', 'intlEquity', 'crypto');
create type public.allocation_subclass as enum (
  'postFixed',
  'inflation',
  'prefixed',
  'privateCredit',
  'treasuries',
  'bonds',
  'distressedDebt',
  'largeCaps',
  'smallCaps',
  'reits',
  'intlEtfs',
  'intlStocks',
  'intlFunds',
  'privateEquity',
  'bitcoin',
  'ethereum',
  'altcoins',
  'stablecoins'
);
create type public.asset_type as enum ('stock', 'fii', 'etf', 'bdr', 'crypto', 'index');
create type public.dividend_type as enum ('dividend', 'jcp', 'income');
create type public.corporate_event_type as enum (
  'split',
  'reverse_split',
  'bonus',
  'subscription',
  'other'
);
create type public.asset_class as enum ('fixed_income', 'equities', 'real_estate', 'alternatives');
create type public.instrument_type as enum (
  'cdb',
  'lci',
  'lca',
  'treasury',
  'debenture',
  'stock',
  'fii',
  'etf',
  'bdr',
  'crypto',
  'fund',
  'pension',
  'other'
);
create type public.risk_level as enum ('low', 'medium', 'high');
create type public.position_origin as enum ('open_finance', 'manual');
create type public.exposure_country as enum ('BR', 'abroad');
create type public.investment_movement_kind as enum (
  'buy',
  'sell',
  'contribution',
  'redemption',
  'income',
  'fee'
);
create type public.duplicate_status as enum ('pending', 'resolved');
create type public.duplicate_resolution as enum ('sum', 'keep_separate', 'delete_one');
create type public.property_kind as enum ('real_estate', 'vehicle');
create type public.price_alert_side as enum ('buy', 'sell');
create type public.price_alert_status as enum ('active', 'paused', 'triggered', 'cancelled');

-- Investor profile and target allocation -------------------------------------------------------

-- Each questionnaire answered. The most recent row is the current profile; older ones stay as
-- history (suitability record).
create table public.investor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.investor_profile_type not null,
  -- [{ "questionId": "objective", "optionId": "b" }, …] — six answers, validated by the API.
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) = 6),
  -- Score computed by the API, kept for audit.
  score smallint check (score >= 0),
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index investor_profiles_user_answered_idx
  on public.investor_profiles (user_id, answered_at desc);

-- Group of each subclass (fixed reference).
create table public.allocation_subclasses (
  subclass public.allocation_subclass primary key,
  "group" public.allocation_group not null,
  sort_order smallint not null
);

insert into public.allocation_subclasses (subclass, "group", sort_order) values
  ('postFixed', 'brFixed', 1),
  ('inflation', 'brFixed', 2),
  ('prefixed', 'brFixed', 3),
  ('privateCredit', 'brFixed', 4),
  ('treasuries', 'intlFixed', 5),
  ('bonds', 'intlFixed', 6),
  ('distressedDebt', 'intlFixed', 7),
  ('largeCaps', 'brEquity', 8),
  ('smallCaps', 'brEquity', 9),
  ('reits', 'brEquity', 10),
  ('intlEtfs', 'intlEquity', 11),
  ('intlStocks', 'intlEquity', 12),
  ('intlFunds', 'intlEquity', 13),
  ('privateEquity', 'intlEquity', 14),
  ('bitcoin', 'crypto', 15),
  ('ethereum', 'crypto', 16),
  ('altcoins', 'crypto', 17),
  ('stablecoins', 'crypto', 18);

-- Target share of each subclass per profile (business rule, same numbers as
-- apps/mobile/src/constants/target-allocations.ts). Each profile sums 100.
create table public.allocation_targets (
  profile public.investor_profile_type not null,
  subclass public.allocation_subclass not null references public.allocation_subclasses (subclass),
  target_percent numeric(5, 2) not null check (target_percent > 0 and target_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile, subclass)
);

create index allocation_targets_subclass_idx on public.allocation_targets (subclass);

create trigger allocation_targets_updated_at before update on public.allocation_targets
  for each row execute function public.set_updated_at();

insert into public.allocation_targets (profile, subclass, target_percent) values
  ('conservative', 'postFixed', 48),
  ('conservative', 'inflation', 17),
  ('conservative', 'prefixed', 5),
  ('conservative', 'privateCredit', 5),
  ('conservative', 'treasuries', 8),
  ('conservative', 'bonds', 5),
  ('conservative', 'largeCaps', 4),
  ('conservative', 'reits', 2),
  ('conservative', 'intlEtfs', 4),
  ('conservative', 'bitcoin', 2),
  ('moderate', 'postFixed', 24),
  ('moderate', 'inflation', 14),
  ('moderate', 'prefixed', 5),
  ('moderate', 'privateCredit', 5),
  ('moderate', 'treasuries', 8),
  ('moderate', 'bonds', 6),
  ('moderate', 'largeCaps', 10),
  ('moderate', 'smallCaps', 3),
  ('moderate', 'reits', 6),
  ('moderate', 'intlEtfs', 9),
  ('moderate', 'intlStocks', 5),
  ('moderate', 'bitcoin', 4),
  ('moderate', 'ethereum', 1),
  ('aggressive', 'postFixed', 9),
  ('aggressive', 'inflation', 7),
  ('aggressive', 'prefixed', 4),
  ('aggressive', 'privateCredit', 3),
  ('aggressive', 'treasuries', 7),
  ('aggressive', 'bonds', 8),
  ('aggressive', 'largeCaps', 13),
  ('aggressive', 'smallCaps', 8),
  ('aggressive', 'reits', 9),
  ('aggressive', 'intlEtfs', 9),
  ('aggressive', 'intlStocks', 7),
  ('aggressive', 'intlFunds', 4),
  ('aggressive', 'bitcoin', 7),
  ('aggressive', 'ethereum', 3),
  ('aggressive', 'altcoins', 2),
  ('sophisticated', 'privateCredit', 7),
  ('sophisticated', 'postFixed', 3),
  ('sophisticated', 'inflation', 3),
  ('sophisticated', 'treasuries', 8),
  ('sophisticated', 'bonds', 9),
  ('sophisticated', 'distressedDebt', 5),
  ('sophisticated', 'largeCaps', 9),
  ('sophisticated', 'smallCaps', 6),
  ('sophisticated', 'reits', 10),
  ('sophisticated', 'intlEtfs', 9),
  ('sophisticated', 'intlStocks', 6),
  ('sophisticated', 'privateEquity', 7),
  ('sophisticated', 'intlFunds', 3),
  ('sophisticated', 'bitcoin', 8),
  ('sophisticated', 'ethereum', 4),
  ('sophisticated', 'altcoins', 2),
  ('sophisticated', 'stablecoins', 1);

-- Market data (Brapi cache) --------------------------------------------------------------------

create table public.assets (
  ticker text primary key check (ticker ~ '^[A-Z0-9]{2,12}$'),
  name text not null check (char_length(name) >= 1),
  type public.asset_type not null,
  currency public.currency not null default 'BRL',
  logo_url text,
  country public.exposure_country,
  sector text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assets_name_trgm_idx on public.assets using gin (name extensions.gin_trgm_ops);
create index assets_type_idx on public.assets (type);

create trigger assets_updated_at before update on public.assets
  for each row execute function public.set_updated_at();

-- Latest quote per asset. expires_at follows the TTL rule (short during trading hours, long
-- outside them); the API fetches Brapi again only after it.
create table public.asset_quotes (
  ticker text primary key references public.assets (ticker) on delete cascade,
  -- Priced assets, in cents of the asset currency.
  price_cents bigint check (price_cents >= 0),
  -- Indexes only (points), e.g. 131245.67.
  points numeric(18, 4) check (points >= 0),
  day_change_percent numeric(9, 4),
  year_low_cents bigint check (year_low_cents >= 0),
  year_high_cents bigint check (year_high_cents >= 0),
  -- When the market printed this quote.
  quoted_at timestamptz,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (price_cents is null or points is null)
);

create index asset_quotes_expires_idx on public.asset_quotes (expires_at);

-- Daily closes, for charts, indicators and the portfolio evolution.
create table public.asset_price_history (
  ticker text not null references public.assets (ticker) on delete cascade,
  date date not null,
  close_cents bigint check (close_cents >= 0),
  points numeric(18, 4) check (points >= 0),
  primary key (ticker, date),
  check ((close_cents is null) <> (points is null))
);

create table public.asset_dividends (
  id uuid primary key default gen_random_uuid(),
  ticker text not null references public.assets (ticker) on delete cascade,
  type public.dividend_type not null,
  ex_date date not null,
  payment_date date,
  -- Per unit, in reais, with sub-cent precision ("0.452318").
  amount_per_unit numeric(20, 8) not null check (amount_per_unit > 0),
  created_at timestamptz not null default now(),
  unique (ticker, type, ex_date, amount_per_unit)
);

create index asset_dividends_ticker_ex_date_idx on public.asset_dividends (ticker, ex_date desc);

create table public.asset_corporate_events (
  id uuid primary key default gen_random_uuid(),
  ticker text not null references public.assets (ticker) on delete cascade,
  type public.corporate_event_type not null,
  date date not null,
  -- pt-BR text written by the API.
  description text not null check (char_length(description) >= 1),
  created_at timestamptz not null default now(),
  unique (ticker, type, date)
);

create index asset_corporate_events_ticker_date_idx
  on public.asset_corporate_events (ticker, date desc);

-- Quarterly results. Company-wide amounts in cents.
create table public.asset_earnings (
  ticker text not null references public.assets (ticker) on delete cascade,
  -- Fiscal period label, e.g. "2T26".
  period text not null check (char_length(period) between 1 and 12),
  published_on date not null,
  revenue_cents bigint,
  net_income_cents bigint,
  ebitda_cents bigint,
  net_margin_percent numeric(9, 4),
  roe_percent numeric(9, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (ticker, period)
);

create index asset_earnings_ticker_published_idx
  on public.asset_earnings (ticker, published_on desc);

create trigger asset_earnings_updated_at before update on public.asset_earnings
  for each row execute function public.set_updated_at();

-- CDI of each business day, for every comparison with the CDI.
create table public.cdi_rates (
  date date primary key,
  -- Daily rate in percent, e.g. 0.05501 (% a.d.).
  daily_rate_percent numeric(12, 8) not null check (daily_rate_percent >= 0),
  -- Annualised rate published for that day, e.g. 14.90 (% a.a.).
  annual_rate_percent numeric(9, 4) check (annual_rate_percent >= 0)
);

-- Positions ------------------------------------------------------------------------------------

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  origin public.position_origin not null,
  -- Open Finance only. Kept null when the connection is removed with history kept.
  connection_id uuid,
  malvo_investment_id text,
  class public.asset_class not null,
  subclass public.allocation_subclass not null references public.allocation_subclasses (subclass),
  -- e.g. "CDB Banco Aurora 110% CDI" or "Petrobras PN".
  instrument_name text not null check (char_length(instrument_name) >= 1),
  instrument_type public.instrument_type not null,
  -- Listed instruments only.
  ticker text references public.assets (ticker),
  risk public.risk_level not null,
  -- Units held (shares, quotas, coins); null when tracked only by value.
  quantity numeric(38, 18) check (quantity >= 0),
  average_price_cents bigint check (average_price_cents >= 0),
  invested_cents bigint check (invested_cents >= 0),
  current_value_cents bigint check (current_value_cents >= 0),
  country public.exposure_country,
  -- Custodian/bank name, when known.
  institution_name text,
  value_updated_at timestamptz,
  -- "Somar": a manual position merged into another one counts only through it.
  merged_into_position_id uuid,
  -- "Excluir um" on an Open Finance position: hidden, so the next sync does not bring it back.
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (connection_id, user_id)
    references public.bank_connections (id, user_id) on delete set null (connection_id),
  foreign key (merged_into_position_id, user_id)
    references public.positions (id, user_id) on delete set null (merged_into_position_id),
  check ((origin = 'open_finance') = (malvo_investment_id is not null)),
  check (origin = 'open_finance' or connection_id is null),
  check (merged_into_position_id is null or (origin = 'manual' and merged_into_position_id <> id))
);

create unique index positions_malvo_investment_id_key
  on public.positions (user_id, malvo_investment_id)
  where malvo_investment_id is not null;
create index positions_user_id_idx on public.positions (user_id)
  where merged_into_position_id is null and hidden_at is null;
create index positions_connection_id_user_id_idx on public.positions (connection_id, user_id);
create index positions_merged_into_user_idx on public.positions (merged_into_position_id, user_id);
create index positions_subclass_idx on public.positions (subclass);
create index positions_ticker_idx on public.positions (ticker);

create trigger positions_updated_at before update on public.positions
  for each row execute function public.set_updated_at();

-- What happened to a position: buys and sells, contributions and redemptions, income received
-- (dividends, JCP, FII income) and fees. Feeds "aportes" and "proventos" of the year and what
-- the user received from each asset.
create table public.investment_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  position_id uuid not null,
  kind public.investment_movement_kind not null,
  -- Kind of income, for kind = 'income'.
  income_type public.dividend_type,
  date date not null,
  quantity numeric(38, 18) check (quantity > 0),
  amount_cents bigint not null check (amount_cents > 0),
  source public.position_origin not null,
  -- Movement id at Malvo, when it came from Open Finance.
  malvo_movement_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (position_id, user_id)
    references public.positions (id, user_id) on delete cascade,
  check ((kind = 'income') = (income_type is not null)),
  check ((source = 'open_finance') = (malvo_movement_id is not null))
);

create unique index investment_movements_malvo_movement_id_key
  on public.investment_movements (position_id, malvo_movement_id)
  where malvo_movement_id is not null;
create index investment_movements_position_id_user_id_idx
  on public.investment_movements (position_id, user_id);
create index investment_movements_user_kind_date_idx
  on public.investment_movements (user_id, kind, date);

create trigger investment_movements_updated_at before update on public.investment_movements
  for each row execute function public.set_updated_at();

-- Suspected duplicates: the same investment reported twice (Open Finance and typed in).
create table public.position_duplicates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- The pair is stored in a fixed order, so it is detected only once.
  position_a_id uuid not null,
  position_b_id uuid not null,
  status public.duplicate_status not null default 'pending',
  resolution public.duplicate_resolution,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (position_a_id, position_b_id),
  foreign key (position_a_id, user_id) references public.positions (id, user_id) on delete cascade,
  foreign key (position_b_id, user_id) references public.positions (id, user_id) on delete cascade,
  check (position_a_id < position_b_id),
  check ((status = 'resolved') = (resolution is not null and resolved_at is not null))
);

create index position_duplicates_a_user_idx on public.position_duplicates (position_a_id, user_id);
create index position_duplicates_b_user_idx on public.position_duplicates (position_b_id, user_id);
create index position_duplicates_pending_idx on public.position_duplicates (user_id)
  where status = 'pending';

create trigger position_duplicates_updated_at before update on public.position_duplicates
  for each row execute function public.set_updated_at();

-- Portfolio value at the end of each month (and today), written by the worker. Source of the
-- 6M/12M/Tudo evolution against the CDI.
create table public.portfolio_snapshots (
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  value_cents bigint not null check (value_cents >= 0),
  invested_cents bigint not null check (invested_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create trigger portfolio_snapshots_updated_at before update on public.portfolio_snapshots
  for each row execute function public.set_updated_at();

-- Properties -----------------------------------------------------------------------------------

-- Real estate and vehicles. They count towards net worth, never towards the allocation.
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.property_kind not null,
  name text not null check (char_length(name) between 1 and 80),
  -- Remaining financing balance.
  outstanding_debt_cents bigint check (outstanding_debt_cents >= 0),
  -- Real estate: value informed by the user and address.
  declared_value_cents bigint check (declared_value_cents >= 0),
  address text check (char_length(address) between 1 and 200),
  -- Vehicles: FIPE code, model year and the table value refreshed monthly by the API.
  fipe_code text check (fipe_code ~ '^\d{6}-\d$'),
  model_year smallint check (model_year between 1950 and 2100),
  fipe_value_cents bigint check (fipe_value_cents >= 0),
  -- First day of the FIPE reference month.
  fipe_reference_month date check (extract(day from fipe_reference_month) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'real_estate' and declared_value_cents is not null
      and fipe_code is null and model_year is null and fipe_value_cents is null
      and fipe_reference_month is null)
    or (kind = 'vehicle' and fipe_code is not null and model_year is not null
      and declared_value_cents is null and address is null)
  ),
  check ((fipe_value_cents is null) = (fipe_reference_month is null))
);

create index properties_user_id_idx on public.properties (user_id);
-- Monthly FIPE refresh.
create index properties_fipe_idx on public.properties (fipe_code, model_year)
  where kind = 'vehicle';

create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

-- Price alerts ---------------------------------------------------------------------------------

-- "Avise quando cair a X" (buy) or "subir a X" (sell). The worker moves an alert from 'active'
-- to 'triggered' in one update (where status = 'active'), so it fires once per activation.
create table public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null references public.assets (ticker),
  side public.price_alert_side not null,
  target_price_cents bigint not null check (target_price_cents > 0),
  status public.price_alert_status not null default 'active',
  channels public.notification_channel[] not null default '{push,email}',
  triggered_at timestamptz,
  triggered_price_cents bigint check (triggered_price_cents >= 0),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (public.notification_channels_are_valid(channels)),
  -- A renewed alert keeps the last trigger until it fires again.
  check (status <> 'triggered' or triggered_at is not null),
  check ((triggered_at is null) = (triggered_price_cents is null)),
  check ((status = 'cancelled') = (cancelled_at is not null))
);

create index price_alerts_user_id_idx on public.price_alerts (user_id);
-- Checked at every quote update.
create index price_alerts_active_ticker_idx on public.price_alerts (ticker, side, target_price_cents)
  where status = 'active';

create trigger price_alerts_updated_at before update on public.price_alerts
  for each row execute function public.set_updated_at();

-- Price alerts stay within the plan's limit (cancelled ones do not count; null = no limit).
create or replace function public.check_price_alerts_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  alert_limit integer;
  current_count integer;
begin
  select p.price_alerts_limit into alert_limit
  from public.profiles pr
  join public.plans p on p.id = pr.plan_id
  where pr.id = new.user_id;

  if alert_limit is null then
    return new;
  end if;

  select count(*) into current_count
  from public.price_alerts
  where user_id = new.user_id and status <> 'cancelled' and id <> new.id;

  if current_count >= alert_limit then
    raise exception 'plan_limit_reached: price alerts limit is %', alert_limit
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger price_alerts_limit before insert on public.price_alerts
  for each row when (new.status <> 'cancelled')
  execute function public.check_price_alerts_limit();

revoke execute on function public.check_price_alerts_limit() from public, anon, authenticated;

-- Row level security ---------------------------------------------------------------------------

alter table public.investor_profiles enable row level security;
alter table public.allocation_subclasses enable row level security;
alter table public.allocation_targets enable row level security;
alter table public.assets enable row level security;
alter table public.asset_quotes enable row level security;
alter table public.asset_price_history enable row level security;
alter table public.asset_dividends enable row level security;
alter table public.asset_corporate_events enable row level security;
alter table public.asset_earnings enable row level security;
alter table public.cdi_rates enable row level security;
alter table public.positions enable row level security;
alter table public.investment_movements enable row level security;
alter table public.position_duplicates enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.properties enable row level security;
alter table public.price_alerts enable row level security;

-- Reference and market data: readable by signed-in users.
create policy "allocation subclasses are readable" on public.allocation_subclasses
  for select to authenticated using (true);
create policy "allocation targets are readable" on public.allocation_targets
  for select to authenticated using (true);
create policy "assets are readable" on public.assets
  for select to authenticated using (true);
create policy "asset quotes are readable" on public.asset_quotes
  for select to authenticated using (true);
create policy "asset price history is readable" on public.asset_price_history
  for select to authenticated using (true);
create policy "asset dividends are readable" on public.asset_dividends
  for select to authenticated using (true);
create policy "asset corporate events are readable" on public.asset_corporate_events
  for select to authenticated using (true);
create policy "asset earnings are readable" on public.asset_earnings
  for select to authenticated using (true);
create policy "cdi rates are readable" on public.cdi_rates
  for select to authenticated using (true);

-- Own rows, read only. Writes go through the API (service role).
create policy "own investor profiles are readable" on public.investor_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own positions are readable" on public.positions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own investment movements are readable" on public.investment_movements
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own position duplicates are readable" on public.position_duplicates
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own portfolio snapshots are readable" on public.portfolio_snapshots
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own properties are readable" on public.properties
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own price alerts are readable" on public.price_alerts
  for select to authenticated using ((select auth.uid()) = user_id);
