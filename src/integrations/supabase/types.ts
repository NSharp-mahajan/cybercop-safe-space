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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string | null
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          target_audience: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          alert_type?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          target_audience?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          target_audience?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          message: string
          role: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          message: string
          role: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          message?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          anonymous_session: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          anonymous_session?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          anonymous_session?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fir_reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          address: string
          contact: string
          incident_date: string
          incident_location: string
          incident_description: string
          language: string
          status: string
          evidence_files: string[] | null
          additional_notes: string | null
          user_id: string | null
          anonymous_session: string | null
          assigned_officer: string | null
          fir_number: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          address: string
          contact: string
          incident_date: string
          incident_location: string
          incident_description: string
          language?: string
          status?: string
          evidence_files?: string[] | null
          additional_notes?: string | null
          user_id?: string | null
          anonymous_session?: string | null
          assigned_officer?: string | null
          fir_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          address?: string
          contact?: string
          incident_date?: string
          incident_location?: string
          incident_description?: string
          language?: string
          status?: string
          evidence_files?: string[] | null
          additional_notes?: string | null
          user_id?: string | null
          anonymous_session?: string | null
          assigned_officer?: string | null
          fir_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      fir_submissions: {
        Row: {
          case_type: string
          complainant_email: string | null
          complainant_name: string
          complainant_phone: string
          created_at: string
          fir_number: string | null
          id: string
          incident_date: string
          incident_description: string
          incident_location: string
          metadata: Json | null
          priority: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_type: string
          complainant_email?: string | null
          complainant_name: string
          complainant_phone: string
          created_at?: string
          fir_number?: string | null
          id?: string
          incident_date: string
          incident_description: string
          incident_location: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_type?: string
          complainant_email?: string | null
          complainant_name?: string
          complainant_phone?: string
          created_at?: string
          fir_number?: string | null
          id?: string
          incident_date?: string
          incident_description?: string
          incident_location?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      help_queries: {
        Row: {
          category: string | null
          created_at: string
          id: string
          priority: string | null
          query_text: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          priority?: string | null
          query_text: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          priority?: string | null
          query_text?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      law_modules: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          is_published: boolean | null
          learning_objectives: string[] | null
          order_index: number | null
          prerequisites: string[] | null
          quiz_questions: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_published?: boolean | null
          learning_objectives?: string[] | null
          order_index?: number | null
          prerequisites?: string[] | null
          quiz_questions?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_published?: boolean | null
          learning_objectives?: string[] | null
          order_index?: number | null
          prerequisites?: string[] | null
          quiz_questions?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_checks: {
        Row: {
          common_password: boolean | null
          created_at: string
          has_lowercase: boolean | null
          has_numbers: boolean | null
          has_symbols: boolean | null
          has_uppercase: boolean | null
          id: string
          length: number
          password_hash: string
          strength_score: number
          suggestions: string[] | null
          user_id: string | null
        }
        Insert: {
          common_password?: boolean | null
          created_at?: string
          has_lowercase?: boolean | null
          has_numbers?: boolean | null
          has_symbols?: boolean | null
          has_uppercase?: boolean | null
          id?: string
          length: number
          password_hash: string
          strength_score: number
          suggestions?: string[] | null
          user_id?: string | null
        }
        Update: {
          common_password?: boolean | null
          created_at?: string
          has_lowercase?: boolean | null
          has_numbers?: boolean | null
          has_symbols?: boolean | null
          has_uppercase?: boolean | null
          id?: string
          length?: number
          password_hash?: string
          strength_score?: number
          suggestions?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scam_library: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_trending: boolean | null
          prevention_tips: string[] | null
          real_examples: string[] | null
          reported_count: number | null
          risk_level: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          warning_signs: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          prevention_tips?: string[] | null
          real_examples?: string[] | null
          reported_count?: number | null
          risk_level?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          warning_signs?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          prevention_tips?: string[] | null
          real_examples?: string[] | null
          reported_count?: number | null
          risk_level?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          warning_signs?: string[] | null
        }
        Relationships: []
      }
      scam_reports: {
        Row: {
          category: string
          created_at: string
          description: string
          downvotes: number | null
          evidence_file_url: string | null
          id: string
          location: string | null
          reporter_name: string | null
          reporter_user_id: string | null
          status: string
          title: string
          updated_at: string
          upvotes: number | null
          url: string
          url_hash: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          downvotes?: number | null
          evidence_file_url?: string | null
          id?: string
          location?: string | null
          reporter_name?: string | null
          reporter_user_id?: string | null
          status?: string
          title: string
          updated_at?: string
          upvotes?: number | null
          url: string
          url_hash: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          downvotes?: number | null
          evidence_file_url?: string | null
          id?: string
          location?: string | null
          reporter_name?: string | null
          reporter_user_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          upvotes?: number | null
          url?: string
          url_hash?: string
        }
        Relationships: []
      }
      scam_votes: {
        Row: {
          created_at: string
          id: string
          scam_report_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          scam_report_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          scam_report_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "scam_votes_scam_report_id_fkey"
            columns: ["scam_report_id"]
            isOneToOne: false
            referencedRelation: "scam_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      scanned_documents: {
        Row: {
          analysis_status: string | null
          confidence_level: number | null
          created_at: string
          document_type: string | null
          extracted_text: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          fraud_indicators: string[] | null
          fraud_risk_score: number | null
          id: string
          metadata: Json | null
          recommendations: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_status?: string | null
          confidence_level?: number | null
          created_at?: string
          document_type?: string | null
          extracted_text?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          fraud_indicators?: string[] | null
          fraud_risk_score?: number | null
          id?: string
          metadata?: Json | null
          recommendations?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_status?: string | null
          confidence_level?: number | null
          created_at?: string
          document_type?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          fraud_indicators?: string[] | null
          fraud_risk_score?: number | null
          id?: string
          metadata?: Json | null
          recommendations?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      url_checks: {
        Row: {
          checked_at: string
          id: string
          ip_address: unknown | null
          status: string
          url: string
          url_hash: string
          user_id: string | null
        }
        Insert: {
          checked_at?: string
          id?: string
          ip_address?: unknown | null
          status: string
          url: string
          url_hash: string
          user_id?: string | null
        }
        Update: {
          checked_at?: string
          id?: string
          ip_address?: unknown | null
          status?: string
          url?: string
          url_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          progress_percentage: number | null
          quiz_score: number | null
          status: string | null
          time_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          progress_percentage?: number | null
          quiz_score?: number | null
          status?: string | null
          time_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          progress_percentage?: number | null
          quiz_score?: number | null
          status?: string | null
          time_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "law_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      extension_licenses: {
        Row: {
          created_at: string
          expires_at: string
          extension_id: string
          id: string
          license_key: string
          metadata: Json | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          extension_id: string
          id?: string
          license_key: string
          metadata?: Json | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          extension_id?: string
          id?: string
          license_key?: string
          metadata?: Json | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extension_licenses_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extension_licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
