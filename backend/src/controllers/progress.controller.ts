import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { GamificationService } from '../services/gamification.service';

const gamificationService = new GamificationService();

export class ProgressController {
  async trackView(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lessonId = req.params.lessonId as string;
      await prisma.lessonView.create({
        data: {
          lessonId,
          userId: req.user!.userId,
        },
      });

      // Award gamification points for lesson view (+10)
      try {
        await gamificationService.awardViewPoints(req.user!.userId);
      } catch (e) {
        // Don't fail the main request if gamification fails
        console.error('Gamification view points error:', e);
      }

      res.status(200).json({ success: true, message: 'View tracked' });
    } catch (error: any) {
      next(error);
    }
  }

  async markAsCompleted(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lessonId = req.params.lessonId as string;
      await prisma.userProgress.upsert({
        where: {
          userId_lessonId: {
            userId: req.user!.userId,
            lessonId,
          },
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        },
        create: {
          userId: req.user!.userId,
          lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Award gamification points for lesson completion (+20)
      try {
        await gamificationService.awardCompletionPoints(req.user!.userId);
      } catch (e) {
        // Don't fail the main request if gamification fails
        console.error('Gamification completion points error:', e);
      }

      res.status(200).json({ success: true, message: 'Lesson marked as completed' });
    } catch (error: any) {
      next(error);
    }
  }

  async getMyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await prisma.userProgress.findMany({
        where: { userId: req.user!.userId },
        include: {
          lesson: {
            select: { id: true, title: true, difficulty: true, category: { select: { name: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      res.status(200).json({ success: true, data: progress });
    } catch (error: any) {
      next(error);
    }
  }
}
