create table business_product_columns (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  column_key  text not null,
  enabled     boolean not null default true,
  sort_order  integer,
  created_at  timestamptz default now(),
  unique (business_id, column_key)
);

alter table business_product_columns enable row level security;

create policy "users access own product columns" on business_product_columns
  for all to authenticated
  using  (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid)
  with check (business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid);
