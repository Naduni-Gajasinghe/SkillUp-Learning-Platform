import prisma from '../config/prisma';
import { BookingStatus } from '@prisma/client';

export class BookingRepository {
  async create(data: {
    learnerId: string;
    tutorId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }) {
    return prisma.booking.create({
      data,
      include: {
        tutor: { select: { fullName: true, email: true } },
        learner: { select: { fullName: true, email: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        tutor: { select: { fullName: true, email: true, id: true } },
        learner: { select: { fullName: true, email: true, id: true } },
      },
    });
  }

  async findOverlappingBookings(tutorId: string, startTime: Date, endTime: Date) {
    // Overlap condition: existing.startTime < newEnd && existing.endTime > newStart
    return prisma.booking.findMany({
      where: {
        tutorId,
        status: 'SCHEDULED',
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });
  }

  async getLearnerBookings(learnerId: string) {
    return prisma.booking.findMany({
      where: { learnerId },
      include: {
        tutor: { select: { fullName: true, profileImage: true, id: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getTutorBookings(tutorId: string) {
    return prisma.booking.findMany({
      where: { tutorId },
      include: {
        learner: { select: { fullName: true, profileImage: true, id: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateStatus(id: string, status: BookingStatus, cancellationReason?: string) {
    return prisma.booking.update({
      where: { id },
      data: { status, cancellationReason },
    });
  }
}
