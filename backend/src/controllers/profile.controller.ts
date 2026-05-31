import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { updateLearnerProfileSchema, updateTutorProfileSchema } from '../utils/profile.validation';

const profileService = new ProfileService();

export class ProfileController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.getProfile(req.user!.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const roles = req.user!.roles;
      let updatedProfile;

      const rawData = req.file ? {
        ...req.body,
        profileImage: `/uploads/profiles/${req.file.filename}`,
      } : req.body;

      if (roles.includes('TUTOR')) {
        const validatedData = await updateTutorProfileSchema.parseAsync(rawData);
        updatedProfile = await profileService.updateTutorProfile(userId, validatedData);
      } else if (roles.includes('LEARNER')) {
        const validatedData = await updateLearnerProfileSchema.parseAsync(rawData);
        updatedProfile = await profileService.updateLearnerProfile(userId, validatedData);
      } else {
        throw new Error('No specific profile found for this role');
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getTutorProfiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tutors = await profileService.getTutors();
      res.status(200).json({
        success: true,
        data: tutors,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
