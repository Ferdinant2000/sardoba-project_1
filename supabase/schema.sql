-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  telegram_id bigint unique,
  username text,
  name text,
  role text check (role in ('DEVELOPER', 'ADMIN', 'STAFF', 'user', 'GUEST')) default 'user',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  sku text,
  name text not null,
  category text,
  price numeric not null default 0,
  cost numeric default 0,
  stock numeric default 0,
  min_stock numeric default 5,
  unit text default 'pcs',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clients Table
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  company_name text,
  email text,
  phone text,
  balance numeric default 0,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id),
  staff_id uuid references public.users(id), -- User who processed the order
  total_amount numeric not null,
  status text default 'completed',
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity numeric not null,
  price_at_sale numeric not null
);

-- Stock Movements Table
create table if not exists public.stock_movements (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id),
  type text check (type in ('restock', 'sale', 'adjustment', 'return')),
  quantity numeric not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Examples - To be Refined)
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.clients enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;

-- Allow read access to all for now (Adjust based on requirements)
create policy "Allow public read access" on public.products for select using (true);

-- Functions
-- (Optional) Function to handle user creation if not exists matches the application logic
