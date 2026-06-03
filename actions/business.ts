"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const logoSchema = z.object({ logo_url: z.string().url() });

export async function updateBusinessLogoAction(logoUrl: string) {
  const parsed = logoSchema.safeParse({ logo_url: logoUrl });
  if (!parsed.success) return { error: "URL inválida" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("businesses")
    .update({ logo_url: parsed.data.logo_url })
    .eq("id", user.user_metadata.business_id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
