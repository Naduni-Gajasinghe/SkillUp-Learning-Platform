import { PaymentRepository } from '../repositories/payment.repository';

export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
  }

  async processPayment(data: {
    userId: string;
    amount: number;
    paymentMethod: string;
    purpose: string;
    lessonId?: string;
    bookingId?: string;
  }) {
    // Mock payment processing - in production, integrate with Stripe/PayPal
    if (data.amount <= 0) throw new Error('Amount must be positive');

    const payment = await this.paymentRepository.createPayment(data);
    return payment;
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
}
