import prisma from '../config/prisma';

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export class PaymentRepository {
  async createPayment(data: {
    userId: string;
    amount: number;
    paymentMethod: string;
    purpose: string;
    gateway?: string;
    commissionRate?: number;
    commissionAmount?: number;
    tutorEarnings?: number;
    lessonId?: string;
    bookingId?: string;
  }, status: PaymentStatus = 'COMPLETED') {
    return prisma.payment.create({
      data: {
        ...data,
        status,
      },
    });
  }

  async getPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTutorPaymentHistory(tutorId: string) {
    return prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        purpose: 'TUTOR_SESSION',
        booking: {
          tutorId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async getPaymentById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
  }

  async findByBookingId(bookingId: string) {
    return prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCompletedByBookingId(bookingId: string) {
    return prisma.payment.findFirst({
      where: { bookingId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCompletedByLessonId(lessonId: string, userId: string) {
    return prisma.payment.findFirst({
      where: {
        lessonId,
        userId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { id },
      data: { status },
    });
  }

  async getSubscription(userId: string) {
    return prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async createOrUpdateSubscription(data: {
    userId: string;
    plan: 'BASIC' | 'PREMIUM' | 'PRO';
  }) {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    return prisma.subscription.upsert({
      where: { userId: data.userId },
      update: {
        plan: data.plan,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
      },
      create: {
        userId: data.userId,
        plan: data.plan,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
      },
    });
  }

  async cancelSubscription(userId: string) {
    return prisma.subscription.update({
      where: { userId },
      data: { status: 'CANCELLED' },
    });
  }

  async getAdminWorkflow() {
    const [payments, subscriptions] = await Promise.all([
      prisma.payment.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const paymentSummary = payments.reduce(
      (summary, payment) => {
        summary.totalTransactions += 1;
        summary.totalRevenue += payment.status === 'COMPLETED' ? payment.amount : 0;
        summary.pendingPayments += payment.status === 'PENDING' ? 1 : 0;
        summary.completedPayments += payment.status === 'COMPLETED' ? 1 : 0;
        summary.failedPayments += payment.status === 'FAILED' ? 1 : 0;
        summary.refundedPayments += payment.status === 'REFUNDED' ? 1 : 0;

        const gateway = payment.paymentMethod.split(' / ')[0] || 'UNKNOWN';
        summary.gatewayBreakdown[gateway] = (summary.gatewayBreakdown[gateway] || 0) + 1;

        return summary;
      },
      {
        totalTransactions: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        gatewayBreakdown: {} as Record<string, number>,
      },
    );

    const subscriptionSummary = subscriptions.reduce(
      (summary, subscription) => {
        summary.totalSubscriptions += 1;
        summary.activeSubscriptions += subscription.status === 'ACTIVE' ? 1 : 0;
        summary.cancelledSubscriptions += subscription.status === 'CANCELLED' ? 1 : 0;
        summary.expiredSubscriptions += subscription.status === 'EXPIRED' ? 1 : 0;

        const plan = subscription.plan;
        summary.planBreakdown[plan] = (summary.planBreakdown[plan] || 0) + 1;

        return summary;
      },
      {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        expiredSubscriptions: 0,
        planBreakdown: {} as Record<string, number>,
      },
    );

    return {
      summary: {
        ...paymentSummary,
        ...subscriptionSummary,
      },
      pendingReview: payments
        .filter((payment) => payment.status === 'PENDING')
        .slice(0, 6)
        .map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          gateway: payment.gateway,
          commissionAmount: payment.commissionAmount,
          tutorEarnings: payment.tutorEarnings,
          purpose: payment.purpose,
          status: payment.status,
          user: payment.user,
          createdAt: payment.createdAt,
        })),
      recentPayments: payments.slice(0, 8).map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        purpose: payment.purpose,
        status: payment.status,
        user: payment.user,
        createdAt: payment.createdAt,
      })),
      subscriptions: subscriptions.slice(0, 8).map((subscription) => ({
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        user: subscription.user,
      })),
    };
  }
}
