export interface Ground {
  id: string;
  name: string;
  sport: 'Cricket' | 'Football';
  defaultPrice: number;
  currentPrice: number;
  image: string;
  description: string;
  facilities: string[];
  isActive: boolean;
}

export interface BookingSlot {
  id: string;
  groundId: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  isBooked: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'jazzcash' | 'easypaisa' | 'card';
  discountApplied?: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  type: 'weekday' | 'bulk' | 'peak' | 'off-peak';
  discount: number;
  condition: {
    minHours?: number;
    daysOfWeek?: number[];
    timeRange?: { start: string; end: string };
  };
  isActive: boolean;
}

export interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  popularTimeSlots: { time: string; count: number }[];
  revenueByDay: { day: string; revenue: number }[];
  groundUtilization: { groundId: string; utilization: number }[];
  peakHours: string[];
  aiRecommendations: {
    suggestedDiscounts: { timeSlot: string; discount: number; reason: string }[];
    peakPricing: { timeSlot: string; suggestedIncrease: number; reason: string }[];
  };
}