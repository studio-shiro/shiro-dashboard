"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBusinessSchema } from "@/lib/validations/superadmin";

export async function createBusinessWithOwnerAction(formData: FormData) {
  const parsed = createBusinessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // Auth check — regular client is enough to verify identity and role.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (user.user_metadata?.role !== "superadmin") return { error: "Forbidden" };

  const admin = createAdminClient();

  // 1. Create the business row (admin client bypasses RLS).
  const { data: business, error: bizError } = await admin
    .from("businesses")
    .insert({
      name: parsed.data.business_name,
      currency: parsed.data.currency,
      contact_email: parsed.data.owner_email,
    })
    .select("id")
    .single();
  if (bizError || !business)
    return { error: bizError?.message ?? "Error al crear el negocio" };

  // 2. Invite the owner — the INSERT trigger on auth.users will auto-create
  //    the business_members row with status 'pending'.
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.owner_email,
    {
      data: {
        business_id: business.id,
        role: "owner",
        full_name: parsed.data.owner_name,
      },
    },
  );

  if (inviteError) {
    // Roll back the business so we don't leave orphaned rows.
    await admin.from("businesses").delete().eq("id", business.id);
    return { error: inviteError.message };
  }

  revalidatePath("/superadmin");
  return { success: true };
}
