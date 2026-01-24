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
      ai_generation_queue: {
        Row: {
          attempts: number
          created_at: string | null
          error: string | null
          id: string
          processed_at: string | null
          product_id: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string | null
          error?: string | null
          id?: string
          processed_at?: string | null
          product_id: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string | null
          error?: string | null
          id?: string
          processed_at?: string | null
          product_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_queue_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          product_id: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          product_id?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          product_id?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          created_at: string
          discount: number | null
          ends_at: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_flash_deal: boolean | null
          is_verified: boolean | null
          moq: number | null
          original_price: number | null
          price: number | null
          product_id: string | null
          sort_order: number | null
          supplier: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: number | null
          ends_at?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_flash_deal?: boolean | null
          is_verified?: boolean | null
          moq?: number | null
          original_price?: number | null
          price?: number | null
          product_id?: string | null
          sort_order?: number | null
          supplier?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: number | null
          ends_at?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_flash_deal?: boolean | null
          is_verified?: boolean | null
          moq?: number | null
          original_price?: number | null
          price?: number | null
          product_id?: string | null
          sort_order?: number | null
          supplier?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_items: {
        Row: {
          created_at: string
          id: string
          image: string | null
          is_active: boolean | null
          item_id: string | null
          metadata: Json | null
          section: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          item_id?: string | null
          metadata?: Json | null
          section: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          item_id?: string | null
          metadata?: Json | null
          section?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      frequently_searched: {
        Row: {
          created_at: string
          id: string
          image: string | null
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      image_queue: {
        Row: {
          attempts: number | null
          created_at: string
          error: string | null
          id: string
          processed_at: string | null
          processed_url: string | null
          product_id: string | null
          source_url: string
          status: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          error?: string | null
          id?: string
          processed_at?: string | null
          processed_url?: string | null
          product_id?: string | null
          source_url: string
          status?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          error?: string | null
          id?: string
          processed_at?: string | null
          processed_url?: string | null
          product_id?: string | null
          source_url?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_queue_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_hub_products: {
        Row: {
          country: string
          country_flag: string
          created_at: string
          id: string
          image: string | null
          is_active: boolean | null
          price: string
          product_id: string | null
          sort_order: number | null
          specialty: string
          title: string
          updated_at: string
        }
        Insert: {
          country: string
          country_flag: string
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          price: string
          product_id?: string | null
          sort_order?: number | null
          specialty: string
          title: string
          updated_at?: string
        }
        Update: {
          country?: string
          country_flag?: string
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          price?: string
          product_id?: string | null
          sort_order?: number | null
          specialty?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "industry_hub_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          seller_id: string
          status: string | null
          total_price: number
          tracking_info: Json | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          product_id?: string | null
          quantity: number
          seller_id: string
          status?: string | null
          total_price: number
          tracking_info?: Json | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          seller_id?: string
          status?: string | null
          total_price?: number
          tracking_info?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_override_logs: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          new_status: string
          order_id: string | null
          previous_status: string
          reason: string | null
          transaction_id: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          new_status: string
          order_id?: string | null
          previous_status: string
          reason?: string | null
          transaction_id?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          new_status?: string
          order_id?: string | null
          previous_status?: string
          reason?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_override_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_override_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          card_brand: string | null
          card_last_four: string | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          otp_verified: boolean | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          otp_verified?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          otp_verified?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_promotions: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          discount_code: string | null
          discount_percent: number | null
          display_frequency: string | null
          end_at: string | null
          id: string
          image: string | null
          is_active: boolean | null
          show_on_pages: string[] | null
          start_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          discount_code?: string | null
          discount_percent?: number | null
          display_frequency?: string | null
          end_at?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          show_on_pages?: string[] | null
          start_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          discount_code?: string | null
          discount_percent?: number | null
          display_frequency?: string | null
          end_at?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          show_on_pages?: string[] | null
          start_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          ai_description: string | null
          ai_features: string[] | null
          ai_generated_at: string | null
          ai_generation_version: number | null
          ai_specifications: Json | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_approved: boolean | null
          image_confidence: string | null
          image_review_notes: string | null
          images: string[] | null
          is_available: boolean | null
          low_stock_threshold: number | null
          meta_description: string | null
          moq: number | null
          price_max: number | null
          price_min: number | null
          published: boolean | null
          seller_id: string
          seo_title: string | null
          sku: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number | null
          tags: string[] | null
          title: string
          unit: string | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          ai_description?: string | null
          ai_features?: string[] | null
          ai_generated_at?: string | null
          ai_generation_version?: number | null
          ai_specifications?: Json | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_approved?: boolean | null
          image_confidence?: string | null
          image_review_notes?: string | null
          images?: string[] | null
          is_available?: boolean | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          moq?: number | null
          price_max?: number | null
          price_min?: number | null
          published?: boolean | null
          seller_id: string
          seo_title?: string | null
          sku?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number | null
          tags?: string[] | null
          title: string
          unit?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          ai_description?: string | null
          ai_features?: string[] | null
          ai_generated_at?: string | null
          ai_generation_version?: number | null
          ai_specifications?: Json | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_approved?: boolean | null
          image_confidence?: string | null
          image_review_notes?: string | null
          images?: string[] | null
          is_available?: boolean | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          moq?: number | null
          price_max?: number | null
          price_min?: number | null
          published?: boolean | null
          seller_id?: string
          seo_title?: string | null
          sku?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number | null
          tags?: string[] | null
          title?: string
          unit?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          postal_code: string | null
          state_province: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          state_province?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          state_province?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_slides: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          id: string
          image: string | null
          is_active: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_responses: {
        Row: {
          attachments: string[] | null
          created_at: string
          delivery_time: string | null
          id: string
          message: string | null
          moq: number | null
          price: number | null
          rfq_id: string
          seller_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          delivery_time?: string | null
          id?: string
          message?: string | null
          moq?: number | null
          price?: number | null
          rfq_id: string
          seller_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          delivery_time?: string | null
          id?: string
          message?: string | null
          moq?: number | null
          price?: number | null
          rfq_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_responses_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          buyer_id: string
          category_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          images: string[] | null
          quantity: number | null
          status: string | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          category_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          quantity?: number | null
          status?: string | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          category_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          quantity?: number | null
          status?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      staging_products: {
        Row: {
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string | null
          images: Json | null
          is_active: boolean | null
          is_available: boolean | null
          name: string | null
          selling_price: number | null
          slug: string | null
          stock: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: Json | null
          is_active?: boolean | null
          is_available?: boolean | null
          name?: string | null
          selling_price?: number | null
          slug?: string | null
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: Json | null
          is_active?: boolean | null
          is_available?: boolean | null
          name?: string | null
          selling_price?: number | null
          slug?: string | null
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean | null
          message: string
          product_id: string | null
          resolved_at: string | null
        }
        Insert: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message: string
          product_id?: string | null
          resolved_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          product_id?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          certificates: string[] | null
          company_info: string | null
          created_at: string
          employees: string | null
          id: string
          main_markets: string[] | null
          response_rate: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
          year_established: number | null
        }
        Insert: {
          certificates?: string[] | null
          company_info?: string | null
          created_at?: string
          employees?: string | null
          id?: string
          main_markets?: string[] | null
          response_rate?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          year_established?: number | null
        }
        Update: {
          certificates?: string[] | null
          company_info?: string | null
          created_at?: string
          employees?: string | null
          id?: string
          main_markets?: string[] | null
          response_rate?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          year_established?: number | null
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "buyer" | "seller" | "super_admin"
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
      app_role: ["admin", "buyer", "seller", "super_admin"],
    },
  },
} as const
