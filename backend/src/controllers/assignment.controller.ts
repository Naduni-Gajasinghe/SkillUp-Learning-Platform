import { Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createAssignmentSchema, reviewSubmissionSchema, updateAssignmentSchema } from '../utils/assignment.validation';

const assignmentService = new AssignmentService();

export class AssignmentController {
  async createAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = await createAssignmentSchema.parseAsync(req.body);
      const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : undefined;
      const assignment = await assignmentService.createAssignment(
        { ...validatedData, fileUrl },
        req.user!.userId
      );
      res.status(201).json({ success: true, data: assignment });
    } catch (error: any) {
      next(error);
    }
  }

  async updateAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = await updateAssignmentSchema.parseAsync(req.body);
      const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : undefined;
      const assignment = await assignmentService.updateAssignment(
        req.params.id as string,
        { ...validatedData, fileUrl },
        req.user!.userId
      );
      res.status(200).json({ success: true, data: assignment });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await assignmentService.deleteAssignment(req.params.id as string, req.user!.userId);
      res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await assignmentService.getAssignmentDetails(req.params.id as string);
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      res.status(200).json({ success: true, data: assignment });
    } catch (error: any) {
      next(error);
    }
  }

  async submitWork(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('Submission file is required');
      const fileUrl = `/uploads/submissions/${req.file.filename}`;
      const submission = await assignmentService.submitWork({
        assignmentId: req.params.assignmentId as string,
        learnerId: req.user!.userId,
        fileUrl,
        content: req.body.content,
      });
      res.status(201).json({ success: true, data: submission });
    } catch (error: any) {
      next(error);
    }
  }

  async reviewSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = await reviewSubmissionSchema.parseAsync(req.body);
      const review = await assignmentService.reviewSubmission({
        ...validatedData,
        submissionId: req.params.submissionId as string,
        tutorId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      next(error);
    }
  }

  async getAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignments = await assignmentService.getAllAssignments(req.query);
      res.status(200).json({ success: true, data: assignments });
    } catch (error: any) {
      next(error);
    }
  }

  async getSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await assignmentService.getSubmissions(
        req.params.assignmentId as string,
        req.user!.userId
      );
      res.status(200).json({ success: true, data: submissions });
    } catch (error: any) {
      next(error);
    }
  }
}
