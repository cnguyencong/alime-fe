
-- 1. Bảng USER_PREFERENCES (Lưu cài đặt người dùng)
-- Quan hệ 1-1 với auth.users
create table public.user_preferences (
  user_id uuid references auth.users not null primary key, -- Dùng user_id làm khóa chính luôn
  currency text default 'VND',
  notify_before_days integer default 1, -- Mặc định nhắc trước 1 ngày
  enable_push_notifications boolean default true,
  enable_email_digest boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật RLS
alter table public.user_preferences enable row level security;

-- Policy: Người dùng chỉ được xem/sửa setting của chính mình
create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);
-- Không cần policy INSERT/DELETE vì ta sẽ dùng Trigger tự động (xem bên dưới)

---

-- 2. Bảng EMAIL_SYNC_LOGS (Lịch sử quét email)
-- Giúp debug và giới hạn tần suất quét (ví dụ: chỉ cho quét 1 lần/ngày)
create table public.email_sync_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  status text check (status in ('success', 'failed', 'partial')),
  emails_scanned_count integer default 0,
  subscriptions_found_count integer default 0,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật RLS
alter table public.email_sync_logs enable row level security;

-- Policy: Người dùng xem log của mình (để hiển thị trạng thái "Last synced: 2 mins ago")
create policy "Users can view own sync logs" on public.email_sync_logs
  for select using (auth.uid() = user_id);

-- Policy: Cho phép thêm log mới (từ App hoặc Edge Function)
create policy "Users can insert own sync logs" on public.email_sync_logs
  for insert with check (auth.uid() = user_id);

---

-- 3. Bảng NOTIFICATION_HISTORY (Lịch sử thông báo)
-- Hiển thị trong tab "Notifications" của App
create table public.notification_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  subscription_id uuid references public.subscriptions(id) on delete set null, -- Nếu xóa sub, lịch sử vẫn còn (nhưng sub_id null)
  title text not null,
  body text not null,
  is_read boolean default false,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật RLS
alter table public.notification_history enable row level security;

create policy "Users can view own notifications" on public.notification_history
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notification_history
  for update using (auth.uid() = user_id); -- Để update trạng thái is_read = true