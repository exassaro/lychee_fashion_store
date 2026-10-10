// Hand-maintained to match supabase/schema.sql.
// Regenerate with: npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Department = "kids" | "ladies";

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; email: string; created_at: string };
        Insert: { user_id: string; email: string; created_at?: string };
        Update: { user_id?: string; email?: string; created_at?: string };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          department: Department;
          name: string;
          slug: string;
          image_url: string | null;
          image_path: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          department: Department;
          name: string;
          slug: string;
          image_url?: string | null;
          image_path?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          department?: Department;
          name?: string;
          slug?: string;
          image_url?: string | null;
          image_path?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          product_code: string;
          department: Department;
          category_id: string | null;
          description: string | null;
          fabric: string | null;
          colour: string | null;
          age_group: string | null;
          price: number;
          mrp: number | null;
          tags: string[];
          is_featured: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          product_code?: string;
          department: Department;
          category_id?: string | null;
          description?: string | null;
          fabric?: string | null;
          colour?: string | null;
          age_group?: string | null;
          price: number;
          mrp?: number | null;
          tags?: string[];
          is_featured?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          product_code?: string;
          department?: Department;
          category_id?: string | null;
          description?: string | null;
          fabric?: string | null;
          colour?: string | null;
          age_group?: string | null;
          price?: number;
          mrp?: number | null;
          tags?: string[];
          is_featured?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          url: string;
          alt: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          url: string;
          alt?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          url?: string;
          alt?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_sizes: {
        Row: { id: string; product_id: string; size: string; stock: number; sort_order: number };
        Insert: { id?: string; product_id: string; size: string; stock?: number; sort_order?: number };
        Update: { id?: string; product_id?: string; size?: string; stock?: number; sort_order?: number };
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          id: number;
          store_name: string;
          tagline: string;
          address: string | null;
          opening_hours: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          email: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          maps_url: string | null;
          maps_embed_url: string | null;
          hero_title: string | null;
          hero_subtitle: string | null;
          hero_image_url: string | null;
          hero_image_path: string | null;
          about_text: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      product_cards: {
        Row: {
          id: string;
          name: string;
          slug: string;
          product_code: string;
          department: Department;
          category_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          price: number;
          mrp: number | null;
          colour: string | null;
          tags: string[];
          is_featured: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
          cover_url: string | null;
          hover_url: string | null;
          total_stock: number;
          low_stock_count: number;
          available_sizes: string[];
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      adjust_stock: { Args: { p_size_id: string; p_delta: number }; Returns: number };
      slugify: { Args: { value: string }; Returns: string };
    };
    Enums: { department: Department };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"];
