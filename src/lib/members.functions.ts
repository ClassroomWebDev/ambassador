import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSchema = z.object({
  full_name: z.string().min(2),
  mobile: z.string().min(6),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["mentor", "coordinator", "ambassador"]),
  institution: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  mentor_id: z.string().uuid().optional().nullable(),
  support_manager_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
});

const statusSchema = z.object({
  user_id: z.string().uuid(),
  status: z.enum(["active", "held"]),
});

async function assertStaff(supabase: {
  from: (t: "user_roles") => {
    select: (c: string) => { eq: (c: string, v: string) => Promise<{ data: { role: string }[] | null }> };
  };
}, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin") && !roles.includes("support_manager")) {
    throw new Error("Only admins and managers can manage members");
  }
}

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select(
          "id, auto_id, full_name, mobile, status, institution, designation, mentor_id, coordinator_id, support_manager_id, learning_points, leadership_points",
        )
        .order("auto_id"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    if (error) throw new Error(error.message);
    const roleMap = new Map<string, string>();
    for (const r of roles ?? []) roleMap.set(r.user_id, r.role);
    return (profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.id) ?? "ambassador" }));
  });

export const createMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase as never, context.userId);
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
    await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiles").update({ status: data.status }).eq("id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
