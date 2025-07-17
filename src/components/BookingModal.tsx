import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CreditCard } from 'lucide-react';
import { Ground, BookingSlot } from '../types';
import { formatCurrency, calculatePrice } from '../utils/pricing';
import { databaseService } from '../services/database';
import { paymentService } from '../services/payments';
import { notificationService } from '../services/notifications';
import { googleCalendarService } from '../services/googleAuth';
import { useAuth } from '../hooks/useAuth';
import { timeSlots } from '../data/mockData';
import { format, addDays } from 'date-fns';

interface BookingModalProps {
  ground: Ground;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ ground, isOpen, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'card'>('card');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const { profile } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [bookingsData, rulesData] = await Promise.all([
        databaseService.getBookings(),
        databaseService.getPricingRules()
      ]);
      setBookings(bookingsData);
      setPricingRules(rulesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const isSlotBooked = (time: string) => {
    return bookings.some(booking => 
      booking.groundId === ground.id && 
      booking.date === selectedDate && 
      booking.time === time &&
      booking.paymentStatus === 'paid'
    );
  };

  const pricing = selectedTime ? calculatePrice(
    ground.currentPrice,
    new Date(selectedDate),
    selectedTime,
    duration,
    pricingRules
  ) : null;

  const handleBooking = async () => {
    if (!selectedTime || !userInfo.name || !userInfo.email || !userInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!profile) {
      alert('Please log in to make a booking');
      return;
    }

    setLoading(true);
    
    try {
      // Create booking first
      const booking: Omit<BookingSlot, 'id' | 'createdAt'> = {
        groundId: ground.id,
        date: selectedDate,
        time: selectedTime,
        duration,
        price: pricing?.finalPrice || 0,
        isBooked: false, // Will be set to true after successful payment
        userId: profile.id,
        userName: userInfo.name,
        userEmail: userInfo.email,
        userPhone: userInfo.phone,
        paymentStatus: 'pending',
        paymentMethod,
        discountApplied: pricing?.discountApplied || 0
      };

      const createdBooking = await databaseService.addBooking(booking);

      // Process payment
      const paymentResult = await paymentService.processPayment(
        paymentMethod,
        pricing?.finalPrice || 0,
        createdBooking,
        {
          phoneNumber: userInfo.phone,
          paymentMethodId: 'pm_test_123' // This would come from Stripe Elements in real implementation
        }
      );

      if (paymentResult.success) {
        // Update booking status
        await databaseService.updateBooking(createdBooking.id, { 
          paymentStatus: 'paid',
          isBooked: true 
        });

        // Send notifications
        await notificationService.sendBookingNotifications({
          ...createdBooking,
          groundName: ground.name,
          amount: pricing?.finalPrice || 0
        });

        // Add to Google Calendar if requested
        if (addToCalendar) {
          try {
            const accessToken = await googleCalendarService.getCalendarAccessToken();
            await googleCalendarService.addBookingToCalendar({
              ...createdBooking,
              groundName: ground.name,
              amount: pricing?.finalPrice || 0
            }, accessToken);
          } catch (calendarError) {
            console.error('Calendar sync error:', calendarError);
            // Don't fail the booking if calendar sync fails
          }
        }

        alert('🎉 Booking confirmed! Payment successful. Confirmation sent via SMS and WhatsApp.');
      } else {
        // Payment failed, update booking status
        await databaseService.updateBooking(createdBooking.id, { paymentStatus: 'failed' });
        alert('❌ Payment failed. Please try again or contact support.');
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM dd, yyyy')
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Book {ground.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none md:col-span-2"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Select Date
                </h3>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                >
                  {availableDates.map(date => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Clock className="mr-2" size={20} />
                  Select Time
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={isSlotBooked(slot.time)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        isSlotBooked(slot.time)
                          ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                          : selectedTime === slot.time
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Duration (Hours)</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6].map(hours => (
                    <button
                      key={hours}
                      onClick={() => setDuration(hours)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        duration === hours
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'jazzcash', label: 'JazzCash', color: 'bg-orange-500' },
                    { id: 'easypaisa', label: 'EasyPaisa', color: 'bg-green-500' },
                    { id: 'card', label: 'Card', color: 'bg-blue-500' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-lg font-medium transition-all ${
                        paymentMethod === method.id
                          ? `${method.color} text-white`
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Calendar Integration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="addToCalendar"
                    checked={addToCalendar}
                    onChange={(e) => setAddToCalendar(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="addToCalendar" className="text-white text-sm">
                    Add to Google Calendar (with reminders)
                  </label>
                </div>
              </div>

              {/* Pricing Summary */}
              {pricing && (
                <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-white">Booking Summary</h3>
                  <div className="flex justify-between text-gray-300">
                    <span>Base Price ({duration}h)</span>
                    <span>{formatCurrency(ground.currentPrice * duration)}</span>
                  </div>
                  {pricing.discountApplied > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({pricing.discountApplied}%)</span>
                      <span>-{formatCurrency((ground.currentPrice * duration) - pricing.finalPrice)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-600 pt-2">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(pricing.finalPrice)}</span>
                    </div>
                  </div>
                  {pricing.discountDetails.length > 0 && (
                    <div className="text-sm text-gray-400">
                      {pricing.discountDetails.map((detail, index) => (
                        <div key={index}>• {detail}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBooking}
                disabled={!selectedTime || !userInfo.name || !userInfo.email || !userInfo.phone || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="spinner mr-2"></div>
                ) : null}
                {loading ? 'Processing...' : `Confirm Booking & Pay ${pricing ? formatCurrency(pricing.finalPrice) : ''}`}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;