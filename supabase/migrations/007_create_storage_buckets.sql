-- Public repository for company and brand logos.
-- “public = true” allows images to be served directly via URL without the need for signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos',
  'logos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Any authenticated user can upload files to the bucket.
create policy "authenticated users can upload logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos');

-- Public access (the bucket is public, but the policy is required for RLS).
create policy "logos are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'logos');

-- Authenticated users can update or delete (upsert) their own files.
create policy "authenticated users can update logos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos');

-- Authenticated users can delete files from the bucket.
create policy "authenticated users can delete logos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos');
