-- Part 1 · Base: plans, profiles (one per Supabase Auth user), categories and notification
-- settings. Shared by the mobile app and the web app through the NestJS API (service role);
-- RLS is on everywhere as a second layer: each user only sees their own rows.

-- updated_at kept current by a trigger on every table that has it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Enums with the same values as @guara/types.
create type public.auth_provider as enum ('google', 'apple', 'email');
create type public.category_kind as enum ('expense', 'income', 'transfer');
create type public.notification_type as enum (
  'budget_warning',
  'budget_exceeded',
  'price_alert',
  'unusual_transaction',
  'consent_expiring',
  'subscription_price_increase',
  'report_ready'
);

-- Plans ---------------------------------------------------------------------------------------

create table public.plans (
  id text primary key check (id ~ '^[a-z_]+$'),
  name text not null,
  -- null on the free plan.
  monthly_price_cents bigint check (monthly_price_cents >= 0),
  yearly_price_cents bigint check (yearly_price_cents >= 0),
  bank_connections_limit integer not null check (bank_connections_limit >= 0),
  ai_messages_per_month integer not null check (ai_messages_per_month >= 0),
  -- null = no limit.
  price_alerts_limit integer check (price_alerts_limit >= 0),
  has_investments boolean not null default false,
  has_report_export boolean not null default false,
  has_simulator boolean not null default false,
  has_priority_support boolean not null default false,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

insert into public.plans (
  id, name, monthly_price_cents, yearly_price_cents, bank_connections_limit,
  ai_messages_per_month, price_alerts_limit, has_investments, has_report_export, has_simulator,
  has_priority_support, sort_order
) values
  ('essential', 'Essencial', null, null, 1, 30, 3, false, false, false, false, 1),
  ('complete', 'Completo', 1990, 19900, 3, 300, null, true, true, true, false, 2),
  ('extended', 'Ampliado', 3490, 34900, 8, 1000, null, true, true, true, true, 3);

-- Profiles ------------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text check (char_length(name) between 1 and 80),
  avatar_url text,
  auth_provider public.auth_provider not null default 'email',
  plan_id text not null default 'essential' references public.plans (id),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_plan_id_idx on public.profiles (plan_id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Categories ----------------------------------------------------------------------------------

create table public.categories (
  id text primary key check (id ~ '^[a-z_]+$'),
  -- pt-BR label, e.g. "Alimentação".
  label text not null,
  -- Icon name in kebab case; null where the design has not defined one yet.
  icon text check (icon ~ '^[a-z0-9-]+$'),
  kind public.category_kind not null,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.subcategories (
  id text primary key check (id ~ '^[a-z_]+$'),
  category_id text not null references public.categories (id),
  label text not null,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subcategories_category_id_idx on public.subcategories (category_id);

create trigger subcategories_updated_at before update on public.subcategories
  for each row execute function public.set_updated_at();

insert into public.categories (id, label, icon, kind, sort_order) values
  ('housing', 'Moradia', 'home', 'expense', 1),
  ('bills', 'Contas da casa', null, 'expense', 2),
  ('food', 'Alimentação', 'tag', 'expense', 3),
  ('transport', 'Transporte', 'car', 'expense', 4),
  ('health', 'Saúde', null, 'expense', 5),
  ('education', 'Educação', null, 'expense', 6),
  ('leisure', 'Lazer', 'star', 'expense', 7),
  ('shopping', 'Compras', null, 'expense', 8),
  ('electronics', 'Eletrônicos', null, 'expense', 9),
  ('home', 'Casa', null, 'expense', 10),
  ('subscriptions', 'Assinaturas', 'repeat', 'expense', 11),
  ('travel', 'Viagens', null, 'expense', 12),
  ('pets', 'Pets', null, 'expense', 13),
  ('personal_care', 'Cuidados pessoais', null, 'expense', 14),
  ('taxes', 'Impostos e taxas', null, 'expense', 15),
  ('transfers', 'Transferências', null, 'transfer', 16),
  ('investments', 'Investimentos', null, 'transfer', 17),
  ('salary', 'Salário', null, 'income', 18),
  ('other_income', 'Entrada', null, 'income', 19),
  ('other', 'Outros', null, 'expense', 20);

insert into public.subcategories (id, category_id, label, sort_order) values
  ('restaurants', 'food', 'Restaurantes e delivery', 1),
  ('groceries', 'food', 'Mercado', 2),
  ('bakery', 'food', 'Padaria e café', 3);

-- Notification settings -----------------------------------------------------------------------

create table public.notification_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  -- null = the account e-mail.
  email_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_settings_updated_at before update on public.notification_settings
  for each row execute function public.set_updated_at();

create table public.notification_type_settings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  push boolean not null default true,
  email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, type)
);

create trigger notification_type_settings_updated_at before update
  on public.notification_type_settings
  for each row execute function public.set_updated_at();

-- New users -----------------------------------------------------------------------------------

-- Every sign-up gets a profile (Essencial plan) and notification settings.
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
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- A changed login e-mail follows to the profile.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Trigger functions are not callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Row level security --------------------------------------------------------------------------

alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_type_settings enable row level security;

-- Reference data: readable by signed-in users.
create policy "plans are readable" on public.plans
  for select to authenticated using (true);
create policy "categories are readable" on public.categories
  for select to authenticated using (true);
create policy "subcategories are readable" on public.subcategories
  for select to authenticated using (true);

-- Own rows only. Profiles are created by the trigger and deleted with the auth user.
create policy "own profile is readable" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "own profile is editable" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own notification settings" on public.notification_settings
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own notification type settings" on public.notification_type_settings
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
