import { PaymentRepository } from '../repositories/payment.repository';
import { BookingRepository } from '../repositories/booking.repository';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private bookingRepository: BookingRepository;

  private readonly supportedGateways = ['STRIPE', 'PAYPAL', 'RAZORPAY', 'MOCK'];

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.bookingRepository = new BookingRepository();
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
    }

    const gateway = (data.gateway || 'STRIPE').toUpperCase();
    if (!this.supportedGateways.includes(gateway)) {
      throw new Error(`Unsupported payment gateway. Choose one of: ${this.supportedGateways.join(', ')}`);
    }

    const status = gateway === 'STRIPE' || gateway === 'MOCK' ? 'COMPLETED' : 'PENDING';

    const payment = await this.paymentRepository.createPayment(
      {
        userId: data.userId,
        amount: data.amount,
        paymentMethod: `${gateway} / ${data.paymentMethod}`,
        purpose: data.purpose,
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
          : 'Payment completed successfully.',
    };
  }

  async getPaymentHistory(userId: string) {
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
