import { Ground, BookingSlot, User, PricingRule, Analytics } from '../types';

export const mockGrounds: Ground[] = [
  {
    id: '1',
    name: 'Cricket Ground 1',
    sport: 'Cricket',
    defaultPrice: 1800,
    currentPrice: 1800,
    image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Professional cricket ground with modern facilities',
    facilities: ['Flood Lights', 'Changing Rooms', 'Parking', 'Refreshments'],
    isActive: true
  },
  {
    id: '2',
    name: 'Football Ground 1',
    sport: 'Football',
    defaultPrice: 1500,
    currentPrice: 1500,
    image: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Standard football ground with artificial turf',
    facilities: ['Artificial Turf', 'Goal Posts', 'Flood Lights', 'Changing Rooms'],
    isActive: true
  }
];

export const mockPricingRules: PricingRule[] = [
  {
    id: '1',
    type: 'weekday',
    discount: 15,
    condition: { daysOfWeek: [1, 2, 3, 4] },
    isActive: true
  },
  {
    id: '2',
    type: 'bulk',
    discount: 10,
    condition: { minHours: 3 },
    isActive: true
  },
  {
    id: '3',
    type: 'bulk',
    discount: 15,
    condition: { minHours: 5 },
    isActive: true
  },
  {
    id: '4',
    type: 'off-peak',
    discount: 20,
    condition: { timeRange: { start: '12:00', end: '15:00' } },
    isActive: true
  }
];

export const mockAnalytics: Analytics = {
  totalRevenue: 125000,
  totalBookings: 86,
  popularTimeSlots: [
    { time: '18:00', count: 15 },
    { time: '19:00', count: 12 },
    { time: '20:00', count: 10 },
    { time: '17:00', count: 8 }
  ],
  revenueByDay: [
    { day: 'Mon', revenue: 12000 },
    { day: 'Tue', revenue: 15000 },
    { day: 'Wed', revenue: 18000 },
    { day: 'Thu', revenue: 16000 },
    { day: 'Fri', revenue: 22000 },
    { day: 'Sat', revenue: 25000 },
    { day: 'Sun', revenue: 20000 }
  ],
  groundUtilization: [
    { groundId: '1', utilization: 75 },
    { groundId: '2', utilization: 68 }
  ],
  peakHours: ['17:00', '18:00', '19:00', '20:00'],
  aiRecommendations: {
    suggestedDiscounts: [
      { timeSlot: '12:00-15:00', discount: 25, reason: 'Low demand detected during lunch hours' },
      { timeSlot: '08:00-10:00', discount: 15, reason: 'Early morning slots underutilized' }
    ],
    peakPricing: [
      { timeSlot: '18:00-21:00', suggestedIncrease: 20, reason: 'High demand during evening peak hours' },
      { timeSlot: '21:00-23:00', suggestedIncrease: 15, reason: 'Weekend premium hours' }
    ]
  }
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 26; hour++) {
    const time = hour > 23 ? `${hour - 24}:00` : `${hour}:00`;
    const displayTime = hour > 23 ? `${hour - 24}:00` : `${hour}:00`;
    slots.push({
      time: displayTime,
      display: displayTime === '0:00' ? '12:00 AM' : 
               displayTime === '1:00' ? '1:00 AM' : 
               displayTime === '2:00' ? '2:00 AM' : 
               displayTime === '3:00' ? '3:00 AM' : 
               hour >= 12 ? `${hour > 12 ? hour - 12 : hour}:00 PM` : `${hour}:00 AM`
    });
  }
  return slots;
};

export const timeSlots = generateTimeSlots();