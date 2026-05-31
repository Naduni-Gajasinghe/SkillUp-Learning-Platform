import { BookingRepository } from '../repositories/booking.repository';
import { BookingStatus, NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class BookingService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(data: {
    learnerId: string;
    tutorId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    // ... existing logic ...
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (start <= new Date()) {
      throw new Error('Booking must be in the future');
    }

    if (start >= end) {
      throw new Error('Start time must be before end time');
    }

    const overlaps = await this.bookingRepository.findOverlappingBookings(
      data.tutorId,
      start,
      end
    );

    if (overlaps.length > 0) {
      throw new Error('Tutor is already booked for this time slot');
    }

    const booking = await this.bookingRepository.create({
      ...data,
      startTime: start,
      endTime: end,
    });

    // Notify Tutor
    await notificationService.createNotification({
      userId: data.tutorId,
      title: 'New Booking',
      message: `You have a new booking request for ${start.toLocaleString()}`,
      type: NotificationType.BOOKING_CREATED,
    });

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string, reason: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.learnerId !== userId && booking.tutorId !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.status !== 'SCHEDULED') {
      throw new Error('Only scheduled bookings can be cancelled');
    }

    const updatedBooking = await this.bookingRepository.updateStatus(bookingId, 'CANCELLED', reason);

    // Notify other party
    const notifyUserId = userId === booking.learnerId ? booking.tutorId : booking.learnerId;
    await notificationService.createNotification({
      userId: notifyUserId,
      title: 'Booking Cancelled',
      message: `Booking for ${booking.startTime.toLocaleString()} has been cancelled. Reason: ${reason}`,
      type: NotificationType.BOOKING_CANCELLED,
    });

    return updatedBooking;
  }

  async getMyBookings(userId: string, roles: string[]) {
    if (roles.includes('TUTOR')) {
      return this.bookingRepository.getTutorBookings(userId);
    }
    return this.bookingRepository.getLearnerBookings(userId);
  }

  async updateBookingStatus(bookingId: string, tutorId: string, status: BookingStatus, cancellationReason?: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.tutorId !== tutorId) {
      throw new Error('Only the tutor can update the booking status');
    }

    return this.bookingRepository.updateStatus(bookingId, status, cancellationReason);
  }
}
