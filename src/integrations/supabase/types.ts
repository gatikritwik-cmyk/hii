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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          assignment_id: string
          class_date: string
          created_at: string
          id: string
          marked_by: string
          notes: string | null
        }
        Insert: {
          assignment_id: string
          class_date: string
          created_at?: string
          id?: string
          marked_by: string
          notes?: string | null
        }
        Update: {
          assignment_id?: string
          class_date?: string
          created_at?: string
          id?: string
          marked_by?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "tutor_student_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          created_at: string
          email: string | null
          grade: string | null
          id: string
          message: string | null
          parent_name: string
          phone: string
          status: string
          student_name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          message?: string | null
          parent_name: string
          phone: string
          status?: string
          student_name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          message?: string | null
          parent_name?: string
          phone?: string
          status?: string
          student_name?: string
          subject?: string | null
        }
        Relationships: []
      }
      featured_tutors: {
        Row: {
          created_at: string
          display_order: number
          experience: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          qualification: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          experience?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          qualification?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          experience?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          qualification?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_deposits: {
        Row: {
          amount: number
          created_at: string
          deposit_date: string
          id: string
          notes: string | null
          parent_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          deposit_date?: string
          id?: string
          notes?: string | null
          parent_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deposit_date?: string
          id?: string
          notes?: string | null
          parent_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: number
          paid_at: string
          parent_id: string
          student_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month: number
          paid_at?: string
          parent_id: string
          student_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: number
          paid_at?: string
          parent_id?: string
          student_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          course: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          parent_name: string | null
          rating: number
          review_text: string
          student_name: string
          updated_at: string
        }
        Insert: {
          course?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          parent_name?: string | null
          rating?: number
          review_text: string
          student_name: string
          updated_at?: string
        }
        Update: {
          course?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          parent_name?: string | null
          rating?: number
          review_text?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_student_assignments: {
        Row: {
          created_at: string
          fee_per_class: number
          fee_type: string
          id: string
          student_id: string
          subject: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          fee_per_class?: number
          fee_type?: string
          id?: string
          student_id: string
          subject: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          fee_per_class?: number
          fee_type?: string
          id?: string
          student_id?: string
          subject?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_parent_of_assignment: {
        Args: { _assignment_id: string; _parent_id: string }
        Returns: boolean
      }
      is_parent_of_student: {
        Args: { _parent_id: string; _student_id: string }
        Returns: boolean
      }
      is_tutor_assigned_to_student: {
        Args: { _student_id: string; _tutor_id: string }
        Returns: boolean
      }
      is_tutor_of_assignment: {
        Args: { _assignment_id: string; _tutor_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tutor" | "parent"
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
      app_role: ["admin", "tutor", "parent"],
    },
  },
} as const
