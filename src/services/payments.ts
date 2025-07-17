import { supabase } from '../lib/supabase';

// Stripe Integration
export const stripeService = {
  async createPaymentIntent(amount: number, currency: string = 'pkr') {
    try {
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });
      return await response.json();
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw error;
    }
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    try {
      const response = await fetch('/api/payments/stripe/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, paymentMethodId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Stripe confirmation error:', error);
      throw error;
    }
  }
};

// JazzCash Integration
export const jazzCashService = {
  async initiatePayment(amount: number, phoneNumber: string, bookingId: string) {
    try {
      const response = await fetch('/api/payments/jazzcash/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount, 
          phoneNumber, 
          bookingId,
          merchantId: process.env.JAZZCASH_MERCHANT_ID,
          password: process.env.JAZZCASH_PASSWORD,
          integritySalt: process.env.JAZZCASH_INTEGRITY_SALT
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('JazzCash payment error:', error);
      throw error;
    }
  },

  async verifyPayment(transactionId: string) {
    try {
      const response = await fetch('/api/payments/jazzcash/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });
      return await response.json();
    } catch (error) {
      console.error('JazzCash verification error:', error);
      throw error;
    }
  }
};

// EasyPaisa Integration
export const easyPaisaService = {
  async initiatePayment(amount: number, phoneNumber: string, bookingId: string) {
    try {
      const response = await fetch('/api/payments/easypaisa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount, 
          phoneNumber, 
          bookingId,
          storeId: process.env.EASYPAISA_STORE_ID,
          hashKey: process.env.EASYPAISA_HASH_KEY
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('EasyPaisa payment error:', error);
      throw error;
    }
  },

  async verifyPayment(transactionId: string) {
    try {
      const response = await fetch('/api/payments/easypaisa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });
      return await response.json();
    } catch (error) {
      console.error('EasyPaisa verification error:', error);
      throw error;
    }
  }
};

// Payment Processing Service
export const paymentService = {
  async processPayment(
    method: 'jazzcash' | 'easypaisa' | 'card',
    amount: number,
    bookingData: any,
    paymentDetails: any
  ) {
    try {
      let paymentResult;
      
      switch (method) {
        case 'jazzcash':
          paymentResult = await jazzCashService.initiatePayment(
            amount,
            paymentDetails.phoneNumber,
            bookingData.id
          );
          break;
          
        case 'easypaisa':
          paymentResult = await easyPaisaService.initiatePayment(
            amount,
            paymentDetails.phoneNumber,
            bookingData.id
          );
          break;
          
        case 'card':
          const paymentIntent = await stripeService.createPaymentIntent(amount);
          paymentResult = await stripeService.confirmPayment(
            paymentIntent.id,
            paymentDetails.paymentMethodId
          );
          break;
          
        default:
          throw new Error('Invalid payment method');
      }

      // Update booking status in database
      if (paymentResult.success) {
        await supabase
          .from('bookings')
          .update({ 
            payment_status: 'paid',
            payment_method: method 
          })
          .eq('id', bookingData.id);
      }

      return paymentResult;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }
};