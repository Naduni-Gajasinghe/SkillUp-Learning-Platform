import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProfileService } from '../services/profile.service';

const profileService = new ProfileService();

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