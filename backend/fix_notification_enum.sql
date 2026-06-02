-- Add new NotificationType enum values to the Notification table
ALTER TABLE `Notification`
  MODIFY COLUMN `type` ENUM(
    'BOOKING_CREATED',
    'BOOKING_CONFIRMED',
    'BOOKING_CANCELLED',
    'BOOKING_REJECTED',
    'ASSIGNMENT_CREATED',
    'SUBMISSION_REVIEWED',
    'LESSON_ADDED',
    'TUTOR_APPROVED',
    'TUTOR_REJECTED',
    'SYSTEM'
  ) NOT NULL;
