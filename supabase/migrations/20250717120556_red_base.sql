/*
  # Add AI Recommendations and Notifications Tables

  1. New Tables
    - `ai_recommendations`
      - `id` (text, primary key)
      - `recommendations` (jsonb)
      - `generated_at` (timestamp)
    - `scheduled_notifications`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `type` (text)
      - `scheduled_for` (timestamp)
      - `phone_number` (text)
      - `email` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- AI Recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id text PRIMARY KEY,
  recommendations jsonb DEFAULT '{}'::jsonb,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI recommendations"
  ON ai_recommendations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Scheduled Notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('reminder', 'confirmation', 'cancellation')),
  scheduled_for timestamptz NOT NULL,
  phone_number text,
  email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled notifications"
  ON scheduled_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Users can read own notifications"
  ON scheduled_notifications
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE user_id IN (
        SELECT id FROM users 
        WHERE auth_id = auth.uid()
      )
    )
  );

-- Add avatar_url column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
END $$;