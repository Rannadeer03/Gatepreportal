-- Create the avatars bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop policies if they already exist (safe for repeated runs)
drop policy if exists "Public read access to avatars" on storage.objects;
drop policy if exists "Authenticated users can upload to avatars" on storage.objects;

-- Policy: Allow anyone to read files in the avatars bucket
create policy "Public read access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Policy: Allow authenticated users to upload to avatars
create policy "Authenticated users can upload to avatars"
  on storage.objects for insert
  to authenticated
  using (bucket_id = 'avatars'); 