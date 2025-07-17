import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

// Initialize OpenAI with error handling
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
  }
} catch (error) {
  console.warn('OpenAI initialization failed:', error);
}

export const aiService = {
  // Analyze booking patterns and suggest optimal pricing
  async analyzePricingOptimization(bookingData: any[], groundData: any[]) {
    if (!openai) {
      console.warn('OpenAI not available, using fallback recommendations');
      return this.getFallbackPricingRecommendations();
    }

    try {
      const prompt = `
        Analyze the following sports booking data and provide pricing optimization recommendations:
        
        Booking Data: ${JSON.stringify(bookingData.slice(-50))} // Last 50 bookings
        Ground Data: ${JSON.stringify(groundData)}
        
        Please provide:
        1. Optimal discount percentages for low-demand time slots
        2. Surge pricing recommendations for peak hours
        3. Seasonal pricing adjustments
        4. Revenue optimization strategies
        
        Format the response as JSON with specific recommendations.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI pricing optimization expert for sports facility bookings. Provide data-driven recommendations in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI pricing analysis error:', error);
      return this.getFallbackPricingRecommendations();
    }
  },

  // Predict peak hours based on historical data
  async predictPeakHours(bookingData: any[]) {
    if (!openai) {
      console.warn('OpenAI not available, using fallback predictions');
      return this.getFallbackPeakHourPredictions();
    }

    try {
      const hourlyBookings = this.aggregateBookingsByHour(bookingData);
      
      const prompt = `
        Based on this hourly booking data: ${JSON.stringify(hourlyBookings)}
        
        Predict:
        1. Peak hours for the next week
        2. Low-demand periods
        3. Recommended pricing adjustments
        4. Capacity optimization suggestions
        
        Provide response in JSON format with specific time slots and recommendations.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI demand forecasting expert for sports facilities. Analyze patterns and predict future demand."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI peak hour prediction error:', error);
      return this.getFallbackPeakHourPredictions();
    }
  },

  // Generate personalized promotional campaigns
  async generatePromotionalCampaigns(userData: any[], bookingData: any[]) {
    if (!openai) {
      console.warn('OpenAI not available, using fallback campaigns');
      return this.getFallbackCampaigns();
    }

    try {
      const userSegments = this.segmentUsers(userData, bookingData);
      
      const prompt = `
        Create personalized promotional campaigns for these user segments:
        ${JSON.stringify(userSegments)}
        
        Generate:
        1. Email subject lines and content
        2. Discount offers tailored to each segment
        3. WhatsApp message templates
        4. Optimal timing for campaigns
        
        Focus on sports booking context and Pakistani market preferences.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI marketing expert specializing in sports facility promotions for the Pakistani market."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI campaign generation error:', error);
      return this.getFallbackCampaigns();
    }
  },

  // Chatbot responses for customer queries
  async getChatbotResponse(userMessage: string, context: any = {}) {
    if (!openai) {
      return "I'm currently offline for maintenance. Please contact our support team for assistance, or try again later.";
    }

    try {
      const prompt = `
        You are SportBook's AI assistant for an indoor sports booking platform in Pakistan.
        
        User message: "${userMessage}"
        Context: ${JSON.stringify(context)}
        
        Provide helpful, friendly responses about:
        - Booking procedures
        - Pricing and discounts
        - Ground availability
        - Payment methods (JazzCash, EasyPaisa, Cards)
        - Facility information
        - General sports queries
        
        Keep responses concise and helpful. Use Pakistani context and currency (PKR).
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are SportBook's friendly AI assistant. Help users with booking-related queries in a conversational manner."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      });

      return completion.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try again or contact our support team.";
    } catch (error) {
      console.error('AI chatbot error:', error);
      return "I'm currently experiencing technical difficulties. Please contact our support team for assistance.";
    }
  },

  // Helper functions
  aggregateBookingsByHour(bookings: any[]) {
    const hourlyData: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const hour = booking.time;
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    
    return hourlyData;
  },

  segmentUsers(users: any[], bookings: any[]) {
    const segments = {
      frequent_users: [],
      occasional_users: [],
      new_users: [],
      high_value: [],
      price_sensitive: []
    };

    // Simple segmentation logic
    users.forEach(user => {
      const userBookings = bookings.filter(b => b.user_id === user.id);
      const totalSpent = userBookings.reduce((sum, b) => sum + b.price, 0);
      
      if (userBookings.length >= 10) {
        segments.frequent_users.push(user);
      } else if (userBookings.length >= 3) {
        segments.occasional_users.push(user);
      } else {
        segments.new_users.push(user);
      }
      
      if (totalSpent >= 10000) {
        segments.high_value.push(user);
      }
      
      const avgDiscount = userBookings.reduce((sum, b) => sum + (b.discount_applied || 0), 0) / userBookings.length;
      if (avgDiscount > 15) {
        segments.price_sensitive.push(user);
      }
    });

    return segments;
  },

  // Fallback responses when AI service is unavailable
  getFallbackPricingRecommendations() {
    return {
      discountRecommendations: [
        { timeSlot: '12:00-15:00', discount: 25, reason: 'Low demand during lunch hours' },
        { timeSlot: '08:00-10:00', discount: 15, reason: 'Early morning slots underutilized' }
      ],
      surgePricing: [
        { timeSlot: '18:00-21:00', increase: 20, reason: 'High demand during evening peak hours' },
        { timeSlot: '21:00-23:00', increase: 15, reason: 'Weekend premium hours' }
      ]
    };
  },

  getFallbackPeakHourPredictions() {
    return {
      peakHours: ['17:00', '18:00', '19:00', '20:00'],
      lowDemandPeriods: ['12:00', '13:00', '14:00', '15:00'],
      recommendations: [
        'Increase pricing by 15-20% during 18:00-21:00',
        'Offer 20% discount during 12:00-15:00 to boost utilization'
      ]
    };
  },

  getFallbackCampaigns() {
    return {
      campaigns: [
        {
          segment: 'new_users',
          subject: 'Welcome to SportBook - 30% Off Your First Booking!',
          discount: 30,
          message: 'Book your first game with us and save 30%!'
        },
        {
          segment: 'frequent_users',
          subject: 'VIP Discount - 20% Off This Weekend',
          discount: 20,
          message: 'Thank you for being a loyal customer. Enjoy 20% off!'
        }
      ]
    };
  }
};

// Real-time AI Analytics Service
export const aiAnalyticsService = {
  async updateRealTimeRecommendations() {
    try {
      // Get latest booking data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: grounds } = await supabase
        .from('grounds')
        .select('*');

      if (bookings && grounds) {
        // Generate AI recommendations
        const recommendations = await aiService.analyzePricingOptimization(bookings, grounds);
        
        // Store recommendations in database
        await supabase
          .from('ai_recommendations')
          .upsert({
            id: 'current',
            recommendations,
            generated_at: new Date().toISOString()
          });

        return recommendations;
      }
    } catch (error) {
      console.error('Real-time AI analytics error:', error);
    }
  },

  async schedulePeriodicAnalysis() {
    // Run AI analysis every hour
    setInterval(async () => {
      await this.updateRealTimeRecommendations();
    }, 60 * 60 * 1000);
  }
};