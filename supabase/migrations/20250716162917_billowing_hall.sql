/*
  # Sports Booking Website Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
    
    - `grounds`
      - `id` (uuid, primary key)
      - `name` (text)
      - `sport` (text, check constraint for Cricket/Football)
      - `default_price` (integer)
      - `current_price` (integer)
      - `image` (text)
      - `description` (text)
      - `facilities` (text array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `ground_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `time` (text)
      - `duration` (integer)
      - `price` (integer)
      - `user_name` (text)
      - `user_email` (text)
      - `user_phone` (text)
      - `payment_status` (text, check constraint)
      - `payment_method` (text)
      - `discount_applied` (integer, default 0)
      - `created_at` (timestamp)
    
    - `pricing_rules`
      - `id` (uuid, primary key)
      - `type` (text, check constraint)
      - `discount` (integer)
      - `condition` (jsonb)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for management operations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create grounds table
CREATE TABLE IF NOT EXISTS grounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sport text NOT NULL CHECK (sport IN ('Cricket', 'Football')),
  default_price integer NOT NULL DEFAULT 1500,
  current_price integer NOT NULL DEFAULT 1500,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  facilities text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id uuid REFERENCES grounds(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time text NOT NULL,
  duration integer NOT NULL DEFAULT 1,
  price integer NOT NULL DEFAULT 0,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method text CHECK (payment_method IN ('jazzcash', 'easypaisa', 'card')),
  discount_applied integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create pricing_rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('weekday', 'bulk', 'peak', 'off-peak')),
  discount integer NOT NULL DEFAULT 0,
  condition jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Anyone can insert user data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Grounds policies
CREATE POLICY "Anyone can read active grounds"
  ON grounds
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage grounds"
  ON grounds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Pricing rules policies
CREATE POLICY "Anyone can read active pricing rules"
  ON pricing_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage pricing rules"
  ON pricing_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Insert default grounds
INSERT INTO grounds (name, sport, default_price, current_price, image, description, facilities) VALUES
(
  'Cricket Ground 1',
  'Cricket',
  1800,
  1800,
  'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Professional cricket ground with modern facilities',
  ARRAY['Flood Lights', 'Changing Rooms', 'Parking', 'Refreshments']
),
(
  'Football Ground 1',
  'Football',
  1500,
  1500,
  'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Standard football ground with artificial turf',
  ARRAY['Artificial Turf', 'Goal Posts', 'Flood Lights', 'Changing Rooms']
);

-- Insert default pricing rules
INSERT INTO pricing_rules (type, discount, condition) VALUES
('weekday', 15, '{"daysOfWeek": [1, 2, 3, 4]}'),
('bulk', 10, '{"minHours": 3}'),
('bulk', 15, '{"minHours": 5}'),
('off-peak', 20, '{"timeRange": {"start": "12:00", "end": "15:00"}}');