import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProfileService } from '../services/profile.service';
import { NotificationService } from '../services/notification.service';
import { NotificationType } from '@prisma/client';

const profileService = new ProfileService();
const notificationService = new NotificationService();

export class AdminController {
  async getPendingTutorApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const applications = await profileService.getPendingTutorApplications();
      res.status(200).json({ success: true, data: applications });
    } catch (error: any) {
      next(error);
    }
  }

  async updateTutorVerificationStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = String(req.params.id);
      const { verificationStatus } = req.body;
      const tutorProfile = await profileService.updateTutorVerificationStatus(userId, verificationStatus);
      
      // Send notification to tutor about their application status
      const message = verificationStatus === 'APPROVED' 
        ? 'Congratulations! Your tutor application has been approved. You can now accept bookings from learners.'
        : 'Your tutor application has been rejected. Please review your profile and reapply.';
      
      const notificationType = verificationStatus === 'APPROVED' 
        ? NotificationType.TUTOR_APPROVED 
        : NotificationType.TUTOR_REJECTED;

      await notificationService.createNotification({
        userId,
        title: `Application ${verificationStatus.toLowerCase()}`,
        message,
        type: notificationType,
      });

      res.status(200).json({
        success: true,
        message: `Tutor application ${verificationStatus.toLowerCase()}`,
        data: tutorProfile,
      });
    } catch (error: any) {
      next(error);
    }
  }
}