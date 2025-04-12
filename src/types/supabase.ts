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
      incoming_box_stock: {
        Row: {
          boxes_received: number
          created_at: string
          description: string | null
          id: string
          incoming_date: string
          product_id: string
          sku: string
          total_units: number
          updated_at: string
        }
        Insert: {
          boxes_received: number
          created_at?: string
          description?: string | null
          id?: string
          incoming_date: string
          product_id: string
          sku: string
          total_units: number
          updated_at?: string
        }
        Update: {
          boxes_received?: number
          created_at?: string
          description?: string | null
          id?: string
          incoming_date?: string
          product_id?: string
          sku?: string
          total_units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incoming_box_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_stock: {
        Row: {
          created_at: string
          description: string | null
          id: string
          outgoing_date: string
          recipient_id: string
          shipping_document_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          outgoing_date: string
          recipient_id: string
          shipping_document_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          outgoing_date?: string
          recipient_id?: string
          shipping_document_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_stock_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_stock_items: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          outgoing_stock_id: string
          product_id: string
          size: string
          sku: string
          units_shipped: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          id?: string
          outgoing_stock_id: string
          product_id: string
          size: string
          sku: string
          units_shipped: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          outgoing_stock_id?: string
          product_id?: string
          size?: string
          sku?: string
          units_shipped?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_stock_items_outgoing_stock_id_fkey"
            columns: ["outgoing_stock_id"]
            isOneToOne: false
            referencedRelation: "outgoing_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_stock_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          box_contents: number
          category: string
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          name: string
          price: number
          sku: string
          updated_at: string
        }
        Insert: {
          box_contents: number
          category: string
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          sku: string
          updated_at?: string
        }
        Update: {
          box_contents?: number
          category?: string
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          sku?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipients: {
        Row: {
          contact_person: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          telephone_number: string | null
          updated_at: string
          warehouse_address: string
        }
        Insert: {
          contact_person?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          telephone_number?: string | null
          updated_at?: string
          warehouse_address: string
        }
        Update: {
          contact_person?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          telephone_number?: string | null
          updated_at?: string
          warehouse_address?: string
        }
        Relationships: []
      }
      unit_stock: {
        Row: {
          color: string
          created_at: string
          id: string
          manufacturing_date: string | null
          product_id: string
          size: string
          sku: string
          source_box_stock_id: string | null
          units_available: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          manufacturing_date?: string | null
          product_id: string
          size: string
          sku: string
          source_box_stock_id?: string | null
          units_available: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          manufacturing_date?: string | null
          product_id?: string
          size?: string
          sku?: string
          source_box_stock_id?: string | null
          units_available?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_stock_source_box_stock_id_fkey"
            columns: ["source_box_stock_id"]
            isOneToOne: false
            referencedRelation: "incoming_box_stock"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
