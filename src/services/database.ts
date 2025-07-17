import { supabase } from '../lib/supabase';
import { Ground, BookingSlot, PricingRule } from '../types';

export const databaseService = {
  // Grounds
  async getGrounds(): Promise<Ground[]> {
    try {
      const { data, error } = await supabase
        .from('grounds')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(ground => ({
        id: ground.id,
        name: ground.name,
        sport: ground.sport as 'Cricket' | 'Football',
        defaultPrice: ground.default_price,
        currentPrice: ground.current_price,
        image: ground.image,
        description: ground.description,
        facilities: ground.facilities,
        isActive: ground.is_active
      }));
    } catch (error) {
      console.error('Error fetching grounds:', error);
      throw error;
    }
  },

  async addGround(ground: Omit<Ground, 'id'>): Promise<Ground> {
    try {
      const { data, error } = await supabase
        .from('grounds')
        .insert({
          name: ground.name,
          sport: ground.sport,
          default_price: ground.defaultPrice,
          current_price: ground.currentPrice,
          image: ground.image,
          description: ground.description,
          facilities: ground.facilities,
          is_active: ground.isActive
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        sport: data.sport,
        defaultPrice: data.default_price,
        currentPrice: data.current_price,
        image: data.image,
        description: data.description,
        facilities: data.facilities,
        isActive: data.is_active
      };
    } catch (error) {
      console.error('Error adding ground:', error);
      throw error;
    }
  },

  async updateGround(id: string, updates: Partial<Ground>): Promise<void> {
    try {
      const { error } = await supabase
        .from('grounds')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.sport && { sport: updates.sport }),
          ...(updates.defaultPrice && { default_price: updates.defaultPrice }),
          ...(updates.currentPrice && { current_price: updates.currentPrice }),
          ...(updates.image && { image: updates.image }),
          ...(updates.description && { description: updates.description }),
          ...(updates.facilities && { facilities: updates.facilities }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive })
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating ground:', error);
      throw error;
    }
  },

  // Bookings
  async getBookings(): Promise<BookingSlot[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(booking => ({
        id: booking.id,
        groundId: booking.ground_id,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        price: booking.price,
        isBooked: booking.payment_status === 'paid',
        userId: booking.user_id,
        userName: booking.user_name,
        userEmail: booking.user_email,
        userPhone: booking.user_phone,
        paymentStatus: booking.payment_status,
        paymentMethod: booking.payment_method,
        discountApplied: booking.discount_applied,
        createdAt: booking.created_at
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  async addBooking(booking: Omit<BookingSlot, 'id' | 'createdAt'>): Promise<BookingSlot> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ground_id: booking.groundId,
          user_id: booking.userId!,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          price: booking.price,
          user_name: booking.userName!,
          user_email: booking.userEmail!,
          user_phone: booking.userPhone!,
          payment_status: booking.paymentStatus,
          payment_method: booking.paymentMethod,
          discount_applied: booking.discountApplied || 0
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        groundId: data.ground_id,
        date: data.date,
        time: data.time,
        duration: data.duration,
        price: data.price,
        isBooked: data.payment_status === 'paid',
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        userPhone: data.user_phone,
        paymentStatus: data.payment_status,
        paymentMethod: data.payment_method,
        discountApplied: data.discount_applied,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  },

  async updateBooking(id: string, updates: Partial<BookingSlot>): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          ...(updates.paymentStatus && { payment_status: updates.paymentStatus }),
          ...(updates.paymentMethod && { payment_method: updates.paymentMethod })
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Pricing Rules
  async getPricingRules(): Promise<PricingRule[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(rule => ({
        id: rule.id,
        type: rule.type,
        discount: rule.discount,
        condition: rule.condition,
        isActive: rule.is_active
      }));
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      throw error;
    }
  },

  async updatePricingRule(id: string, updates: Partial<PricingRule>): Promise<void> {
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({
          ...(updates.discount !== undefined && { discount: updates.discount }),
          ...(updates.condition && { condition: updates.condition }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive })
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating pricing rule:', error);
      throw error;
    }
  }
};