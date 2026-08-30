export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendances: {
        Row: {
          ambassador_id: string
          created_at: string
          id: string
          marked_by: string | null
          present: boolean
          session_id: string
          updated_at: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          id?: string
          marked_by?: string | null
          present?: boolean
          session_id: string
          updated_at?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          id?: string
          marked_by?: string | null
          present?: boolean
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          session_date: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          session_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          session_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          ambassador_price: number
          class_quantity: number
          coordinator_price: number
          created_at: string
          created_by: string | null
          details: string | null
          has_certificate: boolean
          id: string
          leadership_points_per_sale: number
          learning_points_per_class: number
          mission: string | null
          name: string
          regular_price: number
          student_price: number
          updated_at: string
        }
        Insert: {
          ambassador_price?: number
          class_quantity?: number
          coordinator_price?: number
          created_at?: string
          created_by?: string | null
          details?: string | null
          has_certificate?: boolean
          id?: string
          leadership_points_per_sale?: number
          learning_points_per_class?: number
          mission?: string | null
          name: string
          regular_price?: number
          student_price?: number
          updated_at?: string
        }
        Update: {
          ambassador_price?: number
          class_quantity?: number
          coordinator_price?: number
          created_at?: string
          created_by?: string | null
          details?: string | null
          has_certificate?: boolean
          id?: string
          leadership_points_per_sale?: number
          learning_points_per_class?: number
          mission?: string | null
          name?: string
          regular_price?: number
          student_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          alt_mobile: string | null
          auto_id: string | null
          blood_group: string | null
          coordinator_id: string | null
          created_at: string
          date_of_birth: string | null
          designation: string | null
          facebook_link: string | null
          father_name: string | null
          favourite_book: string | null
          favourite_movies: string | null
          favourite_person: string | null
          favourite_place: string | null
          favourite_teacher: string | null
          full_name: string
          hobby: string | null
          home_district: string | null
          id: string
          idol: string | null
          institution: string | null
          leadership_points: number
          learning_points: number
          mentor_id: string | null
          mobile: string
          mother_name: string | null
          photo_url: string | null
          religion: string | null
          status: Database["public"]["Enums"]["account_status"]
          support_manager_id: string | null
          ultimate_goal: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          alt_mobile?: string | null
          auto_id?: string | null
          blood_group?: string | null
          coordinator_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          facebook_link?: string | null
          father_name?: string | null
          favourite_book?: string | null
          favourite_movies?: string | null
          favourite_person?: string | null
          favourite_place?: string | null
          favourite_teacher?: string | null
          full_name?: string
          hobby?: string | null
          home_district?: string | null
          id: string
          idol?: string | null
          institution?: string | null
          leadership_points?: number
          learning_points?: number
          mentor_id?: string | null
          mobile?: string
          mother_name?: string | null
          photo_url?: string | null
          religion?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          support_manager_id?: string | null
          ultimate_goal?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          alt_mobile?: string | null
          auto_id?: string | null
          blood_group?: string | null
          coordinator_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          facebook_link?: string | null
          father_name?: string | null
          favourite_book?: string | null
          favourite_movies?: string | null
          favourite_person?: string | null
          favourite_place?: string | null
          favourite_teacher?: string | null
          full_name?: string
          hobby?: string | null
          home_district?: string | null
          id?: string
          idol?: string | null
          institution?: string | null
          leadership_points?: number
          learning_points?: number
          mentor_id?: string | null
          mobile?: string
          mother_name?: string | null
          photo_url?: string | null
          religion?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          support_manager_id?: string | null
          ultimate_goal?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_support_manager_id_fkey"
            columns: ["support_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      program_settings: {
        Row: {
          created_at: string
          id: boolean
          org_address: string | null
          org_facebook: string | null
          org_helpline: string | null
          org_name: string
          org_website: string | null
          season_start: string
          season_target_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: boolean
          org_address?: string | null
          org_facebook?: string | null
          org_helpline?: string | null
          org_name?: string
          org_website?: string | null
          season_start?: string
          season_target_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: boolean
          org_address?: string | null
          org_facebook?: string | null
          org_helpline?: string | null
          org_name?: string
          org_website?: string | null
          season_start?: string
          season_target_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      prospects: {
        Row: {
          ambassador_id: string
          created_at: string
          facebook_link: string | null
          id: string
          mobile: string
          name: string
          note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          facebook_link?: string | null
          id?: string
          mobile: string
          name: string
          note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          facebook_link?: string | null
          id?: string
          mobile?: string
          name?: string
          note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospects_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          ambassador_id: string
          amount: number
          approved_at: string | null
          approved_by: string | null
          course_id: string
          created_at: string
          id: string
          invoice_no: string | null
          order_no: string | null
          payment_method: string
          payment_ref: string | null
          status: Database["public"]["Enums"]["sale_status"]
          student_email: string | null
          student_institution: string | null
          student_mobile: string
          student_name: string
          submitted_by: string | null
          tx_id: string | null
          updated_at: string
        }
        Insert: {
          ambassador_id: string
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          course_id: string
          created_at?: string
          id?: string
          invoice_no?: string | null
          order_no?: string | null
          payment_method: string
          payment_ref?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          student_email?: string | null
          student_institution?: string | null
          student_mobile: string
          student_name: string
          submitted_by?: string | null
          tx_id?: string | null
          updated_at?: string
        }
        Update: {
          ambassador_id?: string
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          course_id?: string
          created_at?: string
          id?: string
          invoice_no?: string | null
          order_no?: string | null
          payment_method?: string
          payment_ref?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          student_email?: string | null
          student_institution?: string | null
          student_mobile?: string
          student_name?: string
          submitted_by?: string | null
          tx_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_downstream: { Args: { _profile_id: string }; Returns: boolean }
      is_my_ambassador: { Args: { _profile_id: string }; Returns: boolean }
      is_my_supervisor: { Args: { _profile_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      leaderboard_ambassadors: {
        Args: { _limit?: number }
        Returns: {
          auto_id: string
          full_name: string
          institution: string
          leadership_points: number
          learning_points: number
          rank: number
          total_points: number
          user_id: string
        }[]
      }
      leaderboard_coordinators: {
        Args: { _limit?: number }
        Returns: {
          auto_id: string
          full_name: string
          institution: string
          rank: number
          sales_amount: number
          sales_count: number
          user_id: string
        }[]
      }
      leaderboard_top: {
        Args: { _limit?: number }
        Returns: {
          auto_id: string
          full_name: string
          institution: string
          leadership_points: number
          learning_points: number
          rank: number
          total_points: number
          user_id: string
        }[]
      }
      my_leaderboard_rank: {
        Args: never
        Returns: {
          leader_points: number
          rank: number
          total_points: number
        }[]
      }
      next_auto_id: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      recalc_points: { Args: { _user_id: string }; Returns: undefined }
      role_prefix: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
    }
    Enums: {
      account_status: "active" | "held"
      app_role:
        | "ambassador"
        | "coordinator"
        | "mentor"
        | "support_manager"
        | "admin"
      sale_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "held"],
      app_role: [
        "ambassador",
        "coordinator",
        "mentor",
        "support_manager",
        "admin",
      ],
      sale_status: ["pending", "approved", "rejected"],
    },
  },
} as const
