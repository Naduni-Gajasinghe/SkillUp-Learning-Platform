import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const paymentService = new PaymentService();

export class PaymentController {
  async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId, lessonId, ...rest } = req.body;
      const payment = await paymentService.processPayment({
        userId: req.user!.userId,
        bookingId: typeof bookingId === 'string' ? bookingId : undefined,
        lessonId: typeof lessonId === 'string' ? lessonId : undefined,
        ...rest,
      });
      res.status(201).json({ success: true, message: 'Payment processed successfully', data: payment });
    } catch (error: any) {
      next(error);
    }
  }

  async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await paymentService.getPaymentHistory(req.user!.userId);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      next(error);
    }
  }

  async getAdminWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workflow = await paymentService.getAdminWorkflow();
      res.status(200).json({ success: true, data: workflow });
    } catch (error: any) {
      next(error);
    }
  }

  async updatePaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const paymentId = String(req.params.id);

      if (!['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
        throw new Error('Invalid payment status');
      }

      const payment = await paymentService.updatePaymentStatus(paymentId, status);
      res.status(200).json({ success: true, message: 'Payment status updated', data: payment });
    } catch (error: any) {
      next(error);
    }
  }

  async getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await paymentService.getSubscription(req.user!.userId);
      res.status(200).json({ success: true, data: subscription });
    } catch (error: any) {
      next(error);
    }
  }

  async subscribe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { plan } = req.body;
      if (!['BASIC', 'PREMIUM', 'PRO'].includes(plan)) {
        throw new Error('Invalid plan. Choose BASIC, PREMIUM, or PRO');
      }
      const subscription = await paymentService.subscribe(req.user!.userId, plan);
      res.status(201).json({ success: true, message: 'Subscribed successfully', data: subscription });
    } catch (error: any) {
      next(error);
    }
  }

  async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await paymentService.cancelSubscription(req.user!.userId);
      res.status(200).json({ success: true, message: 'Subscription cancelled', data: subscription });
    } catch (error: any) {
      next(error);
    }
  }
}
