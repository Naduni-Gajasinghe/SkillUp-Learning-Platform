import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const notificationService = new NotificationService();

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getMyNotifications(req.user!.userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string, req.user!.userId);
      res.status(200).json({ success: true, data: notification });
    } catch (error: any) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      next(error);
    }
  }
}
