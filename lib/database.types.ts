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
          is_purchased: boolean
          purchased_by: string | null
          purchased_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          price?: number | null
          store_url?: string | null
          category?: string | null
          is_purchased?: boolean
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          price?: number | null
          store_url?: string | null
          category?: string | null
          is_purchased?: boolean
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "guests"
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
    }
  }
}
