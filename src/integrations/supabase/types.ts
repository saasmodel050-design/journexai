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
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          country: string | null
          created_at: string
          id: string
          ip_address: string | null
          referral_code: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referral_code: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referral_code?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          approved_at: string | null
          bank_details: Json | null
          commission_rate: number
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          motivation: string | null
          paid_earnings: number
          payout_method: string | null
          paypal_email: string | null
          pending_earnings: number
          referral_code: string
          social_url: string | null
          status: string
          total_clicks: number
          total_conversions: number
          total_earnings: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          bank_details?: Json | null
          commission_rate?: number
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          motivation?: string | null
          paid_earnings?: number
          payout_method?: string | null
          paypal_email?: string | null
          pending_earnings?: number
          referral_code: string
          social_url?: string | null
          status?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          bank_details?: Json | null
          commission_rate?: number
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          motivation?: string | null
          paid_earnings?: number
          payout_method?: string | null
          paypal_email?: string | null
          pending_earnings?: number
          referral_code?: string
          social_url?: string | null
          status?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          created_at: string
          id: string
          notes: string | null
          payout_id: string | null
          referral_id: string | null
          referred_user_id: string | null
          sale_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payout_id?: string | null
          referral_id?: string | null
          referred_user_id?: string | null
          sale_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payout_id?: string | null
          referral_id?: string | null
          referred_user_id?: string | null
          sale_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_payments: {
        Row: {
          activated_at: string | null
          amount: number
          country: string | null
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          method: string
          network: string
          notes: string | null
          plan: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          status: string
          telegram: string | null
          txid: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          activated_at?: string | null
          amount: number
          country?: string | null
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          method: string
          network: string
          notes?: string | null
          plan?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: string
          telegram?: string | null
          txid: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          activated_at?: string | null
          amount?: number
          country?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          method?: string
          network?: string
          notes?: string | null
          plan?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: string
          telegram?: string | null
          txid?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
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
      payment_wallets: {
        Row: {
          active: boolean
          address: string
          created_at: string
          id: string
          label: string
          method: string
          network: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          address: string
          created_at?: string
          id?: string
          label: string
          method: string
          network: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          created_at?: string
          id?: string
          label?: string
          method?: string
          network?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          admin_notes: string | null
          affiliate_id: string
          amount: number
          created_at: string
          destination: Json | null
          id: string
          method: string
          processed_at: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id: string
          amount: number
          created_at?: string
          destination?: Json | null
          id?: string
          method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string
          amount?: number
          created_at?: string
          destination?: Json | null
          id?: string
          method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
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
          referred_by_affiliate_id: string | null
          referred_by_code: string | null
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
          referred_by_affiliate_id?: string | null
          referred_by_code?: string | null
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
          referred_by_affiliate_id?: string | null
          referred_by_code?: string | null
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
      referrals: {
        Row: {
          affiliate_id: string
          conversion_status: string
          converted_at: string | null
          created_at: string
          id: string
          plan: string | null
          referred_email: string | null
          referred_user_id: string
          signup_date: string
        }
        Insert: {
          affiliate_id: string
          conversion_status?: string
          converted_at?: string | null
          created_at?: string
          id?: string
          plan?: string | null
          referred_email?: string | null
          referred_user_id: string
          signup_date?: string
        }
        Update: {
          affiliate_id?: string
          conversion_status?: string
          converted_at?: string | null
          created_at?: string
          id?: string
          plan?: string | null
          referred_email?: string | null
          referred_user_id?: string
          signup_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
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
      log_admin_audit: {
        Args: {
          p_action: string
          p_after?: Json
          p_before?: Json
          p_entity?: string
          p_entity_id?: string
        }
        Returns: string
      }
      track_affiliate_click: {
        Args: { _code: string; _referrer?: string; _ua?: string }
        Returns: undefined
      }
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
