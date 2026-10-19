-- Review of parts 1–6 against the mobile and web screens: plan subscription, paused bank
-- connections and consent permissions, goal notices and icons, catalog of subscription services,
-- LGPD records (terms acceptance, data export, account deletion), devices with access and the
-- preferences that follow the account.
--
-- Same rules as before: own rows readable, writes through the API (service role). The exception
-- is user_preferences, which the user may also edit, like the profile.

-- Enums ---------------------------------------------------------------------------------------

-- Downgrade: the connections beyond the new plan's limit stop syncing but keep their data.
alter type public.bank_connection_status add value 'paused' after 'expiring';

alter type public.notification_type add value 'goal_milestone';
alter type public.notification_type add value 'goal_behind';
alter type public.notification_type add value 'goal_deposit_reminder';
alter type public.notification_type add value 'investment_duplicate';

-- What the user allowed the institution to share ("O que o Guará vê").
create type public.consent_permission as enum (
  'registration_data',
  'accounts',
  'credit_cards',
  'investments'
);
create type public.plan_billing as enum ('monthly', 'yearly');
-- 'canceled': will not renew, valid until current_period_end; 'ended': over.
create type public.plan_subscription_status as enum ('active', 'canceled', 'ended');
create type public.client_platform as enum ('ios', 'android', 'web');
create type public.legal_document as enum ('terms', 'privacy');
create type public.account_deletion_status as enum ('scheduled', 'canceled', 'completed');
create type public.text_size as enum ('default', 'large', 'larger');

-- Bank connections ----------------------------------------------------------------------------

alter table public.bank_connections
  add column permissions public.consent_permission[] not null default '{}';

-- Revoked and paused connections do not count towards the plan's limit. Status compared as text
-- because the new 'paused' value cannot be used as an enum literal in this same transaction.
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
  where user_id = new.user_id
    and status::text not in ('revoked', 'paused')
    and id <> new.id;

  if current_count >= coalesce(connection_limit, 0) then
    raise exception 'plan_limit_reached: bank connections limit is %', coalesce(connection_limit, 0)
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger bank_connections_limit_on_reactivate on public.bank_connections;
create trigger bank_connections_limit_on_reactivate before update of status on public.bank_connections
  for each row when (
    old.status::text in ('revoked', 'paused') and new.status::text not in ('revoked', 'paused')
  )
  execute function public.check_bank_connections_limit();

-- Plan subscription ---------------------------------------------------------------------------

-- The paid plan of the user. profiles.plan_id stays the plan in effect; this row holds the
-- billing period and what changes at renewal. Payment (store, gateway, prices charged) comes
-- later, once it is decided.
create table public.plan_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.plans (id),
  billing public.plan_billing not null,
  status public.plan_subscription_status not null default 'active',
  current_period_start timestamptz not null,
  -- "Renova em 10/10/2026"; a canceled plan is worth until then.
  current_period_end timestamptz not null,
  -- Downgrade or billing change that takes effect at current_period_end.
  scheduled_plan_id text references public.plans (id),
  scheduled_billing public.plan_billing,
  -- Connection that stays active when the scheduled plan allows fewer banks; the others pause.
  keep_connection_id uuid,
  canceled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (keep_connection_id, user_id)
    references public.bank_connections (id, user_id) on delete set null (keep_connection_id),
  check (current_period_end > current_period_start),
  check (
    (status = 'active' and canceled_at is null and ended_at is null)
    or (status = 'canceled' and canceled_at is not null and ended_at is null)
    or (status = 'ended' and ended_at is not null)
  ),
  check (keep_connection_id is null or scheduled_plan_id is not null)
);

-- One running subscription per user.
create unique index plan_subscriptions_user_running_key on public.plan_subscriptions (user_id)
  where status <> 'ended';
create index plan_subscriptions_user_id_idx on public.plan_subscriptions (user_id);
create index plan_subscriptions_plan_id_idx on public.plan_subscriptions (plan_id);
create index plan_subscriptions_scheduled_plan_id_idx
  on public.plan_subscriptions (scheduled_plan_id);
create index plan_subscriptions_keep_connection_idx
  on public.plan_subscriptions (keep_connection_id, user_id);
-- Renewals and scheduled changes of the day.
create index plan_subscriptions_period_end_idx on public.plan_subscriptions (current_period_end)
  where status <> 'ended';

create trigger plan_subscriptions_updated_at before update on public.plan_subscriptions
  for each row execute function public.set_updated_at();

-- Goals ---------------------------------------------------------------------------------------

-- Icon of the goal card, kebab case like categories.icon ("shield-check").
alter table public.goals add column icon text check (icon ~ '^[a-z0-9-]+$');

-- Subscription services -----------------------------------------------------------------------

-- Known services (Netflix, Spotify…): what they are and how to cancel. Shared reference data,
-- kept by the API; detected subscriptions point here when the merchant is recognised.
create table public.subscription_services (
  id text primary key check (id ~ '^[a-z0-9_]+$'),
  name text not null check (char_length(name) >= 1),
  -- Article of the name in pt-BR ("a Netflix", "o Spotify").
  article text not null check (article in ('a', 'o')),
  -- pt-BR kind shown under the name ("Streaming", "Música").
  kind text not null check (char_length(kind) between 1 and 40),
  category_id text references public.categories (id),
  logo_url text,
  -- Steps of "Como cancelar", in order (pt-BR).
  cancel_steps text[] not null default '{}',
  cancel_url text check (cancel_url like 'https://%'),
  -- What the bank cannot tell about the use ("assistido", "ouvido").
  usage_verb text check (char_length(usage_verb) between 1 and 20),
  -- Normalised merchants of the service, same rule as subscriptions.merchant_key.
  merchant_keys text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscription_services_category_id_idx on public.subscription_services (category_id);
create index subscription_services_merchant_keys_idx
  on public.subscription_services using gin (merchant_keys);

create trigger subscription_services_updated_at before update on public.subscription_services
  for each row execute function public.set_updated_at();

alter table public.subscriptions
  add column service_id text references public.subscription_services (id) on delete set null,
  -- Last use spotted (e.g. a purchase inside the service), for "X dias sem uso".
  add column last_used_on date;

create index subscriptions_service_id_idx on public.subscriptions (service_id);

-- LGPD ----------------------------------------------------------------------------------------

-- Which version of the terms and of the privacy policy the user accepted, and when.
create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document public.legal_document not null,
  -- Date of the version ("Versão de 1º de setembro de 2026").
  version date not null,
  platform public.client_platform not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, document, version)
);

-- "Baixar meus dados": a copy of everything, e-mailed to the user.
create table public.data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.export_status not null default 'queued',
  email text not null check (char_length(email) between 3 and 320),
  -- Object path in the private "data-exports" bucket: "<user_id>/<request_id>/<file_name>".
  storage_path text,
  -- Error code, without personal data.
  last_error text,
  completed_at timestamptz,
  -- When the file is removed and the link stops working.
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status not in ('ready', 'sent') or (storage_path is not null and completed_at is not null))
);

create index data_export_requests_user_created_idx
  on public.data_export_requests (user_id, created_at desc);
create index data_export_requests_pending_idx on public.data_export_requests (created_at)
  where status in ('queued', 'processing');

create trigger data_export_requests_updated_at before update on public.data_export_requests
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('data-exports', 'data-exports', false, 52428800, array['application/zip'])
on conflict (id) do nothing;

-- "Excluir conta": erased within 30 days. No foreign key on purpose: the row outlives the
-- profile as the record that the deletion was asked for and done (no other personal data).
create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status public.account_deletion_status not null default 'scheduled',
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz not null,
  canceled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_for >= requested_at),
  check ((status = 'canceled') = (canceled_at is not null)),
  check ((status = 'completed') = (completed_at is not null))
);

create unique index account_deletion_requests_user_scheduled_key
  on public.account_deletion_requests (user_id)
  where status = 'scheduled';
create index account_deletion_requests_due_idx on public.account_deletion_requests (scheduled_for)
  where status = 'scheduled';

create trigger account_deletion_requests_updated_at before update
  on public.account_deletion_requests
  for each row execute function public.set_updated_at();

-- Devices -------------------------------------------------------------------------------------

-- "Aparelhos com acesso": one row per signed-in app or browser. "Sair de todos os aparelhos"
-- ends the Supabase Auth sessions and sets signed_out_at.
create table public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform public.client_platform not null,
  -- "iPhone 16", "MacBook Air".
  name text not null check (char_length(name) between 1 and 80),
  -- "Safari", "Chrome" on the web; null in the app.
  browser text check (char_length(browser) between 1 and 40),
  app_version text check (char_length(app_version) between 1 and 20),
  -- Approximate city from the IP ("São Paulo"); the IP itself is not stored.
  city text check (char_length(city) between 1 and 80),
  -- Supabase Auth session, to end it individually.
  auth_session_id uuid unique,
  last_seen_at timestamptz not null default now(),
  signed_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_devices_user_active_idx on public.user_devices (user_id, last_seen_at desc)
  where signed_out_at is null;

create trigger user_devices_updated_at before update on public.user_devices
  for each row execute function public.set_updated_at();

-- Preferences ---------------------------------------------------------------------------------

-- Appearance settings that follow the account across the app and the web. Biometrics stays on
-- each device (it locks that device).
create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  text_size public.text_size not null default 'default',
  reduce_motion boolean not null default false,
  hide_values_on_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

insert into public.user_preferences (user_id) select id from public.profiles
on conflict (user_id) do nothing;

-- Every sign-up also gets default preferences.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, auth_provider)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(
      left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80),
      ''
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    case new.raw_app_meta_data ->> 'provider'
      when 'google' then 'google'::public.auth_provider
      when 'apple' then 'apple'::public.auth_provider
      else 'email'::public.auth_provider
    end
  );
  insert into public.notification_settings (user_id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.check_bank_connections_limit() from public, anon, authenticated;

-- Row level security --------------------------------------------------------------------------

alter table public.plan_subscriptions enable row level security;
alter table public.subscription_services enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.data_export_requests enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.user_devices enable row level security;
alter table public.user_preferences enable row level security;

create policy "subscription services are readable" on public.subscription_services
  for select to authenticated using (true);

create policy "own plan subscriptions are readable" on public.plan_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own legal acceptances are readable" on public.legal_acceptances
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own data export requests are readable" on public.data_export_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own account deletion requests are readable" on public.account_deletion_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own devices are readable" on public.user_devices
  for select to authenticated using ((select auth.uid()) = user_id);

-- Preferences: created by the sign-up trigger; the user reads and edits their own.
create policy "own preferences are readable" on public.user_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own preferences are editable" on public.user_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
