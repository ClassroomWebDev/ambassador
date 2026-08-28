import { z } from "zod";

export const createSchema = z.object({
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

export const statusSchema = z.object({
  user_id: z.string().uuid(),
  status: z.enum(["active", "held"]),
});

export async function assertStaff(supabase: {
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

