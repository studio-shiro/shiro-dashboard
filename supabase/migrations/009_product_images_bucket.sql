-- Product images bucket for wizard and product detail uploads.
-- Public bucket so images can be served directly via URL without signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "authenticated users can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "authenticated users can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "authenticated users can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
