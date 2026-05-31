import prisma from '../config/prisma';

export class PaymentRepository {
  async createPayment(data: {
    userId: string;
    amount: number;
    paymentMethod: string;
    purpose: string;
    lessonId?: string;
    bookingId?: string;
  }) {
    return prisma.payment.create({
      data: {
        ...data,
        status: 'COMPLETED', // Mock: immediately mark as completed
      },
    });
  }

  async getPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
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
}
