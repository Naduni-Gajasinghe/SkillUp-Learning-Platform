-- Add missing BookingStatus enum values (PENDING, CONFIRMED, REJECTED) to the Booking table
ALTER TABLE `Booking`
  MODIFY COLUMN `status` ENUM(
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
  ) NOT NULL DEFAULT 'SCHEDULED';
