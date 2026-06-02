import { Request, Response, NextFunction } from 'express';
import { TutorService } from '../services/tutor.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const tutorService = new TutorService();

export class TutorController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tutors = await tutorService.getAllTutors({
        search: req.query.search as string,
        expertise: req.query.expertise as string,
      });
      res.status(200).json({ success: true, data: tutors });
    } catch (error: any) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const tutor = await tutorService.getTutorById(req.params.id as string);
      res.status(200).json({ success: true, data: tutor });
    } catch (error: any) {
      next(error);
    }
  }

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const availability = await tutorService.getTutorAvailability(req.params.id as string);
      res.status(200).json({ success: true, data: availability });
    } catch (error: any) {
      next(error);
    }
  }

  async createAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dayOfWeek, startTime, endTime } = req.body;
      const availability = await tutorService.createAvailability(req.user!.userId, {
        dayOfWeek,
        startTime,
        endTime,
      });
      res.status(201).json({
        success: true,
        message: 'Availability slot created successfully',
        data: availability,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const availabilityId = req.params.id as string;
      const { dayOfWeek, startTime, endTime } = req.body;
      const availability = await tutorService.updateAvailability(req.user!.userId, availabilityId, {
        dayOfWeek,
        startTime,
        endTime,
      });
      res.status(200).json({
        success: true,
        message: 'Availability slot updated successfully',
        data: availability,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const availabilityId = req.params.id as string;
      await tutorService.deleteAvailability(req.user!.userId, availabilityId);
      res.status(200).json({
        success: true,
        message: 'Availability slot deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getMyAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const availability = await tutorService.getTutorAvailability(req.user!.userId);
      res.status(200).json({ success: true, data: availability });
    } catch (error: any) {
      next(error);
    }
  }
}
