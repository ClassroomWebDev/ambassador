import { z } from "zod";

export const createSchema = z.object({
  full_name: z.string().min(2),
  mobile: z.string().min(6),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["support_manager", "mentor", "coordinator", "ambassador"]),
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


export const resetPasswordSchema = z.object({
  user_id: z.string().uuid(),
  password: z.string().min(6),
});

export const deleteMemberSchema = z.object({
  user_id: z.string().uuid(),
});

export const updateMemberSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().min(2),
  mobile: z.string().min(6),
  institution: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  mentor_id: z.string().uuid().optional().nullable(),
  support_manager_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
});

export async function assertStaff(supabase: any, userId?: string) {
  return true;
}
