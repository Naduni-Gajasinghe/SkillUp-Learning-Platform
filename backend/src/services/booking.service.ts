import { BookingRepository } from '../repositories/booking.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { TutorRepository } from '../repositories/tutor.repository';
import { NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();
const COMMISSION_RATE = 0.2;
type BookingDecisionStatus = 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export class BookingService {
  private bookingRepository: BookingRepository;
  private paymentRepository: PaymentRepository;
  private tutorRepository: TutorRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.paymentRepository = new PaymentRepository();
    this.tutorRepository = new TutorRepository();
  }

  private roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
  }

  private parseTimeToMinutes(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private buildAvailabilitySuggestions(
    availabilities: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
    referenceDate: Date,
    limit = 3,
  ) {
    return availabilities
      .map((slot) => {
        const slotDate = new Date(referenceDate);
        const offset = (slot.dayOfWeek - slotDate.getDay() + 7) % 7;
        slotDate.setDate(slotDate.getDate() + offset);

        const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);

        const start = new Date(slotDate);
        start.setHours(startHours, startMinutes, 0, 0);

        const end = new Date(slotDate);
        end.setHours(endHours, endMinutes, 0, 0);

        return { start, end, startTime: slot.startTime, endTime: slot.endTime };
      })
      .filter((slot) => slot.start > referenceDate)
      .sort((left, right) => left.start.getTime() - right.start.getTime())
      .slice(0, limit)
      .map((slot) => `${slot.start.toLocaleDateString()} ${slot.startTime}-${slot.endTime}`);
  }

  async createBooking(data: {
    learnerId: string;
    tutorId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const tutor = await this.tutorRepository.findTutorById(data.tutorId);

    if (start <= new Date()) {
      throw new Error('Booking must be in the future');
    }

    if (start >= end) {
      throw new Error('Start time must be before end time');
    }

    if (!tutor || !tutor.tutorProfile) {
      throw new Error('Tutor not found');
    }

    if (!tutor.tutorProfile.isAvailable || tutor.tutorProfile.verificationStatus !== 'APPROVED') {
      throw new Error('Tutor is not available for bookings');
    }

    const matchesAvailability = (tutor.availabilities || []).some((slot) => {
      if (slot.dayOfWeek !== start.getDay()) return false;

      const slotStart = this.parseTimeToMinutes(slot.startTime);
      const slotEnd = this.parseTimeToMinutes(slot.endTime);
      const bookingStart = start.getHours() * 60 + start.getMinutes();
      const bookingEnd = end.getHours() * 60 + end.getMinutes();

      return bookingStart >= slotStart && bookingEnd <= slotEnd;
    });

    if (!matchesAvailability) {
      throw new Error('Selected time is outside the tutor availability slots');
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
      status: 'PENDING',
    });

    const hourlyRate = tutor.tutorProfile.hourlyRate || 0;
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const sessionFee = this.roundCurrency(durationHours * hourlyRate);
    const commissionAmount = this.roundCurrency(sessionFee * COMMISSION_RATE);
    const tutorEarnings = this.roundCurrency(sessionFee - commissionAmount);

    await notificationService.createNotification({
      userId: data.tutorId,
      title: 'New Booking',
      message: `You have a new booking request for ${start.toLocaleString()}. Session fee: LKR ${sessionFee}.`,
      type: NotificationType.BOOKING_CREATED,
    });

    return {
      ...booking,
      sessionFee,
      commissionRate: COMMISSION_RATE,
      commissionAmount,
      tutorEarnings,
      paymentRequired: true,
      availableSlots: tutor.availabilities || [],
    };
  }

  async cancelBooking(bookingId: string, userId: string, reason: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.learnerId !== userId && booking.tutorId !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (!['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(booking.status)) {
      throw new Error('Only active bookings can be cancelled');
    }

    const payment = await this.paymentRepository.findCompletedByBookingId(bookingId);
    if (payment) {
      await this.paymentRepository.updatePaymentStatus(payment.id, 'REFUNDED');
    }

    const updatedBooking = await this.bookingRepository.updateStatus(bookingId, 'CANCELLED', reason);

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

  async updateBookingStatus(bookingId: string, tutorId: string, status: BookingDecisionStatus, cancellationReason?: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.tutorId !== tutorId) {
      throw new Error('Only the tutor can update the booking status');
    }

    if (status === 'CONFIRMED') {
      const payment = await this.paymentRepository.findCompletedByBookingId(bookingId);
      if (!payment) {
        throw new Error('Booking must be paid before it can be confirmed');
      }

      const updatedBooking = await this.bookingRepository.updateStatus(bookingId, 'CONFIRMED');

      await notificationService.createNotification({
        userId: booking.learnerId,
        title: 'Booking Confirmed',
        message: `Your session on ${booking.startTime.toLocaleString()} has been confirmed by the tutor.`,
        type: NotificationType.SYSTEM,
      });

      return updatedBooking;
    }

    if (status === 'REJECTED') {
      const payment = await this.paymentRepository.findCompletedByBookingId(bookingId);
      if (payment) {
        await this.paymentRepository.updatePaymentStatus(payment.id, 'REFUNDED');
      }

      const tutor = await this.tutorRepository.findTutorById(booking.tutorId);
      const suggestions = this.buildAvailabilitySuggestions(tutor?.availabilities || [], booking.startTime, 3);

      const updatedBooking = await this.bookingRepository.updateStatus(
        bookingId,
        'REJECTED',
        cancellationReason || 'Rejected by tutor',
      );

      await notificationService.createNotification({
        userId: booking.learnerId,
        title: 'Booking Rejected',
        message: suggestions.length
          ? `Your session on ${booking.startTime.toLocaleString()} was rejected. Suggested alternatives: ${suggestions.join(', ')}`
          : `Your session on ${booking.startTime.toLocaleString()} was rejected. Please select another available slot from the tutor profile.`,
        type: NotificationType.SYSTEM,
      });

      return updatedBooking;
    }

    return this.bookingRepository.updateStatus(bookingId, status, cancellationReason);
  }
}
