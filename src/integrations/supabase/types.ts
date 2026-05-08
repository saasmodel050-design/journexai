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
      ai_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          prompt: string | null
          response: string | null
          tokens: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          prompt?: string | null
          response?: string | null
          tokens?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          prompt?: string | null
          response?: string | null
          tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          daily_message_limit: number
          free_access: boolean
          id: string
          model: string
          personality: string
          response_depth: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          daily_message_limit?: number
          free_access?: boolean
          id?: string
          model?: string
          personality?: string
          response_depth?: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          daily_message_limit?: number
          free_access?: boolean
          id?: string
          model?: string
          personality?: string
          response_depth?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          id: string
          key: string
          label: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          label: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          ai_trainer_enabled: boolean
          created_at: string
          daily_trade_limit: number | null
          features: Json
          id: string
          insights_enabled: boolean
          monthly_price: number
          monthly_trade_limit: number | null
          name: string
          reports_enabled: boolean
          slug: string
          sort_order: number
          strategies_enabled: boolean
          updated_at: string
          yearly_price: number
        }
        Insert: {
          active?: boolean
          ai_trainer_enabled?: boolean
          created_at?: string
          daily_trade_limit?: number | null
          features?: Json
          id?: string
          insights_enabled?: boolean
          monthly_price?: number
          monthly_trade_limit?: number | null
          name: string
          reports_enabled?: boolean
          slug: string
          sort_order?: number
          strategies_enabled?: boolean
          updated_at?: string
          yearly_price?: number
        }
        Update: {
          active?: boolean
          ai_trainer_enabled?: boolean
          created_at?: string
          daily_trade_limit?: number | null
          features?: Json
          id?: string
          insights_enabled?: boolean
          monthly_price?: number
          monthly_trade_limit?: number | null
          name?: string
          reports_enabled?: boolean
          slug?: string
          sort_order?: number
          strategies_enabled?: boolean
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      platform_notifications: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          created_by: string | null
          display: string
          id: string
          title: string
          type: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          display?: string
          id?: string
          title: string
          type?: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          display?: string
          id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          experience_level: string
          full_name: string
          id: string
          market_type: string
          payment_status: string
          phone: string | null
          plan: string
          plan_status: string
          subscription_type: string
          trial_end_date: string | null
          trial_expired_email_sent_at: string | null
          trial_reminder_day1_sent_at: string | null
          trial_reminder_day2_sent_at: string | null
          trial_reminder_day3_sent_at: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          experience_level?: string
          full_name: string
          id?: string
          market_type?: string
          payment_status?: string
          phone?: string | null
          plan?: string
          plan_status?: string
          subscription_type?: string
          trial_end_date?: string | null
          trial_expired_email_sent_at?: string | null
          trial_reminder_day1_sent_at?: string | null
          trial_reminder_day2_sent_at?: string | null
          trial_reminder_day3_sent_at?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          experience_level?: string
          full_name?: string
          id?: string
          market_type?: string
          payment_status?: string
          phone?: string | null
          plan?: string
          plan_status?: string
          subscription_type?: string
          trial_end_date?: string | null
          trial_expired_email_sent_at?: string | null
          trial_reminder_day1_sent_at?: string | null
          trial_reminder_day2_sent_at?: string | null
          trial_reminder_day3_sent_at?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          draft: Json
          id: string
          page: string
          published: Json
          section_key: string
          updated_at: string
        }
        Insert: {
          draft?: Json
          id?: string
          page: string
          published?: Json
          section_key: string
          updated_at?: string
        }
        Update: {
          draft?: Json
          id?: string
          page?: string
          published?: Json
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_admin_reply: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string
          emotion: string | null
          entry_price: number
          id: string
          notes: string | null
          pair: string
          pnl: number | null
          position_size: number | null
          result: string | null
          risk_percent: number | null
          screenshot_url: string | null
          stop_loss: number | null
          strategy: string | null
          target_price: number | null
          trade_time: string
          trade_type: string
          trading_session: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion?: string | null
          entry_price: number
          id?: string
          notes?: string | null
          pair: string
          pnl?: number | null
          position_size?: number | null
          result?: string | null
          risk_percent?: number | null
          screenshot_url?: string | null
          stop_loss?: number | null
          strategy?: string | null
          target_price?: number | null
          trade_time?: string
          trade_type: string
          trading_session?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: string | null
          entry_price?: number
          id?: string
          notes?: string | null
          pair?: string
          pnl?: number | null
          position_size?: number | null
          result?: string | null
          risk_percent?: number | null
          screenshot_url?: string | null
          stop_loss?: number | null
          strategy?: string | null
          target_price?: number | null
          trade_time?: string
          trade_type?: string
          trading_session?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trial_history: {
        Row: {
          created_at: string
          email: string
          id: string
          outcome: string
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          outcome?: string
          trial_end_date: string
          trial_start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          outcome?: string
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "support_admin" | "user"
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
      app_role: ["super_admin", "support_admin", "user"],
    },
  },
} as const
