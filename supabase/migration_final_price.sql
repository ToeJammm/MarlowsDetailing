-- Add final_price column to bookings for manual price adjustments / tips
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_price INTEGER;
