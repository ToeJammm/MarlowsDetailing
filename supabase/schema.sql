-- ============================================================
-- Marlow's Detailing — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Availability slots (set by owner via /admin)
CREATE TABLE IF NOT EXISTS availability_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date    DATE NOT NULL,
  slot_time    TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_booked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slot_date, slot_time)
);

-- Bookings (submitted by clients)
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id        UUID REFERENCES availability_slots (id) ON DELETE SET NULL,
  slot_date      DATE NOT NULL,
  slot_time      TIME NOT NULL,
  confirm_token  UUID NOT NULL DEFAULT gen_random_uuid(),

  -- Client
  client_name    TEXT NOT NULL,
  client_phone   TEXT NOT NULL,
  client_address TEXT NOT NULL,

  -- Vehicle
  car_make       TEXT NOT NULL,
  car_model      TEXT NOT NULL,
  car_year       TEXT,
  vehicle_type   TEXT NOT NULL CHECK (vehicle_type IN ('sedan_coupe', 'suv_truck')),
  dirt_rating    INTEGER NOT NULL CHECK (dirt_rating >= 1 AND dirt_rating <= 10),

  -- Services
  services       TEXT[] NOT NULL,
  addons         TEXT[],

  -- Utilities
  has_water      BOOLEAN NOT NULL,
  has_power      BOOLEAN NOT NULL,

  -- Notes & status
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'denied')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can read available, unbooked slots (for the booking calendar)
CREATE POLICY "Public can read available slots"
  ON availability_slots FOR SELECT
  USING (is_available = TRUE AND is_booked = FALSE);

-- Anyone can create a booking
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (TRUE);

-- Service role (used in API routes) bypasses RLS automatically
-- No additional policies needed for server-side admin operations

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_slots_date ON availability_slots (slot_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings (confirm_token);
