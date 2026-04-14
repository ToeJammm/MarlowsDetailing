-- Run this in Supabase Dashboard → SQL Editor
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_slot_ids UUID[] DEFAULT NULL;
