import { GoogleAuth } from 'google-auth-library';
import { supabase } from '../lib/supabase';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

export const googleAuthService = {
  // Initialize Google Sign-In
  async initializeGoogleAuth() {
    try {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: this.handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    } catch (error) {
      console.error('Google Auth initialization error:', error);
    }
  },

  // Handle Google Sign-In Response
  async handleGoogleSignIn(response: any) {
    try {
      const credential = response.credential;
      const decodedToken = this.parseJwt(credential);
      
      // Sign in with Supabase using Google token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) throw error;

      // Create or update user profile
      if (data.user) {
        await this.createOrUpdateUserProfile(data.user, decodedToken);
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },

  // Create or update user profile in database
  async createOrUpdateUserProfile(user: any, googleData: any) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (!existingUser) {
        // Create new user profile
        const { error } = await supabase
          .from('users')
          .insert({
            auth_id: user.id,
            name: googleData.name || user.user_metadata?.full_name,
            email: googleData.email || user.email,
            phone: user.user_metadata?.phone || null,
            is_admin: googleData.email === 'admin@sportbook.com',
            avatar_url: googleData.picture || user.user_metadata?.avatar_url
          });

        if (error) throw error;
      } else {
        // Update existing user profile
        const { error } = await supabase
          .from('users')
          .update({
            name: googleData.name || existingUser.name,
            avatar_url: googleData.picture || existingUser.avatar_url
          })
          .eq('auth_id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('User profile creation/update error:', error);
      throw error;
    }
  },

  // Parse JWT token
  parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT parsing error:', error);
      return {};
    }
  },

  // Sign out
  async signOut() {
    try {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Google sign-out error:', error);
      throw error;
    }
  }
};

// Google Calendar Integration
export const googleCalendarService = {
  async addBookingToCalendar(bookingDetails: any, accessToken: string) {
    try {
      const event = {
        summary: `SportBook - ${bookingDetails.groundName}`,
        description: `Booking at SportBook\nGround: ${bookingDetails.groundName}\nDuration: ${bookingDetails.duration} hours\nAmount: PKR ${bookingDetails.amount}`,
        start: {
          dateTime: new Date(`${bookingDetails.date}T${bookingDetails.time}:00`).toISOString(),
          timeZone: 'Asia/Karachi'
        },
        end: {
          dateTime: new Date(new Date(`${bookingDetails.date}T${bookingDetails.time}:00`).getTime() + (bookingDetails.duration * 60 * 60 * 1000)).toISOString(),
          timeZone: 'Asia/Karachi'
        },
        location: 'SportBook Indoor Sports Facility',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 120 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error('Failed to add event to calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Google Calendar error:', error);
      throw error;
    }
  },

  async getCalendarAccessToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        return session.provider_token;
      }
      throw new Error('No calendar access token available');
    } catch (error) {
      console.error('Calendar access token error:', error);
      throw error;
    }
  }
};