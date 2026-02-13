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
      metrics: {
        Row: {
          fps: number | null
          freeze_count: number | null
          height: number | null
          id: string
          jitter: number | null
          packets_lost: number | null
          participant_id: string
          test_id: string
          timestamp: string
          width: number | null
        }
        Insert: {
          fps?: number | null
          freeze_count?: number | null
          height?: number | null
          id?: string
          jitter?: number | null
          packets_lost?: number | null
          participant_id: string
          test_id: string
          timestamp?: string
          width?: number | null
        }
        Update: {
          fps?: number | null
          freeze_count?: number | null
          height?: number | null
          id?: string
          jitter?: number | null
          packets_lost?: number | null
          participant_id?: string
          test_id?: string
          timestamp?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      network_profiles: {
        Row: {
          bandwidth: string | null
          delay: string | null
          description: string | null
          id: string
          loss: string | null
          name: string
        }
        Insert: {
          bandwidth?: string | null
          delay?: string | null
          description?: string | null
          id: string
          loss?: string | null
          name: string
        }
        Update: {
          bandwidth?: string | null
          delay?: string | null
          description?: string | null
          id?: string
          loss?: string | null
          name?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          id: string
          name: string
          profile_id: string
          role: string
          status: string
          test_id: string
          vnc_port: number | null
        }
        Insert: {
          id?: string
          name: string
          profile_id: string
          role: string
          status?: string
          test_id: string
          vnc_port?: number | null
        }
        Update: {
          id?: string
          name?: string
          profile_id?: string
          role?: string
          status?: string
          test_id?: string
          vnc_port?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "network_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number
          id: string
          meeting_url: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds: number
          id?: string
          meeting_url: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          meeting_url?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
