import { SubmissionRepository } from '../repositories/submission.repository';

export class SubmissionService {
  private submissionRepository: SubmissionRepository;

  constructor() {
    this.submissionRepository = new SubmissionRepository();
  }

  async getMySubmissions(learnerId: string) {
    return this.submissionRepository.getLearnerSubmissions(learnerId);
  }

  async getReview(submissionId: string, learnerId: string) {
    const submission = await this.submissionRepository.getSubmissionWithReview(submissionId);
    if (!submission) throw new Error('Submission not found');
    if (submission.learnerId !== learnerId) throw new Error('Unauthorized');
    if (!submission.review) throw new Error('No review available yet');
    return {
      ...submission.review,
      score: submission.review.grade,
    };
  }
}
