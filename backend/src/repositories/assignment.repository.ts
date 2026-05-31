import prisma from '../config/prisma';

export class AssignmentRepository {
  async createAssignment(data: any) {
    return prisma.assignment.create({
      data,
      include: { tutor: { select: { fullName: true } } },
    });
  }

  async getAssignments(filters: any) {
    return prisma.assignment.findMany({
      where: filters,
      include: { tutor: { select: { fullName: true } }, lesson: { select: { title: true } } },
    });
  }

  async getAssignmentById(id: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: { tutor: { select: { fullName: true, id: true } }, submissions: true },
    });
  }

  async createSubmission(data: any) {
    return prisma.submission.create({
      data,
      include: { learner: { select: { fullName: true } } },
    });
  }

  async getSubmissionsByAssignment(assignmentId: string) {
    return prisma.submission.findMany({
      where: { assignmentId },
      include: { learner: { select: { fullName: true, id: true } }, review: true },
    });
  }

  async getSubmissionById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: { assignment: true, review: true },
    });
  }

  async createReview(data: any) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.upsert({
        where: { submissionId: data.submissionId },
        create: {
          submissionId: data.submissionId,
          tutorId: data.tutorId,
          feedback: data.feedback,
          grade: data.grade,
        },
        update: {
          tutorId: data.tutorId,
          feedback: data.feedback,
          grade: data.grade,
          reviewedAt: new Date(),
        },
      });
      await tx.submission.update({
        where: { id: data.submissionId },
        data: { status: 'REVIEWED' },
      });
      return review;
    });
  }

  async getLearnerSubmissions(learnerId: string) {
    return prisma.submission.findMany({
      where: { learnerId },
      include: { assignment: true, review: true },
    });
  }

  async updateAssignment(id: string, data: any) {
    return prisma.assignment.update({
      where: { id },
      data,
      include: { tutor: { select: { fullName: true } } },
    });
  }

  async deleteAssignment(id: string) {
    return prisma.assignment.delete({
      where: { id },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } }
    });
  }
}
