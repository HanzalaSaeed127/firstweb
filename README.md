# 🏏 SportBook - Professional Indoor Sports Booking Platform

A comprehensive sports facility booking system with AI-powered analytics, dynamic pricing, and real-time notifications.

## 🚀 Features

### 🎮 Booking System
- **Real-time availability** for Cricket and Football grounds
- **Dynamic pricing** with weekday discounts and bulk booking incentives
- **Interactive time slot selection** (8:00 AM - 3:00 AM daily)
- **Mobile-responsive design** with smooth animations

### 🧑‍💼 Admin Dashboard
- **Complete ground management** (add, edit, pricing control)
- **Booking management** with status updates
- **Advanced analytics** with charts and insights
- **AI-powered recommendations** for optimal pricing

### 💳 Payment Integration
- **Multiple payment methods**: JazzCash, EasyPaisa, Credit/Debit Cards
- **Secure payment processing** with Stripe integration
- **Real-time payment verification**

### 📱 Notifications
- **SMS confirmations** via Twilio
- **WhatsApp Business API** integration
- **Email notifications** with beautiful templates
- **Automated reminders** 2 hours before booking

### 🤖 AI-Powered Features
- **Smart pricing optimization** based on demand patterns
- **Peak hour predictions** with surge pricing recommendations
- **Personalized promotional campaigns**
- **Live chatbot assistant** for customer support

### 🔐 Authentication
- **Email/password authentication**
- **Google Sign-In integration**
- **Role-based access control** (Admin/User)
- **Secure session management**

### 📅 Additional Features
- **Google Calendar sync** with automatic reminders
- **Booking history** and user profiles
- **Real-time availability updates**
- **Responsive design** for all devices

## 🛠️ Tech Stack

- **Frontend**: React.js + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth + Google OAuth
- **Payments**: Stripe, JazzCash, EasyPaisa APIs
- **Notifications**: Twilio SMS, WhatsApp Business API
- **AI**: OpenAI GPT-4 for analytics and chatbot
- **Calendar**: Google Calendar API
- **Animations**: Framer Motion
- **Charts**: Recharts

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
JAZZCASH_MERCHANT_ID=your_jazzcash_merchant_id
JAZZCASH_PASSWORD=your_jazzcash_password
JAZZCASH_INTEGRITY_SALT=your_jazzcash_salt
EASYPAISA_STORE_ID=your_easypaisa_store_id
EASYPAISA_HASH_KEY=your_easypaisa_hash_key

# Notifications
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
```

### 2. Database Setup

The database schema is automatically created when you connect Supabase. The following tables will be created:

- `users` - User accounts and profiles
- `grounds` - Sports ground details
- `bookings` - Booking records
- `pricing_rules` - Dynamic pricing configuration
- `ai_recommendations` - AI-generated insights
- `scheduled_notifications` - Notification queue

### 3. Admin Access

To get admin access:

1. **Method 1**: Sign up with email `admin@sportbook.com`
2. **Method 2**: Manually update the database:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
   ```
3. **Method 3**: Use Google Sign-In with `admin@sportbook.com` Google account

### 4. Payment Gateway Setup

#### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get your secret key from the dashboard
3. Add webhook endpoints for payment confirmations

#### JazzCash
1. Contact JazzCash for merchant account
2. Get Merchant ID, Password, and Integrity Salt
3. Configure webhook URLs for payment notifications

#### EasyPaisa
1. Apply for EasyPaisa merchant account
2. Get Store ID and Hash Key
3. Set up callback URLs

### 5. Notification Services

#### Twilio SMS
1. Create account at [twilio.com](https://twilio.com)
2. Get Account SID, Auth Token, and phone number
3. Verify phone numbers for testing

#### WhatsApp Business API
1. Apply for WhatsApp Business API access
2. Get access token and phone number ID
3. Create message templates

### 6. AI Integration

#### OpenAI
1. Create account at [openai.com](https://openai.com)
2. Generate API key
3. Set up usage limits and monitoring

#### Google Services
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Sign-In and Calendar APIs
3. Create OAuth 2.0 credentials

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist folder to your hosting provider
```

### Backend (Supabase Edge Functions)
```bash
# Edge functions are automatically deployed with Supabase
# No additional deployment needed
```

### Environment Setup
1. Set all environment variables in your hosting provider
2. Configure domain and SSL certificates
3. Set up monitoring and error tracking

## 📱 Usage

### For Users
1. **Sign up/Login** using email or Google
2. **Browse available grounds** and time slots
3. **Select date, time, and duration**
4. **Choose payment method** and complete booking
5. **Receive confirmations** via SMS, WhatsApp, and email
6. **View booking history** in your profile

### For Admins
1. **Access admin dashboard** at `/admin`
2. **Manage grounds** - add, edit, set pricing
3. **View analytics** - revenue, popular slots, trends
4. **Manage bookings** - view, edit, cancel
5. **Configure pricing rules** and discounts
6. **Monitor AI recommendations**

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** with secure sessions
- **Input validation** and sanitization
- **Rate limiting** on API endpoints
- **Encrypted payment processing**
- **HTTPS enforcement**

## 🎨 Design System

- **Dark theme** with professional sports aesthetics
- **Royal Blue (#3B82F6)** and **Neon Green (#22C55E)** color scheme
- **Inter font family** for modern typography
- **Smooth animations** with Framer Motion
- **Responsive grid layouts** for all screen sizes
- **Glass-morphism effects** and gradient backgrounds

## 📊 Analytics & AI

The system provides comprehensive analytics including:

- **Revenue tracking** by day, week, month
- **Popular time slots** and demand patterns
- **Ground utilization** rates
- **Customer segmentation** and behavior analysis
- **AI-powered pricing recommendations**
- **Automated promotional campaigns**

## 🤝 Support

For technical support or questions:
- **Email**: support@sportbook.com
- **Phone**: +92-XXX-XXXXXXX
- **Live Chat**: Available in the app
- **Documentation**: [docs.sportbook.com](https://docs.sportbook.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the sports community in Pakistan**