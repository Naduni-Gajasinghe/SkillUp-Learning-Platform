-- DropForeignKey
ALTER TABLE `assignment` DROP FOREIGN KEY `Assignment_lessonId_fkey`;

-- DropIndex
DROP INDEX `Assignment_lessonId_fkey` ON `assignment`;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
