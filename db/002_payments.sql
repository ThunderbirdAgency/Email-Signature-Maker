-- Payments: credits, purchases and the paid flag on a signature.
--
-- Money movement is recorded as an append-only ledger rather than a mutable
-- balance column. A balance is then sum(delta), which cannot be corrupted by
-- two concurrent writes racing on a read-modify-write, and every change stays
-- auditable — which is what you want the first time a customer asks why they
-- have the number of credits they have.

alter table smartstamp.signatures
  add column if not exists paid boolean not null default false,
  add column if not exists paid_at timestamptz;

create table if not exists smartstamp.purchases (
  id                text primary key,
  user_id           text not null references smartstamp.users(id) on delete cascade,
  -- Stripe's session id. Unique, so replaying a webhook cannot double-credit.
  stripe_session_id text unique,
  credits           integer not null,
  amount_cents      integer not null,
  currency          text not null default 'USD',
  created_at        timestamptz not null default now()
);

create index if not exists purchases_user_created_idx
  on smartstamp.purchases (user_id, created_at desc);

create table if not exists smartstamp.credit_ledger (
  id           text primary key,
  user_id      text not null references smartstamp.users(id) on delete cascade,
  -- Positive when credits are granted, negative when one is spent.
  delta        integer not null,
  reason       text not null check (reason in ('purchase', 'bonus', 'unlock', 'adjustment')),
  signature_id text,
  purchase_id  text,
  created_at   timestamptz not null default now()
);

create index if not exists credit_ledger_user_idx
  on smartstamp.credit_ledger (user_id, created_at desc);

-- One bonus grant per rolling window; the partial index makes "has this user
-- already had a bonus" a cheap lookup.
create index if not exists credit_ledger_bonus_idx
  on smartstamp.credit_ledger (user_id, created_at desc)
  where reason = 'bonus';

alter table smartstamp.purchases     enable row level security;
alter table smartstamp.credit_ledger enable row level security;
