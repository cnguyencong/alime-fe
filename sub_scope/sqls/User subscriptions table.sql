
-- Tạo bảng subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  price numeric not null,
  currency text default 'VND',
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  start_date date not null,
  next_billing_date date, -- Có thể dùng Trigger để tự tính
  source text default 'manual' check (source in ('manual', 'gmail_scan')),
  logo_url text,
  email_message_id text, -- ID của email gốc để tránh trùng lặp
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật bảo mật RLS
alter table public.subscriptions enable row level security;

-- Policy (Người dùng chỉ thấy dữ liệu của mình)
create policy "Users can CRUD own subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id);