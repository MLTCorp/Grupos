-- Billing schema for Stripe integration
-- This migration creates tables for customers, products, prices, and subscriptions

-- Enum types
create type subscription_status as enum (
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused'
);

create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');

-- Customers table (links auth.users to Stripe)
create table customers (
  id uuid references auth.users not null primary key,
  stripe_customer_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table customers enable row level security;
create policy "Users can view own customer data" on customers for select using (auth.uid() = id);

-- Products table (synced from Stripe)
create table products (
  id text primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);
alter table products enable row level security;
create policy "Allow public read-only access" on products for select using (true);

-- Prices table (synced from Stripe)
create table prices (
  id text primary key,
  product_id text references products,
  active boolean,
  description text,
  unit_amount bigint,
  currency text check (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);
alter table prices enable row level security;
create policy "Allow public read-only access" on prices for select using (true);

-- Subscriptions table (synced from Stripe)
create table subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  status subscription_status,
  metadata jsonb,
  price_id text references prices,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone
);
alter table subscriptions enable row level security;
create policy "Users can view own subscription data" on subscriptions for select using (auth.uid() = user_id);

-- Index for faster subscription lookups
create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_status_idx on subscriptions(status);
