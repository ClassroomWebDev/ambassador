import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertStaff,
  createSchema,
  statusSchema,
  resetPasswordSchema,
  deleteMemberSchema,
  updateMemberSchema,
} from "./members.server";

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles, error }, { data: roles }, authUsers] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select(
          "id, auto_id, full_name, mobile, status, institution, designation, mentor_id, coordinator_id, support_manager_id, learning_points, leadership_points, created_at",
        )
        .order("auto_id"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (error) throw new Error(error.message);
    const roleMap = new Map<string, string>();
    for (const r of roles ?? []) roleMap.set(r.user_id, r.role);
    const emailMap = new Map<string, string>();
    for (const u of authUsers.data?.users ?? []) if (u.email) emailMap.set(u.id, u.email);
    return (profiles ?? []).map((p) => ({
      ...p,
      role: roleMap.get(p.id) ?? "ambassador",
      email: emailMap.get(p.id) ?? null,
    }));
  });

export const updateMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateMemberSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { user_id, ...rest } = data;
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: rest.full_name,
        mobile: rest.mobile,
        institution: rest.institution ?? null,
        designation: rest.designation ?? null,
        mentor_id: rest.mentor_id ?? null,
        support_manager_id: rest.support_manager_id ?? null,
        coordinator_id: rest.coordinator_id ?? null,
      })
      .eq("id", user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    // await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, mobile: data.mobile },
    });
    if (createErr || !created.user) throw new Error(createErr?.message ?? "Could not create the member");
    const uid = created.user.id;

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: uid, role: data.role }, { onConflict: "user_id,role" });
    if (roleErr) throw new Error(roleErr.message);
    if (data.role !== "ambassador") {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", uid).eq("role", "ambassador");
    }

    const { data: autoId } = await supabaseAdmin.rpc("next_auto_id", { _role: data.role });

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.full_name,
        mobile: data.mobile,
        institution: data.institution ?? null,
        designation: data.designation ?? null,
        mentor_id: data.mentor_id ?? null,
        support_manager_id: data.support_manager_id ?? null,
        coordinator_id: data.role === "ambassador" ? (data.coordinator_id ?? null) : null,
        ...(autoId ? { auto_id: autoId as string } : {}),
      })
      .eq("id", uid);
    if (profileErr) throw new Error(profileErr.message);

    return { id: uid, auto_id: (autoId as string | null) ?? null };
  });

export const setMemberStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    // await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiles").update({ status: data.status }).eq("id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function hasRole(
  supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" | "support_manager" }) => Promise<{ data: boolean | null }> },
  userId: string,
  role: "admin" | "support_manager",
) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
  return data === true;
}

export const resetUserPassword = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => resetPasswordSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const [isAdmin, isManager] = await Promise.all([
      hasRole(context.supabase as never, context.userId, "admin"),
      hasRole(context.supabase as never, context.userId, "support_manager"),
    ]);
    if (!isAdmin && !isManager) throw new Error("Only admins and managers can reset passwords");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteMemberSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const isAdmin = await hasRole(context.supabase as never, context.userId, "admin");
    if (!isAdmin) throw new Error("Only admins can delete members");
    if (data.user_id === context.userId) throw new Error("You cannot delete your own account");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (authErr) throw new Error(authErr.message);
    const { error: profileErr } = await supabaseAdmin.from("profiles").delete().eq("id", data.user_id);
    if (profileErr) throw new Error(profileErr.message);
    return { ok: true };
  });
