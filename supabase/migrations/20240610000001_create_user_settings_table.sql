-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  dark_mode BOOLEAN DEFAULT false,
  date_format TEXT DEFAULT 'dd-mm-yyyy',
  timezone TEXT DEFAULT 'UTC+0',
  company_name TEXT DEFAULT 'Footwear Warehouse Inc.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing own settings
DROP POLICY IF EXISTS "Users can view and update their own settings" ON user_settings;
CREATE POLICY "Users can view and update their own settings"
ON user_settings
FOR ALL
USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table user_settings;