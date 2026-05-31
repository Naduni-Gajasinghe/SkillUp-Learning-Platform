import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const bookingService = new BookingService();

export class BookingController {
  async bookSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.createBooking({
        ...req.body,
        learnerId: req.user!.userId,
      });
      res.status(201).json({
        success: true,
        message: 'Session booked successfully',
        data: booking,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingService.getMyBookings(req.user!.userId, req.user!.roles);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(id, req.user!.userId, reason);
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, cancellationReason } = req.body;
      const booking = await bookingService.updateBookingStatus(id, req.user!.userId, status, cancellationReason);
      res.status(200).json({
        success: true,
        message: `Booking status updated to ${status}`,
        data: booking,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
