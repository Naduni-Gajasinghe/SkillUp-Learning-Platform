import { Response, NextFunction } from 'express';
import { SubmissionService } from '../services/submission.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const submissionService = new SubmissionService();

export class SubmissionController {
  async getMySubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await submissionService.getMySubmissions(req.user!.userId);
      res.status(200).json({ success: true, data: submissions });
    } catch (error: any) {
      next(error);
    }
  }

  async getReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await submissionService.getReview(
        req.params.submissionId as string,
        req.user!.userId
      );
      res.status(200).json({ success: true, data: review });
    } catch (error: any) {
      next(error);
    }
  }
}
