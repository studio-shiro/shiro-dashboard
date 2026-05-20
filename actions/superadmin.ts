"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBusinessSchema } from "@/lib/validations/superadmin";
import { sendInviteEmail } from "@/lib/email";

export async function createBusinessWithOwnerAction(formData: FormData) {
  const parsed = createBusinessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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

  // 2. Generate the invite link without sending Supabase's default email.
  //    This creates the user in auth.users and returns the action link.
  //    The handle_new_user trigger fires here and creates the business_members row.
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "invite",
      email: parsed.data.owner_email,
      options: {
        data: {
          business_id: business.id,
          role: "owner",
          full_name: parsed.data.owner_name,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/set-password`,
      },
    });

  if (linkError || !linkData.properties) {
    await admin.from("businesses").delete().eq("id", business.id);
    return { error: linkError?.message ?? "Error al generar el enlace de invitación" };
  }

  // 3. Send our branded invite email via Resend.
  const { error: emailError } = await sendInviteEmail({
    recipientName: parsed.data.owner_name,
    recipientEmail: parsed.data.owner_email,
    businessName: parsed.data.business_name,
    actionLink: linkData.properties.action_link,
  });

  if (emailError) {
    // Roll back both the business and the newly created auth user.
    await Promise.all([
      admin.from("businesses").delete().eq("id", business.id),
      admin.auth.admin.deleteUser(linkData.user.id),
    ]);
    return { error: "Error al enviar el email de invitación" };
  }

  revalidatePath("/superadmin");
  return { success: true };
}
