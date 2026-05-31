import { AssignmentRepository } from '../repositories/assignment.repository';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class AssignmentService {
  private assignmentRepository: AssignmentRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
  }

  async createAssignment(data: any, tutorId: string) {
    const assignment = await this.assignmentRepository.createAssignment({ ...data, tutorId });
    
    // Notify all learners (Optional: logic to find enrolled learners)
    // For now, we'll just create the logic to send notifications
    
    return assignment;
  }

  async submitWork(data: { assignmentId: string; learnerId: string; fileUrl: string; content?: string }) {
    const assignment = await this.assignmentRepository.getAssignmentById(data.assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      throw new Error('Assignment due date has passed');
    }

    const submission = await this.assignmentRepository.createSubmission(data);

    // Notify Tutor
    await notificationService.createNotification({
      userId: assignment.tutorId,
      title: 'New Submission',
      message: `A learner has submitted work for ${assignment.title}`,
      type: 'SYSTEM',
    });

    return submission;
  }

  async reviewSubmission(data: { submissionId: string; tutorId: string; feedback: string; grade?: string; score?: number }) {
    const submission = await this.assignmentRepository.getSubmissionById(data.submissionId);
    if (!submission) throw new Error('Submission not found');

    if (submission.assignment.tutorId !== data.tutorId) {
      throw new Error('Unauthorized: You are not the tutor of this assignment');
    }

    const normalizedReview = {
      submissionId: data.submissionId,
      tutorId: data.tutorId,
      feedback: data.feedback,
      grade: data.grade ?? (data.score !== undefined ? String(data.score) : undefined),
    };

    const review = await this.assignmentRepository.createReview(normalizedReview);

    // Notify Learner
    await notificationService.createNotification({
      userId: submission.learnerId,
      title: 'Assignment Reviewed',
      message: `Your submission for ${submission.assignment.title} has been reviewed.`,
      type: 'SUBMISSION_REVIEWED',
    });

    return {
      ...review,
      score: review.grade,
    };
  }

  async getAllAssignments(filters: any) {
    return this.assignmentRepository.getAssignments(filters);
  }

  async getAssignmentDetails(id: string) {
    return this.assignmentRepository.getAssignmentById(id);
  }

  async getSubmissions(assignmentId: string, tutorId: string) {
    const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    if (assignment.tutorId !== tutorId) throw new Error('Unauthorized');

    return this.assignmentRepository.getSubmissionsByAssignment(assignmentId);
  }

  async updateAssignment(id: string, data: any, userId: string) {
    const assignment = await this.assignmentRepository.getAssignmentById(id);
    if (!assignment) throw new Error('Assignment not found');

    const user = await this.assignmentRepository.findUserById(userId);
    const isAdmin = user?.userRoles.some(ur => ur.role.name === 'ADMIN');

    if (assignment.tutorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this assignment');
    }

    return this.assignmentRepository.updateAssignment(id, data);
  }

  async deleteAssignment(id: string, userId: string) {
    const assignment = await this.assignmentRepository.getAssignmentById(id);
    if (!assignment) throw new Error('Assignment not found');

    const user = await this.assignmentRepository.findUserById(userId);
    const isAdmin = user?.userRoles.some(ur => ur.role.name === 'ADMIN');

    if (assignment.tutorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this assignment');
    }

    return this.assignmentRepository.deleteAssignment(id);
  }
}
