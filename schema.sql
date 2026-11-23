create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null default 'Nouveau membre',
 role text not null default 'Mannequin' check (role in ('Mannequin','Photographe','Styliste','Make-up artist')),
 city text not null default '',
 bio text not null default '',
 instagram text,
 created_at timestamptz not null default now()
);
create table if not exists public.shooting_requests (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id) on delete cascade,
 receiver_id uuid not null references public.profiles(id) on delete cascade,
 message text not null default '',
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 check(sender_id <> receiver_id)
);
alter table public.profiles enable row level security;
alter table public.shooting_requests enable row level security;
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Members create own profile" on public.profiles for insert with check (auth.uid()=id);
create policy "Members update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
create policy "Participants see requests" on public.shooting_requests for select using (auth.uid()=sender_id or auth.uid()=receiver_id);
create policy "Members send requests" on public.shooting_requests for insert with check (auth.uid()=sender_id);
create policy "Receiver updates request" on public.shooting_requests for update using (auth.uid()=receiver_id) with check (auth.uid()=receiver_id);
