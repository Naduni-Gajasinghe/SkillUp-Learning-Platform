import prisma from '../config/prisma';

export class AIRepository {
  async getRecommendations(userId: string) {
    return prisma.recommendation.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            contentType: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async createRecommendation(data: {
    userId: string;
    title: string;
    description?: string;
    reason?: string;
    lessonId?: string;
  }) {
    return prisma.recommendation.create({ data });
  }

  async getSkillAssessments(userId: string) {
    return prisma.skillAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSkillAssessment(data: {
    userId: string;
    skills: any;
    score: number;
    feedback?: string;
  }) {
    return prisma.skillAssessment.create({ data });
  }

  async getLearningPath(userId: string) {
    return prisma.learningPath.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLearningPath(data: {
    userId: string;
    title: string;
    description?: string;
    lessons: any;
  }) {
    return prisma.learningPath.create({ data });
  }

  async getUserProgress(userId: string) {
    return prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            category: { select: { name: true } },
          },
        },
      },
    });
  }

  async getUserInterests(userId: string) {
    return prisma.learnerProfile.findUnique({
      where: { userId },
      select: { interests: true, learningGoals: true },
    });
  }
}
