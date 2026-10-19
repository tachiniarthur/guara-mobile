-- Part 2 · covering indexes for the composite (id, user_id) foreign keys.
create index bank_accounts_connection_id_user_id_idx
  on public.bank_accounts (connection_id, user_id);
create index consent_charges_connection_id_user_id_idx
  on public.consent_charges (connection_id, user_id);
create index transactions_account_id_user_id_idx
  on public.transactions (account_id, user_id);
