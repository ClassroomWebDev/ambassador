import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/types";
import type { Database } from "@/integrations/supabase/types";

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type ClassSession = Database["public"]["Tables"]["class_sessions"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];

export type TeamMember = {
  id: string;
  full_name: string;
  mobile: string | null;
  designation: string | null;
  learning_points: number;
  leadership_points: number;
};

export const isStaffRole = (role: AppRole | undefined) => role === "admin" || role === "support_manager";
export const canTakeAttendance = (role: AppRole | undefined) =>
  isStaffRole(role) || role === "coordinator" || role === "mentor";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ["class-sessions"],
    queryFn: async (): Promise<ClassSession[]> => {
      const { data, error } = await supabase
        .from("class_sessions")
        .select("*")
        .order("session_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Ambassadors (or members) assigned to the signed-in supervisor. */
export function useTeam() {
  return useQuery({
    queryKey: ["my-team"],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, mobile, designation, learning_points, leadership_points")
        .or(`coordinator_id.eq.${uid},mentor_id.eq.${uid},support_manager_id.eq.${uid}`)
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });
}

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from("attendances")
        .select("id, present, created_at, session_id, class_sessions(title, session_date, courses(name, learning_points_per_class))")
        .eq("ambassador_id", uid);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSessionAttendance(sessionId: string | null) {
  return useQuery({
    queryKey: ["session-attendance", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendances")
        .select("ambassador_id, present")
        .eq("session_id", sessionId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}
