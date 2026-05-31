import prisma from '../config/prisma';

export class SubmissionRepository {
  async getLearnerSubmissions(learnerId: string) {
    return prisma.submission.findMany({
      where: { learnerId },
      include: {
        assignment: {
          select: { id: true, title: true, dueDate: true },
        },
        review: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSubmissionWithReview(submissionId: string) {
    return prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: { id: true, title: true },
        },
        review: {
          include: {
            tutor: { select: { fullName: true } },
          },
        },
        learner: { select: { fullName: true } },
      },
    });
  }

  async createSubmission(data: {
    assignmentId: string;
    learnerId: string;
    fileUrl: string;
    content?: string;
  }) {
    return prisma.submission.create({
      data,
      include: {
        assignment: { select: { title: true } },
        learner: { select: { fullName: true } },
      },
    });
  }
}
