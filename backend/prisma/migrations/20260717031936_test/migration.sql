/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `zoomLink` VARCHAR(191) NULL,
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_REJECTED', 'ASSIGNMENT_CREATED', 'SUBMISSION_REVIEWED', 'LESSON_ADDED', 'TUTOR_APPROVED', 'TUTOR_REJECTED', 'SYSTEM') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_bookingId_key` ON `Payment`(`bookingId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
