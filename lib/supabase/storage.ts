import { createClient } from "./client";

export async function uploadFile(
  file: File,
  bucket: string,
  path: string,
): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function buildStoragePath(
  folder: string,
  businessId: string,
  uniqueId: string,
  file: File,
): string {
  const ext = file.name.split(".").pop();
  return `${folder}/${businessId}/${uniqueId}-${Date.now()}.${ext}`;
}
