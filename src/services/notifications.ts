import { supabase } from '../lib/supabase';

// Twilio SMS Service
export const smsService = {
  async sendBookingConfirmation(phoneNumber: string, bookingDetails: any) {
    try {
      const message = `🎉 Booking Confirmed!
Ground: ${bookingDetails.groundName}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Duration: ${bookingDetails.duration}h
Amount: PKR ${bookingDetails.amount}
Booking ID: ${bookingDetails.id}

Thank you for choosing SportBook!`;

      const response = await fetch('/api/notifications/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          fromNumber: process.env.TWILIO_PHONE_NUMBER
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('SMS sending error:', error);
      throw error;
    }
  },

  async sendReminder(phoneNumber: string, bookingDetails: any) {
    try {
      const message = `⏰ Booking Reminder
Your booking is in 2 hours!
Ground: ${bookingDetails.groundName}
Time: ${bookingDetails.time}
Date: ${bookingDetails.date}

See you soon at SportBook!`;

      const response = await fetch('/api/notifications/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('SMS reminder error:', error);
      throw error;
    }
  }
};

// WhatsApp Business API Service
export const whatsAppService = {
  async sendBookingConfirmation(phoneNumber: string, bookingDetails: any) {
    try {
      const response = await fetch('/api/notifications/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'booking_confirmation',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: bookingDetails.groundName },
                  { type: 'text', text: bookingDetails.date },
                  { type: 'text', text: bookingDetails.time },
                  { type: 'text', text: bookingDetails.duration.toString() },
                  { type: 'text', text: bookingDetails.amount.toString() },
                  { type: 'text', text: bookingDetails.id }
                ]
              }
            ]
          }
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      throw error;
    }
  },

  async sendPromotion(phoneNumber: string, promoDetails: any) {
    try {
      const response = await fetch('/api/notifications/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'promotion_offer',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: promoDetails.discount },
                  { type: 'text', text: promoDetails.validUntil },
                  { type: 'text', text: promoDetails.code }
                ]
              }
            ]
          }
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('WhatsApp promotion error:', error);
      throw error;
    }
  }
};

// Notification Service
export const notificationService = {
  async sendBookingNotifications(bookingDetails: any) {
    try {
      const promises = [];
      
      // Send SMS
      if (bookingDetails.userPhone) {
        promises.push(smsService.sendBookingConfirmation(bookingDetails.userPhone, bookingDetails));
      }
      
      // Send WhatsApp
      if (bookingDetails.userPhone) {
        promises.push(whatsAppService.sendBookingConfirmation(bookingDetails.userPhone, bookingDetails));
      }
      
      // Send Email (using Supabase Edge Functions)
      promises.push(this.sendEmailConfirmation(bookingDetails.userEmail, bookingDetails));
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Notification sending error:', error);
    }
  },

  async sendEmailConfirmation(email: string, bookingDetails: any) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Booking Confirmation - SportBook',
          template: 'booking_confirmation',
          data: bookingDetails
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  },

  async scheduleReminders(bookingDetails: any) {
    try {
      // Schedule 2-hour reminder
      const reminderTime = new Date(bookingDetails.dateTime);
      reminderTime.setHours(reminderTime.getHours() - 2);

      await supabase
        .from('scheduled_notifications')
        .insert({
          booking_id: bookingDetails.id,
          type: 'reminder',
          scheduled_for: reminderTime.toISOString(),
          phone_number: bookingDetails.userPhone,
          email: bookingDetails.userEmail,
          status: 'pending'
        });
    } catch (error) {
      console.error('Reminder scheduling error:', error);
    }
  }
};