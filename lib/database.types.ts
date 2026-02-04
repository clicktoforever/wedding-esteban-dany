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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      configurations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      gift_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          country: string | null
          created_at: string
          donor_email: string
          donor_name: string
          extracted_account: string | null
          extracted_amount: number | null
          extracted_bank: string | null
          extracted_currency: string | null
          extracted_date: string | null
          extracted_recipient_name: string | null
          extracted_reference: string | null
          gift_id: string
          id: string
          message: string | null
          payment_method: string | null
          payphone_client_transaction_id: string | null
          payphone_transaction_id: string | null
          receipt_filename: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
          validated_at: string | null
          validation_confidence: string | null
          validation_errors: Json | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          country?: string | null
          created_at?: string
          donor_email: string
          donor_name: string
          extracted_account?: string | null
          extracted_amount?: number | null
          extracted_bank?: string | null
          extracted_currency?: string | null
          extracted_date?: string | null
          extracted_recipient_name?: string | null
          extracted_reference?: string | null
          gift_id: string
          id?: string
          message?: string | null
          payment_method?: string | null
          payphone_client_transaction_id?: string | null
          payphone_transaction_id?: string | null
          receipt_filename?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          validated_at?: string | null
          validation_confidence?: string | null
          validation_errors?: Json | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          country?: string | null
          created_at?: string
          donor_email?: string
          donor_name?: string
          extracted_account?: string | null
          extracted_amount?: number | null
          extracted_bank?: string | null
          extracted_currency?: string | null
          extracted_date?: string | null
          extracted_recipient_name?: string | null
          extracted_reference?: string | null
          gift_id?: string
          id?: string
          message?: string | null
          payment_method?: string | null
          payphone_client_transaction_id?: string | null
          payphone_transaction_id?: string | null
          receipt_filename?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          validated_at?: string | null
          validation_confidence?: string | null
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gift_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          category: string | null
          collected_amount: number | null
          contributor_count: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_crowdfunding: boolean | null
          name: string
          price: number | null
          status: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          collected_amount?: number | null
          contributor_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_crowdfunding?: boolean | null
          name: string
          price?: number | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          collected_amount?: number | null
          contributor_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_crowdfunding?: boolean | null
          name?: string
          price?: number | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          access_token: string
          created_at: string
          email: string | null
          id: string
          name: string
          notified_whatsapp: boolean
          phone: string | null
          table_id: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notified_whatsapp?: boolean
          phone?: string | null
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notified_whatsapp?: boolean
          phone?: string | null
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      passes: {
        Row: {
          attendee_name: string
          confirmation_status: Database["public"]["Enums"]["confirmation_status"]
          guest_id: string
          id: string
          updated_at: string
        }
        Insert: {
          attendee_name: string
          confirmation_status?: Database["public"]["Enums"]["confirmation_status"]
          guest_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          attendee_name?: string
          confirmation_status?: Database["public"]["Enums"]["confirmation_status"]
          guest_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      gift_progress: {
        Row: {
          approved_contributions: number | null
          collected_amount: number | null
          id: string | null
          is_crowdfunding: boolean | null
          name: string | null
          progress_percentage: number | null
          remaining_amount: number | null
          status: string | null
          total_amount: number | null
          total_contributions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_gift_transaction: {
        Args: { transaction_id: string }
        Returns: Json
      }
      get_wedding_stats: {
        Args: never
        Returns: {
          approved_contributions: number
          completed_gifts: number
          confirmed_passes: number
          declined_passes: number
          pending_passes: number
          total_contributions: number
          total_gifts: number
          total_guests: number
          total_passes: number
        }[]
      }
      is_admin: { Args: { check_user_id?: string }; Returns: boolean }
      is_gift_completed: {
        Args: { gift: Database["public"]["Tables"]["gifts"]["Row"] }
        Returns: boolean
      }
    }
    Enums: {
      confirmation_status: "pending" | "confirmed" | "declined"
      transaction_status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "PROCESSING"
        | "MANUAL_REVIEW"
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
      confirmation_status: ["pending", "confirmed", "declined"],
      transaction_status: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "PROCESSING",
        "MANUAL_REVIEW",
      ],
    },
  },
} as const
