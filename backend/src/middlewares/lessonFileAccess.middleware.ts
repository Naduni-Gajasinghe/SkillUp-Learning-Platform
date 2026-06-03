import { Response, NextFunction } from 'express';
import { LessonRepository } from '../repositories/lesson.repository';
import { AuthRequest } from './auth.middleware';
import { verifyAccessToken } from '../utils/jwt.util';

const lessonRepository = new LessonRepository();

export const lessonFileAccessMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Allow token via query string for direct file links opened in a new tab.
    if (!req.user && typeof req.query.token === 'string') {
      try {
        const decoded = verifyAccessToken(req.query.token) as any;
        req.user = decoded;
      } catch (error) {
        // Ignore invalid query token and continue as unauthenticated.
      }
    }

    const normalizedPath = decodeURIComponent(req.path || '').replace(/\\/g, '/');
    if (!normalizedPath || normalizedPath.includes('..')) {
      return res.status(400).json({ success: false, message: 'Invalid lesson file path' });
    }

    const contentUrl = `/uploads/lessons${normalizedPath}`;
    const lesson = await lessonRepository.findByContentUrl(contentUrl);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson file not found' });
    }

    if (!lesson.isPremium) {
      return next();
    }

    if (!req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: 'Premium lesson is locked. Purchase access first.',
      });
    }

    const hasAccess = await lessonRepository.checkLessonAccess(lesson.id, req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this premium lesson.',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
