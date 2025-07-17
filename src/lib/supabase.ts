import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          name: string;
          email: string;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          name: string;
          email: string;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      grounds: {
        Row: {
          id: string;
          name: string;
          sport: 'Cricket' | 'Football';
          default_price: number;
          current_price: number;
          image: string;
          description: string;
          facilities: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sport: 'Cricket' | 'Football';
          default_price?: number;
          current_price?: number;
          image?: string;
          description?: string;
          facilities?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sport?: 'Cricket' | 'Football';
          default_price?: number;
          current_price?: number;
          image?: string;
          description?: string;
          facilities?: string[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          ground_id: string;
          user_id: string;
          date: string;
          time: string;
          duration: number;
          price: number;
          user_name: string;
          user_email: string;
          user_phone: string;
          payment_status: 'pending' | 'paid' | 'failed';
          payment_method: 'jazzcash' | 'easypaisa' | 'card' | null;
          discount_applied: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ground_id: string;
          user_id: string;
          date: string;
          time: string;
          duration?: number;
          price?: number;
          user_name: string;
          user_email: string;
          user_phone: string;
          payment_status?: 'pending' | 'paid' | 'failed';
          payment_method?: 'jazzcash' | 'easypaisa' | 'card' | null;
          discount_applied?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          ground_id?: string;
          user_id?: string;
          date?: string;
          time?: string;
          duration?: number;
          price?: number;
          user_name?: string;
          user_email?: string;
          user_phone?: string;
          payment_status?: 'pending' | 'paid' | 'failed';
          payment_method?: 'jazzcash' | 'easypaisa' | 'card' | null;
          discount_applied?: number;
          created_at?: string;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          type: 'weekday' | 'bulk' | 'peak' | 'off-peak';
          discount: number;
          condition: any;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'weekday' | 'bulk' | 'peak' | 'off-peak';
          discount?: number;
          condition?: any;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'weekday' | 'bulk' | 'peak' | 'off-peak';
          discount?: number;
          condition?: any;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
  };
}