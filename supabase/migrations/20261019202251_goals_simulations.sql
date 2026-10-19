-- Part 5 · Goals and simulator: saved simulations, goals (optionally created from a simulation)
-- and the movements of each goal. Mirrors goal.ts and simulation.ts of @guara/types.
--
-- Pace, projections and milestones are computed by the API from these rows. Own rows readable;
-- writes through the API (service role).

create type public.simulation_mode as enum ('retirement', 'goal', 'cut_expense');
create type public.goal_status as enum ('active', 'paused', 'achieved', 'archived');
create type public.goal_movement_kind as enum ('deposit', 'yield', 'withdrawal');

-- Simulations ----------------------------------------------------------------------------------

create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode public.simulation_mode not null,
  name text not null check (char_length(name) between 1 and 80),
  -- Inputs of the mode (RetirementInputs, GoalInputs or CutExpenseInputs), validated by the API.
  inputs jsonb not null check (jsonb_typeof(inputs) = 'object'),
  -- SimulationResult at save time (points, final balance, required contribution…).
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index simulations_user_created_idx on public.simulations (user_id, created_at desc);

create trigger simulations_updated_at before update on public.simulations
  for each row execute function public.set_updated_at();

-- Goals ----------------------------------------------------------------------------------------

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  -- Short explanation of the amount ("6 meses de custo de vida").
  note text check (char_length(note) between 1 and 120),
  target_cents bigint not null check (target_cents > 0),
  -- Sum of the goal's movements, kept by a trigger.
  saved_cents bigint not null default 0 check (saved_cents >= 0),
  -- First day of the deadline month.
  deadline date check (extract(day from deadline) = 1),
  status public.goal_status not null default 'active',
  -- Where the money is kept ("Tesouro Selic 2029 · Itaú") and its estimated net monthly yield.
  storage_label text check (char_length(storage_label) between 1 and 120),
  storage_monthly_yield_percent numeric(6, 3) check (storage_monthly_yield_percent >= 0),
  monthly_deposit_cents bigint check (monthly_deposit_cents > 0),
  deposit_day smallint check (deposit_day between 1 and 28),
  first_deposit_on date,
  -- The Onça follows the goal (pace warnings, milestones).
  watched boolean not null default true,
  -- Push reminder on the deposit day.
  deposit_reminder boolean not null default false,
  -- Simulation the goal was created from; one goal per simulation.
  simulation_id uuid unique,
  achieved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (simulation_id, user_id)
    references public.simulations (id, user_id) on delete set null (simulation_id),
  -- An archived goal keeps achieved_at when it had been reached.
  check (status <> 'achieved' or achieved_at is not null),
  check ((status = 'archived') = (archived_at is not null)),
  check (storage_monthly_yield_percent is null or storage_label is not null),
  check (deposit_day is null or monthly_deposit_cents is not null),
  check (deposit_reminder = false or deposit_day is not null)
);

create index goals_user_id_idx on public.goals (user_id) where status <> 'archived';
create index goals_simulation_id_user_id_idx on public.goals (simulation_id, user_id);
-- Deposit reminders of the day.
create index goals_deposit_day_idx on public.goals (deposit_day)
  where deposit_reminder and status = 'active';

create trigger goals_updated_at before update on public.goals
  for each row execute function public.set_updated_at();

-- Money in and out of a goal. The starting balance is recorded as a first deposit.
create table public.goal_movements (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  user_id uuid not null,
  kind public.goal_movement_kind not null,
  -- "Depósito mensal", "Resgate · conserto do carro".
  label text not null check (char_length(label) between 1 and 80),
  date date not null,
  -- Signed: deposits and yields positive, withdrawals negative.
  amount_cents bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals (id, user_id) on delete cascade,
  check (
    (kind = 'withdrawal' and amount_cents < 0)
    or (kind = 'deposit' and amount_cents > 0)
    or (kind = 'yield' and amount_cents <> 0)
  )
);

create index goal_movements_goal_id_user_id_idx on public.goal_movements (goal_id, user_id);
create index goal_movements_goal_date_idx on public.goal_movements (goal_id, date desc);

create trigger goal_movements_updated_at before update on public.goal_movements
  for each row execute function public.set_updated_at();

-- goals.saved_cents = sum of its movements. A withdrawal larger than the balance fails on the
-- saved_cents check.
create or replace function public.sync_goal_saved()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    update public.goals set saved_cents = saved_cents - old.amount_cents where id = old.goal_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update public.goals set saved_cents = saved_cents + new.amount_cents where id = new.goal_id;
  end if;
  return null;
end;
$$;

create trigger goal_movements_saved after insert or update of amount_cents, goal_id or delete
  on public.goal_movements
  for each row execute function public.sync_goal_saved();

revoke execute on function public.sync_goal_saved() from public, anon, authenticated;

-- Row level security ---------------------------------------------------------------------------

alter table public.simulations enable row level security;
alter table public.goals enable row level security;
alter table public.goal_movements enable row level security;

create policy "own simulations are readable" on public.simulations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own goals are readable" on public.goals
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own goal movements are readable" on public.goal_movements
  for select to authenticated using ((select auth.uid()) = user_id);
