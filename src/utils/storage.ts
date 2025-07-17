import { BookingSlot, Ground, User, PricingRule } from '../types';

const STORAGE_KEYS = {
  BOOKINGS: 'sports_bookings',
  GROUNDS: 'sports_grounds',
  USERS: 'sports_users',
  PRICING_RULES: 'sports_pricing_rules',
  CURRENT_USER: 'sports_current_user'
};

export const storage = {
  // Bookings
  getBookings: (): BookingSlot[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  },
  
  saveBookings: (bookings: BookingSlot[]) => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },
  
  addBooking: (booking: BookingSlot) => {
    const bookings = storage.getBookings();
    bookings.push(booking);
    storage.saveBookings(bookings);
  },
  
  updateBooking: (id: string, updates: Partial<BookingSlot>) => {
    const bookings = storage.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      storage.saveBookings(bookings);
    }
  },
  
  // Grounds
  getGrounds: (): Ground[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GROUNDS);
    return data ? JSON.parse(data) : [];
  },
  
  saveGrounds: (grounds: Ground[]) => {
    localStorage.setItem(STORAGE_KEYS.GROUNDS, JSON.stringify(grounds));
  },
  
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },
  
  // Pricing Rules
  getPricingRules: (): PricingRule[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRICING_RULES);
    return data ? JSON.parse(data) : [];
  },
  
  savePricingRules: (rules: PricingRule[]) => {
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(rules));
  }
};