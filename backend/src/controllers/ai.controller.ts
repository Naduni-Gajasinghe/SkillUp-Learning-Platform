import { Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const aiService = new AIService();

export class AIController {
  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recommendations = await aiService.getRecommendations(req.user!.userId);
      res.status(200).json({ success: true, data: recommendations });
    } catch (error: any) {
      next(error);
    }
  }

  async performSkillAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessment = await aiService.performSkillAssessment(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: assessment });
    } catch (error: any) {
      next(error);
    }
  }

  async getLearningPath(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const paths = await aiService.getLearningPath(req.user!.userId);
      res.status(200).json({ success: true, data: paths });
    } catch (error: any) {
      next(error);
    }
  }
}
