import prisma from '../config/prisma';

export class AnalyticsRepository {
  async getTutorStats(tutorId: string) {
    const [lessonCount, totalBookings, totalViews] = await Promise.all([
      prisma.lesson.count({ where: { tutorId } }),
      prisma.booking.count({ where: { tutorId } }),
      prisma.lessonView.count({ where: { lesson: { tutorId } } }),
    ]);

    const completedSessionPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        purpose: 'TUTOR_SESSION',
        booking: {
          tutorId,
        },
      },
      select: {
        amount: true,
        commissionAmount: true,
        tutorEarnings: true,
      },
    });

    const tutorLessonIds = await prisma.lesson.findMany({
      where: { tutorId },
      select: { id: true },
    });

    const completedLessonPayments = tutorLessonIds.length > 0
      ? await prisma.payment.findMany({
          where: {
            status: 'COMPLETED',
            lessonId: { in: tutorLessonIds.map((lesson) => lesson.id) },
          },
          select: {
            amount: true,
            commissionAmount: true,
            tutorEarnings: true,
          },
        })
      : [];

    const totalEarnings = [...completedSessionPayments, ...completedLessonPayments].reduce(
      (sum, payment) => sum + (payment.tutorEarnings || payment.amount || 0),
      0,
    );

    return {
      lessonCount,
      totalBookings,
      totalViews,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
    };
  }

  async getLearnerProgress(learnerId: string) {
    const totalLessons = await prisma.lesson.count();
    const completedLessons = await prisma.userProgress.count({
      where: { userId: learnerId, isCompleted: true },
    });

    const submissions = await prisma.submission.findMany({
      where: { learnerId },
      include: { review: true },
    });

    return {
      totalLessons,
      completedLessons,
      completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100 : 0,
      totalSubmissions: submissions.length,
      reviewedSubmissions: submissions.filter(s => s.status === 'REVIEWED').length,
    };
  }

  async getLearnerLearningStats(learnerId: string) {
    const [points, totalBookings, totalSubmissions, totalViews, completedLessons] = await Promise.all([
      prisma.userPoints.findUnique({ where: { userId: learnerId } }),
      prisma.booking.count({ where: { learnerId } }),
      prisma.submission.count({ where: { learnerId } }),
      prisma.lessonView.count({ where: { userId: learnerId } }),
      prisma.userProgress.count({ where: { userId: learnerId, isCompleted: true } }),
    ]);

    const badges = await prisma.userBadge.count({ where: { userId: learnerId } });
    const achievements = await prisma.userAchievement.count({ where: { userId: learnerId } });

    return {
      gamification: {
        totalPoints: points?.points || 0,
        streak: points?.streak || 0,
        badgesEarned: badges,
        achievementsUnlocked: achievements,
      },
      activity: {
        totalBookings,
        totalSubmissions,
        totalViews,
        completedLessons,
      },
    };
  }

  async getPlatformStats() {
    const [userCount, lessonCount, bookingStats, tutorProfileStats, completedPayments] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.tutorProfile.aggregate({
        _avg: { hourlyRate: true },
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
        },
        select: {
          amount: true,
          commissionAmount: true,
        },
      }),
    ]);

    const totalIncome = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalCommission = completedPayments.reduce((sum, payment) => sum + (payment.commissionAmount || 0), 0);

    return {
      totalUsers: userCount,
      totalLessons: lessonCount,
      bookingsByStatus: bookingStats,
      averageTutorRate: tutorProfileStats._avg.hourlyRate,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
    };
  }
}
