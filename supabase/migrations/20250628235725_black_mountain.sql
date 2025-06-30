/*
  # Traffic Prediction Database Schema

  1. New Tables
    - `traffic_conditions`
      - `id` (uuid, primary key)
      - `location_lat` (double precision)
      - `location_lng` (double precision)  
      - `location_address` (text)
      - `severity` (text, check constraint)
      - `speed` (integer)
      - `duration` (integer)
      - `confidence` (integer)
      - `timestamp` (timestamptz)
      - `predicted_duration` (integer)
      - `affected_routes` (text array)
      - `cause` (text)
      - `description` (text)
      - `user_id` (uuid, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `saved_routes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional)
      - `origin_lat` (double precision)
      - `origin_lng` (double precision)
      - `destination` (text)
      - `destination_lat` (double precision)
      - `destination_lng` (double precision)
      - `route_name` (text)
      - `distance` (double precision)
      - `duration` (integer)
      - `duration_with_traffic` (integer)
      - `traffic_delay` (integer)
      - `traffic_level` (text)
      - `description` (text)
      - `is_recommended` (boolean)
      - `savings` (integer)
      - `waypoints` (text array)
      - `polyline` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique)
      - `avoid_tolls` (boolean)
      - `avoid_highways` (boolean)
      - `preferred_routes` (text array)
      - `notification_settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `route_analytics`
      - `id` (uuid, primary key)
      - `route_id` (uuid, references saved_routes)
      - `user_id` (uuid, optional)
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for anonymous users to read traffic conditions

  3. Indexes
    - Location-based indexes for efficient spatial queries
    - Time-based indexes for recent data queries
    - User-based indexes for personal data
*/

-- Create traffic_conditions table
CREATE TABLE IF NOT EXISTS traffic_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_lat double precision NOT NULL,
  location_lng double precision NOT NULL,
  location_address text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'severe')),
  speed integer NOT NULL CHECK (speed >= 0 AND speed <= 200),
  duration integer NOT NULL CHECK (duration >= 0),
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  timestamp timestamptz NOT NULL DEFAULT now(),
  predicted_duration integer NOT NULL CHECK (predicted_duration >= 0),
  affected_routes text[] DEFAULT '{}',
  cause text,
  description text,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_routes table
CREATE TABLE IF NOT EXISTS saved_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  origin_lat double precision NOT NULL,
  origin_lng double precision NOT NULL,
  destination text NOT NULL,
  destination_lat double precision,
  destination_lng double precision,
  route_name text NOT NULL,
  distance double precision NOT NULL CHECK (distance >= 0),
  duration integer NOT NULL CHECK (duration >= 0),
  duration_with_traffic integer NOT NULL CHECK (duration_with_traffic >= 0),
  traffic_delay integer NOT NULL DEFAULT 0 CHECK (traffic_delay >= 0),
  traffic_level text NOT NULL CHECK (traffic_level IN ('low', 'moderate', 'high', 'severe')),
  description text NOT NULL DEFAULT '',
  is_recommended boolean NOT NULL DEFAULT false,
  savings integer CHECK (savings >= 0),
  waypoints text[] DEFAULT '{}',
  polyline text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  avoid_tolls boolean NOT NULL DEFAULT false,
  avoid_highways boolean NOT NULL DEFAULT false,
  preferred_routes text[] DEFAULT '{}',
  notification_settings jsonb NOT NULL DEFAULT '{
    "traffic_alerts": true,
    "route_suggestions": true,
    "departure_reminders": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create route_analytics table
CREATE TABLE IF NOT EXISTS route_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES saved_routes(id) ON DELETE CASCADE,
  user_id uuid,
  used_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_traffic_conditions_location ON traffic_conditions (location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_traffic_conditions_timestamp ON traffic_conditions (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_conditions_severity ON traffic_conditions (severity);
CREATE INDEX IF NOT EXISTS idx_traffic_conditions_user_id ON traffic_conditions (user_id);

CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON saved_routes (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_origin ON saved_routes (origin_lat, origin_lng);
CREATE INDEX IF NOT EXISTS idx_saved_routes_created_at ON saved_routes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_route_analytics_route_id ON route_analytics (route_id);
CREATE INDEX IF NOT EXISTS idx_route_analytics_used_at ON route_analytics (used_at DESC);

-- Enable Row Level Security
ALTER TABLE traffic_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for traffic_conditions
CREATE POLICY "Anyone can read traffic conditions"
  ON traffic_conditions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert traffic conditions"
  ON traffic_conditions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own traffic conditions"
  ON traffic_conditions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for saved_routes
CREATE POLICY "Users can read their own routes"
  ON saved_routes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own routes"
  ON saved_routes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own routes"
  ON saved_routes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON saved_routes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can read their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for route_analytics
CREATE POLICY "Users can read analytics for their routes"
  ON route_analytics
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM saved_routes 
      WHERE saved_routes.id = route_analytics.route_id 
      AND saved_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert route analytics"
  ON route_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_traffic_conditions_updated_at
  BEFORE UPDATE ON traffic_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_routes_updated_at
  BEFORE UPDATE ON saved_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();