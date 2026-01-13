export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          access_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          access_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          access_token?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      passes: {
        Row: {
          id: string
          guest_id: string
          attendee_name: string
          confirmation_status: 'pending' | 'confirmed' | 'declined'
          dietary_restrictions: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          attendee_name: string
          confirmation_status?: 'pending' | 'confirmed' | 'declined'
          dietary_restrictions?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          attendee_name?: string
          confirmation_status?: 'pending' | 'confirmed' | 'declined'
          dietary_restrictions?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          }
        ]
      }
      gifts: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          price: number | null
          store_url: string | null
          category: string | null
          created_at: string
          updated_at: string
          total_amount: number
          collected_amount: number
          status: 'AVAILABLE' | 'COMPLETED'
          is_crowdfunding: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          price?: number | null
          store_url?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
          total_amount?: number
          collected_amount?: number
          status?: 'AVAILABLE' | 'COMPLETED'
          is_crowdfunding?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          price?: number | null
          store_url?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
          total_amount?: number
          collected_amount?: number
          status?: 'AVAILABLE' | 'COMPLETED'
          is_crowdfunding?: boolean
        }
        Relationships: []
      }
      gift_transactions: {
        Row: {
          id: string
          gift_id: string
          donor_name: string
          amount: number
          external_transaction_id: string | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          payphone_client_transaction_id: string | null
          payphone_transaction_id: string | null
          payment_url: string | null
          created_at: string
          updated_at: string
          approved_at: string | null
        }
        Insert: {
          id?: string
          gift_id: string
          donor_name: string
          amount: number
          external_transaction_id?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          payphone_client_transaction_id?: string | null
          payphone_transaction_id?: string | null
          payment_url?: string | null
          created_at?: string
          updated_at?: string
          approved_at?: string | null
        }
        Update: {
          id?: string
          gift_id?: string
          donor_name?: string
          amount?: number
          external_transaction_id?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          payphone_client_transaction_id?: string | null
          payphone_transaction_id?: string | null
          payment_url?: string | null
          created_at?: string
          updated_at?: string
          approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      get_wedding_stats: {
        Args: Record<string, never>
        Returns: {
          total_guests: number
          total_passes: number
          confirmed_passes: number
          declined_passes: number
          pending_passes: number
          total_gifts: number
          purchased_gifts: number
        }[]
      }
    }
    Enums: {
      confirmation_status: 'pending' | 'confirmed' | 'declined'
      transaction_status: 'PENDING' | 'APPROVED' | 'REJECTED'
    }
  }
}
