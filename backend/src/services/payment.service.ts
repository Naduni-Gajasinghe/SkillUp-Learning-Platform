import { PaymentRepository } from '../repositories/payment.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { TutorRepository } from '../repositories/tutor.repository';
import prisma from '../config/prisma';

export function resolvePaymentIntent(input: { purpose?: string; lessonId?: string }) {
  const purpose = input.purpose?.trim().toUpperCase();
  const isLessonPayment = Boolean(
    purpose?.startsWith('LESSON_ACCESS:') ||
    purpose === 'LESSON_PURCHASE' ||
    purpose === 'LESSON_ACCESS' ||
    input.lessonId
  );

  return {
    isLessonPayment,
    requiresLessonId: isLessonPayment && !input.lessonId,
  };
}

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private bookingRepository: BookingRepository;
  private tutorRepository: TutorRepository;

  private readonly supportedGateways = ['STRIPE', 'PAYPAL', 'RAZORPAY', 'MOCK'];
  private readonly commissionRate = 0.2;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.bookingRepository = new BookingRepository();
    this.tutorRepository = new TutorRepository();
  }

  private roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
  }

  async processPayment(data: {
    userId: string;
    amount: number;
    paymentMethod: string;
    purpose: string;
    gateway?: string;
    lessonId?: string;
    bookingId?: string;
  }) {
    if (data.amount <= 0) throw new Error('Amount must be positive');

    const normalizedBookingId = data.bookingId?.trim() || undefined;
    const normalizedLessonId = data.lessonId?.trim() || undefined;
    const gateway = (data.gateway || 'STRIPE').toUpperCase();
    const paymentIntent = resolvePaymentIntent({
      purpose: data.purpose,
      lessonId: normalizedLessonId,
    });

    if (!this.supportedGateways.includes(gateway)) {
      throw new Error(`Unsupported payment gateway. Choose one of: ${this.supportedGateways.join(', ')}`);
    }

    if (data.purpose === 'TUTOR_SESSION') {
      if (!normalizedBookingId) {
        throw new Error('Booking is required for tutor session payments');
      }

      const booking = await this.bookingRepository.findById(normalizedBookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.learnerId !== data.userId) {
        throw new Error('You can only pay for your own booking');
      }

      if (!['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(booking.status)) {
        throw new Error('This booking is no longer payable');
      }

      const existingPayment = await this.paymentRepository.findCompletedByBookingId(normalizedBookingId);
      if (existingPayment) {
        throw new Error('This booking has already been paid');
      }

      const tutor = await this.tutorRepository.findTutorById(booking.tutorId);
      const hourlyRate = tutor?.tutorProfile?.hourlyRate || 0;
      const durationHours = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
      const expectedAmount = this.roundCurrency(durationHours * hourlyRate);

      if (expectedAmount <= 0) {
        throw new Error('Unable to calculate the session price for this booking');
      }

      const paymentAmount = expectedAmount;
      const commissionAmount = this.roundCurrency(paymentAmount * this.commissionRate);
      const tutorEarnings = this.roundCurrency(paymentAmount - commissionAmount);

      const status = gateway === 'STRIPE' || gateway === 'MOCK' ? 'COMPLETED' : 'PENDING';

      const payment = await this.paymentRepository.createPayment(
        {
          userId: data.userId,
          amount: paymentAmount,
          paymentMethod: `${gateway} / ${data.paymentMethod}`,
          purpose: data.purpose,
          bookingId: normalizedBookingId,
          lessonId: normalizedLessonId,
          gateway,
          commissionRate: this.commissionRate,
          commissionAmount,
          tutorEarnings,
        },
        status,
      );

      return {
        ...payment,
        gateway,
        sessionFee: paymentAmount,
        platformCommission: commissionAmount,
        tutorEarnings,
        nextStep:
          status === 'PENDING'
            ? 'Payment created and waiting for gateway confirmation.'
            : `Payment completed. Tutor earns LKR ${tutorEarnings} after a ${Math.round(this.commissionRate * 100)}% platform commission.`,
      };
    }

    if (paymentIntent.isLessonPayment) {
      if (!normalizedLessonId) {
        throw new Error('Lesson is required for lesson access payments');
      }

      const lesson = await prisma.lesson.findUnique({ where: { id: normalizedLessonId } });
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      const existingPayment = await this.paymentRepository.findCompletedByLessonId(normalizedLessonId, data.userId);
      if (existingPayment) {
        return {
          ...existingPayment,
          gateway,
          nextStep: 'You already have access to this premium lesson. No new payment was created.',
        };
      }
    }

    const status = gateway === 'STRIPE' || gateway === 'MOCK' ? 'COMPLETED' : 'PENDING';

    const payment = await this.paymentRepository.createPayment(
      {
        userId: data.userId,
        amount: data.amount,
        paymentMethod: `${gateway} / ${data.paymentMethod}`,
        purpose: data.purpose,
        gateway,
        commissionRate: data.purpose === 'TUTOR_SESSION' ? this.commissionRate : 0,
        commissionAmount: 0,
        tutorEarnings: 0,
        bookingId: normalizedBookingId,
        lessonId: normalizedLessonId,
      },
      status,
    );

    return {
      ...payment,
      gateway,
      nextStep:
        status === 'PENDING'
          ? 'Payment created and waiting for gateway confirmation.'
          : paymentIntent.isLessonPayment
            ? 'Payment completed successfully. Premium lesson access has been unlocked.'
            : 'Payment completed successfully.',
    };
  }

  async getPaymentHistory(userId: string, roles: string[]) {
    if (roles.includes('TUTOR')) {
      return this.paymentRepository.getTutorPaymentHistory(userId);
    }

    return this.paymentRepository.getPaymentHistory(userId);
  }

  async getSubscription(userId: string) {
    const subscription = await this.paymentRepository.getSubscription(userId);
    return subscription || { plan: 'BASIC', status: 'ACTIVE', message: 'Default free plan' };
  }

  async subscribe(userId: string, plan: 'BASIC' | 'PREMIUM' | 'PRO') {
    return this.paymentRepository.createOrUpdateSubscription({ userId, plan });
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.paymentRepository.getSubscription(userId);
    if (!subscription) throw new Error('No active subscription found');
    if (subscription.status === 'CANCELLED') throw new Error('Subscription already cancelled');

    return this.paymentRepository.cancelSubscription(userId);
  }

  async getAdminWorkflow() {
    return this.paymentRepository.getAdminWorkflow();
  }

  async updatePaymentStatus(paymentId: string, status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED') {
    return this.paymentRepository.updatePaymentStatus(paymentId, status);
  }
}
