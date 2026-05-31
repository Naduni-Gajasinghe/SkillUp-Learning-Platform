import { Response, NextFunction } from 'express';
import { GamificationService } from '../services/gamification.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const gamificationService = new GamificationService();

export class GamificationController {
  async getBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const badges = await gamificationService.getUserBadges(req.user!.userId);
      res.status(200).json({ success: true, data: badges });
    } catch (error: any) {
      next(error);
    }
  }

  async getAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const achievements = await gamificationService.getUserAchievements(req.user!.userId);
      res.status(200).json({ success: true, data: achievements });
    } catch (error: any) {
      next(error);
    }
  }

  async getPoints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const points = await gamificationService.getUserPoints(req.user!.userId);
      res.status(200).json({ success: true, data: points });
    } catch (error: any) {
      next(error);
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await gamificationService.getLeaderboard(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error: any) {
      next(error);
    }
  }
}
