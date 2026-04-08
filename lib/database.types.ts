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
      guest_photos: {
        Row: {
          created_at: string
          guest_id: string | null
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_photos_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "store_users"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          access_token: string
          created_at: string
          email: string | null
          guest_type: string | null
          id: string
          name: string
          notified_whatsapp: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          email?: string | null
          guest_type?: string | null
          id?: string
          name: string
          notified_whatsapp?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string | null
          guest_type?: string | null
          id?: string
          name?: string
          notified_whatsapp?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      passes: {
        Row: {
          attendee_name: string
          confirmation_status: Database["public"]["Enums"]["confirmation_status"]
          guest_id: string
          id: string
          table_id: string | null
          updated_at: string
        }
        Insert: {
          attendee_name: string
          confirmation_status?: Database["public"]["Enums"]["confirmation_status"]
          guest_id: string
          id?: string
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          attendee_name?: string
          confirmation_status?: Database["public"]["Enums"]["confirmation_status"]
          guest_id?: string
          id?: string
          table_id?: string | null
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
          {
            foreignKeyName: "passes_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      purchased_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          qr_code: string
          redeemed_at: string | null
          redeemed_by: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          qr_code: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          qr_code?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchased_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          price_coins: number
          rarity: number | null
          stock_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price_coins: number
          rarity?: number | null
          stock_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price_coins?: number
          rarity?: number | null
          stock_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_users: {
        Row: {
          created_at: string
          current_balance: number
          email: string
          full_name: string | null
          id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          email: string
          full_name?: string | null
          id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          email?: string
          full_name?: string | null
          id?: string | null
          updated_at?: string
        }
        Relationships: []
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          source_gift_id: string | null
          transaction_type: Database["public"]["Enums"]["wallet_transaction_type"]
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source_gift_id?: string | null
          transaction_type: Database["public"]["Enums"]["wallet_transaction_type"]
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source_gift_id?: string | null
          transaction_type?: Database["public"]["Enums"]["wallet_transaction_type"]
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_source_gift_id_fkey"
            columns: ["source_gift_id"]
            isOneToOne: false
            referencedRelation: "gift_transactions"
            referencedColumns: ["id"]
          },
        ]
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
      delete_gift_transaction: {
        Args: { p_transaction_id: string }
        Returns: undefined
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
      is_admin:
        | { Args: { check_user_id?: string }; Returns: boolean }
        | { Args: { user_email: string }; Returns: boolean }
      is_gift_completed: {
        Args: { gift: Database["public"]["Tables"]["gifts"]["Row"] }
        Returns: boolean
      }
      play_gacha: { Args: { p_user_id: string }; Returns: Json }
      purchase_store_item: {
        Args: { p_item_id: string; p_user_id: string }
        Returns: Json
      }
      redeem_qr_code: {
        Args: { p_qr_code: string; p_staff_name: string }
        Returns: Json
      }
      upload_paparazzi_photo: {
        Args: { p_guest_id: string; p_image_url: string }
        Returns: Json
      }
    }
    Enums: {
      confirmation_status: "pending" | "confirmed" | "declined"
      purchase_status: "ACTIVE" | "REDEEMED" | "EXPIRED"
      transaction_status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "PROCESSING"
        | "MANUAL_REVIEW"
      wallet_transaction_type:
        | "GIFT_REWARD"
        | "STORE_PURCHASE"
        | "BONUS"
        | "ADMIN_ADJUSTMENT"
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
      purchase_status: ["ACTIVE", "REDEEMED", "EXPIRED"],
      transaction_status: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "PROCESSING",
        "MANUAL_REVIEW",
      ],
      wallet_transaction_type: [
        "GIFT_REWARD",
        "STORE_PURCHASE",
        "BONUS",
        "ADMIN_ADJUSTMENT",
      ],
    },
  },
} as const
