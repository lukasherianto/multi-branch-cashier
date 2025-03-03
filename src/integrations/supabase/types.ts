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
      absensi: {
        Row: {
          absensi_id: number
          created_at: string
          jam_keluar: string | null
          jam_masuk: string
          karyawan_id: number | null
          keterangan: string | null
          status: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          absensi_id?: number
          created_at?: string
          jam_keluar?: string | null
          jam_masuk?: string
          karyawan_id?: number | null
          keterangan?: string | null
          status: string
          tanggal?: string
          updated_at?: string
        }
        Update: {
          absensi_id?: number
          created_at?: string
          jam_keluar?: string | null
          jam_masuk?: string
          karyawan_id?: number | null
          keterangan?: string | null
          status?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "absensi_karyawan_id_fkey"
            columns: ["karyawan_id"]
            isOneToOne: false
            referencedRelation: "karyawan"
            referencedColumns: ["karyawan_id"]
          },
        ]
      }
      cabang: {
        Row: {
          address: string | null
          branch_name: string
          cabang_id: number
          contact_whatsapp: string | null
          created_at: string
          pelaku_usaha_id: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_name: string
          cabang_id?: never
          contact_whatsapp?: string | null
          created_at?: string
          pelaku_usaha_id: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_name?: string
          cabang_id?: never
          contact_whatsapp?: string | null
          created_at?: string
          pelaku_usaha_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cabang_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      karyawan: {
        Row: {
          auth_id: string | null
          cabang_id: number | null
          created_at: string
          email: string | null
          is_active: boolean | null
          karyawan_id: number
          name: string
          pelaku_usaha_id: number | null
          role: string
          updated_at: string
          whatsapp_contact: string | null
        }
        Insert: {
          auth_id?: string | null
          cabang_id?: number | null
          created_at?: string
          email?: string | null
          is_active?: boolean | null
          karyawan_id?: number
          name: string
          pelaku_usaha_id?: number | null
          role: string
          updated_at?: string
          whatsapp_contact?: string | null
        }
        Update: {
          auth_id?: string | null
          cabang_id?: number | null
          created_at?: string
          email?: string | null
          is_active?: boolean | null
          karyawan_id?: number
          name?: string
          pelaku_usaha_id?: number | null
          role?: string
          updated_at?: string
          whatsapp_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "karyawan_cabang_id_fkey"
            columns: ["cabang_id"]
            isOneToOne: false
            referencedRelation: "cabang"
            referencedColumns: ["cabang_id"]
          },
          {
            foreignKeyName: "karyawan_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      kas: {
        Row: {
          amount: number
          cabang_id: number
          created_at: string
          description: string | null
          kas_id: number
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          cabang_id: number
          created_at?: string
          description?: string | null
          kas_id?: never
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          cabang_id?: number
          created_at?: string
          description?: string | null
          kas_id?: never
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kas_cabang_id_fkey"
            columns: ["cabang_id"]
            isOneToOne: false
            referencedRelation: "cabang"
            referencedColumns: ["cabang_id"]
          },
        ]
      }
      kategori_produk: {
        Row: {
          created_at: string
          description: string | null
          kategori_id: number
          kategori_name: string
          pelaku_usaha_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          kategori_id?: never
          kategori_name: string
          pelaku_usaha_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          kategori_id?: never
          kategori_name?: string
          pelaku_usaha_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kategori_produk_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      member: {
        Row: {
          created_at: string
          email: string
          loyalty_points: number | null
          member_id: number
          membership_date: string
          name: string
          pelaku_usaha_id: number
          phone: string | null
          updated_at: string
          whatsapp_contact: string | null
        }
        Insert: {
          created_at?: string
          email: string
          loyalty_points?: number | null
          member_id?: never
          membership_date?: string
          name: string
          pelaku_usaha_id: number
          phone?: string | null
          updated_at?: string
          whatsapp_contact?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          loyalty_points?: number | null
          member_id?: never
          membership_date?: string
          name?: string
          pelaku_usaha_id?: number
          phone?: string | null
          updated_at?: string
          whatsapp_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      pelaku_usaha: {
        Row: {
          business_name: string
          contact_whatsapp: string | null
          created_at: string
          facebook_url: string | null
          instagram_url: string | null
          logo_url: string | null
          pelaku_usaha_id: number
          points_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          contact_whatsapp?: string | null
          created_at?: string
          facebook_url?: string | null
          instagram_url?: string | null
          logo_url?: string | null
          pelaku_usaha_id?: never
          points_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          contact_whatsapp?: string | null
          created_at?: string
          facebook_url?: string | null
          instagram_url?: string | null
          logo_url?: string | null
          pelaku_usaha_id?: never
          points_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pelanggan: {
        Row: {
          created_at: string
          member_type: string | null
          nama: string
          pelaku_usaha_id: number
          pelanggan_id: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          member_type?: string | null
          nama: string
          pelaku_usaha_id: number
          pelanggan_id?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          member_type?: string | null
          nama?: string
          pelaku_usaha_id?: number
          pelanggan_id?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pelanggan_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      pembelian: {
        Row: {
          cabang_id: number
          created_at: string
          jadwal_lunas: string | null
          payment_status: number
          pembelian_id: number
          produk_id: number
          quantity: number
          tanggal_dilunaskan: string | null
          total_price: number
          transaction_date: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          cabang_id: number
          created_at?: string
          jadwal_lunas?: string | null
          payment_status?: number
          pembelian_id?: never
          produk_id: number
          quantity: number
          tanggal_dilunaskan?: string | null
          total_price: number
          transaction_date?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          cabang_id?: number
          created_at?: string
          jadwal_lunas?: string | null
          payment_status?: number
          pembelian_id?: never
          produk_id?: number
          quantity?: number
          tanggal_dilunaskan?: string | null
          total_price?: number
          transaction_date?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pembelian_cabang_id_fkey"
            columns: ["cabang_id"]
            isOneToOne: false
            referencedRelation: "cabang"
            referencedColumns: ["cabang_id"]
          },
          {
            foreignKeyName: "pembelian_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["produk_id"]
          },
        ]
      }
      produk: {
        Row: {
          barcode: string | null
          cabang_id: number
          cost_price: number
          created_at: string
          kategori_id: number
          member_price_1: number | null
          member_price_2: number | null
          pelaku_usaha_id: number
          product_name: string
          produk_id: number
          retail_price: number
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          cabang_id: number
          cost_price: number
          created_at?: string
          kategori_id: number
          member_price_1?: number | null
          member_price_2?: number | null
          pelaku_usaha_id: number
          product_name: string
          produk_id?: never
          retail_price: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          cabang_id?: number
          cost_price?: number
          created_at?: string
          kategori_id?: number
          member_price_1?: number | null
          member_price_2?: number | null
          pelaku_usaha_id?: number
          product_name?: string
          produk_id?: never
          retail_price?: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produk_cabang_id_fkey"
            columns: ["cabang_id"]
            isOneToOne: false
            referencedRelation: "cabang"
            referencedColumns: ["cabang_id"]
          },
          {
            foreignKeyName: "produk_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategori_produk"
            referencedColumns: ["kategori_id"]
          },
          {
            foreignKeyName: "produk_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      produk_history: {
        Row: {
          adjustment_type: string | null
          cost_price: number
          created_at: string
          entry_date: string
          history_id: number
          notes: string | null
          produk_id: number | null
          stock: number
          updated_at: string
        }
        Insert: {
          adjustment_type?: string | null
          cost_price: number
          created_at?: string
          entry_date?: string
          history_id?: number
          notes?: string | null
          produk_id?: number | null
          stock: number
          updated_at?: string
        }
        Update: {
          adjustment_type?: string | null
          cost_price?: number
          created_at?: string
          entry_date?: string
          history_id?: number
          notes?: string | null
          produk_id?: number | null
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produk_history_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["produk_id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_role: string | null
          created_at: string
          full_name: string
          id: string
          is_employee: boolean | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          business_role?: string | null
          created_at?: string
          full_name: string
          id: string
          is_employee?: boolean | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          business_role?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_employee?: boolean | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      retur: {
        Row: {
          created_at: string
          produk_id: number
          quantity: number
          reason: string | null
          retur_date: string
          retur_id: number
          transaksi_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          produk_id: number
          quantity: number
          reason?: string | null
          retur_date?: string
          retur_id?: number
          transaksi_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          produk_id?: number
          quantity?: number
          reason?: string | null
          retur_date?: string
          retur_id?: number
          transaksi_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retur_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["produk_id"]
          },
          {
            foreignKeyName: "retur_transaksi_id_fkey"
            columns: ["transaksi_id"]
            isOneToOne: false
            referencedRelation: "transaksi"
            referencedColumns: ["transaksi_id"]
          },
        ]
      }
      supplier: {
        Row: {
          alamat: string | null
          created_at: string
          nama_usaha: string
          pelaku_usaha_id: number
          supplier_id: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          nama_usaha: string
          pelaku_usaha_id: number
          supplier_id?: never
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          nama_usaha?: string
          pelaku_usaha_id?: number
          supplier_id?: never
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_pelaku_usaha_id_fkey"
            columns: ["pelaku_usaha_id"]
            isOneToOne: false
            referencedRelation: "pelaku_usaha"
            referencedColumns: ["pelaku_usaha_id"]
          },
        ]
      }
      transaksi: {
        Row: {
          cabang_id: number
          created_at: string
          payment_method: string | null
          payment_status: number
          pelanggan_id: number | null
          points_earned: number | null
          points_used: number | null
          produk_id: number
          quantity: number
          total_price: number
          transaction_date: string
          transaksi_id: number
          updated_at: string
        }
        Insert: {
          cabang_id: number
          created_at?: string
          payment_method?: string | null
          payment_status?: number
          pelanggan_id?: number | null
          points_earned?: number | null
          points_used?: number | null
          produk_id: number
          quantity: number
          total_price: number
          transaction_date?: string
          transaksi_id?: never
          updated_at?: string
        }
        Update: {
          cabang_id?: number
          created_at?: string
          payment_method?: string | null
          payment_status?: number
          pelanggan_id?: number | null
          points_earned?: number | null
          points_used?: number | null
          produk_id?: number
          quantity?: number
          total_price?: number
          transaction_date?: string
          transaksi_id?: never
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_cabang_id_fkey"
            columns: ["cabang_id"]
            isOneToOne: false
            referencedRelation: "cabang"
            referencedColumns: ["cabang_id"]
          },
          {
            foreignKeyName: "transaksi_pelanggan_id_fkey"
            columns: ["pelanggan_id"]
            isOneToOne: false
            referencedRelation: "pelanggan"
            referencedColumns: ["pelanggan_id"]
          },
          {
            foreignKeyName: "transaksi_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["produk_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          name: string
          password: string
          role: string
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          email: string
          name: string
          password: string
          role: string
          updated_at?: string
          user_id?: never
        }
        Update: {
          created_at?: string
          email?: string
          name?: string
          password?: string
          role?: string
          updated_at?: string
          user_id?: never
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
