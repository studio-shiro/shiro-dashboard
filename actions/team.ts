"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validations/team";

const OWNER_ROLES = ["owner", "superadmin"] as const;

export async function inviteTeamMemberAction(formData: FormData) {
  const parsed = inviteMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const role = user.user_metadata?.role as string;
  if (!OWNER_ROLES.includes(role as (typeof OWNER_ROLES)[number]))
    return { error: "No tenés permiso para invitar miembros" };

  const businessId = user.user_metadata?.business_id as string;
  const admin = createAdminClient();

  // Creates the user in auth.users immediately and sends the invite email.
  // The metadata is embedded in the JWT when they accept and log in.
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: {
        business_id: businessId,
        role: parsed.data.role,
        full_name: parsed.data.full_name,
      },
    });
  if (inviteError) return { error: inviteError.message };

  // Upsert instead of insert: the INSERT trigger on auth.users may have
  // already created the row. ignoreDuplicates avoids a conflict error.
  const { error: dbError } = await supabase.from("business_members").upsert(
    {
      user_id: invited.user.id,
      business_id: businessId,
      email: parsed.data.email,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      status: "pending",
    },
    { onConflict: "business_id,user_id", ignoreDuplicates: true },
  );
  if (dbError) return { error: dbError.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function updateMemberRoleAction(formData: FormData) {
  const parsed = updateMemberRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const role = user.user_metadata?.role as string;
  if (!OWNER_ROLES.includes(role as (typeof OWNER_ROLES)[number]))
    return { error: "No tenés permiso para cambiar roles" };

  const { data: member, error: fetchError } = await supabase
    .from("business_members")
    .select("user_id")
    .eq("id", parsed.data.member_id)
    .single();
  if (fetchError || !member) return { error: "Miembro no encontrado" };

  if (member.user_id === user.id)
    return { error: "No podés cambiar tu propio rol" };

  const admin = createAdminClient();

  // Fetch current metadata to avoid overwriting other fields.
  const { data: targetData } = await admin.auth.admin.getUserById(
    member.user_id,
  );
  const existingMeta = targetData?.user?.user_metadata ?? {};

  const [{ error: dbError }] = await Promise.all([
    supabase
      .from("business_members")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.member_id),
    admin.auth.admin.updateUserById(member.user_id, {
      user_metadata: { ...existingMeta, role: parsed.data.role },
    }),
  ]);
  if (dbError) return { error: dbError.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function revokeMemberAccessAction(memberId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const role = user.user_metadata?.role as string;
  if (!OWNER_ROLES.includes(role as (typeof OWNER_ROLES)[number]))
    return { error: "No tenés permiso para revocar acceso" };

  const { data: member, error: fetchError } = await supabase
    .from("business_members")
    .select("user_id, status")
    .eq("id", memberId)
    .single();
  if (fetchError || !member) return { error: "Miembro no encontrado" };
  if (member.user_id === user.id)
    return { error: "No podés revocar tu propio acceso" };
  if (member.status === "revoked")
    return { error: "El acceso ya está revocado" };

  const admin = createAdminClient();

  // Fetch current metadata to merge cleanly.
  const { data: targetData } = await admin.auth.admin.getUserById(
    member.user_id,
  );
  const existingMeta = targetData?.user?.user_metadata ?? {};

  // Remove business access from JWT metadata — effective on next getUser() call.
  await admin.auth.admin.updateUserById(member.user_id, {
    user_metadata: { ...existingMeta, business_id: null, role: "revoked" },
  });

  // Mark as revoked in business_members (RLS enforces owner check).
  const { error: dbError } = await supabase
    .from("business_members")
    .update({ status: "revoked" })
    .eq("id", memberId);
  if (dbError) return { error: dbError.message };

  revalidatePath("/settings");
  return { success: true };
}
