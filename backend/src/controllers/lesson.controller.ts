import { Response, NextFunction } from 'express';
import { LessonService } from '../services/lesson.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createLessonSchema, updateLessonSchema } from '../utils/lesson.validation';

const lessonService = new LessonService();

export class LessonController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = await createLessonSchema.parseAsync(req.body);
      const contentUrl = req.file ? `/uploads/lessons/${req.file.filename}` : null;
      
      const lesson = await lessonService.createLesson(
        { ...validatedData, contentUrl },
        req.user!.userId
      );
      
      res.status(201).json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lessons = await lessonService.getAllLessons(req.query, req.user?.userId);
      res.status(200).json({
        success: true,
        data: lessons,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lesson = await lessonService.getLessonById(
        req.params.id as string,
        req.user?.userId
      );
      res.status(200).json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = await updateLessonSchema.parseAsync(req.body);
      const contentUrl = req.file ? `/uploads/lessons/${req.file.filename}` : undefined;
      
      const lesson = await lessonService.updateLesson(
        req.params.id as string,
        { ...validatedData, contentUrl },
        req.user!.userId
      );
      
      res.status(200).json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await lessonService.deleteLesson(req.params.id as string, req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}
