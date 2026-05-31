import prisma from '../config/prisma';

export class GamificationRepository {
  async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBadges() {
    return prisma.badge.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getUserAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAchievements() {
    return prisma.achievement.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getUserPoints(userId: string) {
    return prisma.userPoints.findUnique({
      where: { userId },
    });
  }

  async upsertUserPoints(userId: string, pointsToAdd: number) {
    return prisma.userPoints.upsert({
      where: { userId },
      update: {
        points: { increment: pointsToAdd },
        lastActive: new Date(),
      },
      create: {
        userId,
        points: pointsToAdd,
        streak: 1,
        lastActive: new Date(),
      },
    });
  }

  async getLeaderboard(limit: number = 10) {
    return prisma.userPoints.findMany({
      take: limit,
      orderBy: { points: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async awardBadge(userId: string, badgeId: string) {
    // Only award if not already earned
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) return existing;

    return prisma.userBadge.create({
      data: { userId, badgeId },
      include: { badge: true },
    });
  }

  async unlockAchievement(userId: string, achievementId: string) {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });
    if (existing) return existing;

    return prisma.userAchievement.create({
      data: { userId, achievementId },
      include: { achievement: true },
    });
  }

  async getBadgeByName(name: string) {
    return prisma.badge.findUnique({ where: { name } });
  }

  async getAchievementByName(name: string) {
    return prisma.achievement.findUnique({ where: { name } });
  }

  async getUserCompletedLessonsCount(userId: string) {
    return prisma.userProgress.count({
      where: { userId, isCompleted: true },
    });
  }

  async getUserViewsCount(userId: string) {
    return prisma.lessonView.count({
      where: { userId },
    });
  }
}
