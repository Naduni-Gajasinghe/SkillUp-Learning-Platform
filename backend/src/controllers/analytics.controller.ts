import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getTutorStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getTutorAnalytics(req.user!.userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      next(error);
    }
  }

  async getLearnerProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getLearnerAnalytics(req.user!.userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      next(error);
    }
  }

  async getLearnerLearningStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getLearnerLearningStats(req.user!.userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      next(error);
    }
  }

  async getPlatformStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getAdminAnalytics();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      next(error);
    }
  }
}
