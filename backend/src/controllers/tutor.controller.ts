import { Request, Response, NextFunction } from 'express';
import { TutorService } from '../services/tutor.service';

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
}
