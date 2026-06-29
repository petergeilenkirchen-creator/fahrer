-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('arrival', 'departure')),
  driver TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  flight TEXT NOT NULL,
  passengers INTEGER NOT NULL CHECK (passengers > 0),
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rides_date ON rides(date);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver);
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers(name);
