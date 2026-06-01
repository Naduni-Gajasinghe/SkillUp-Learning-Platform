import prisma from '../config/prisma';

export class BookingRepository {
  async create(data: {
    learnerId: string;
    tutorId: string;
    startTime: Date;
    endTime: Date;
    status?: string;
    notes?: string;
  }) {
    return prisma.booking.create({
      data,
      include: {
        tutor: { select: { fullName: true, email: true } },
        learner: { select: { fullName: true, email: true } },
        payment: true,
      },
    } as any);
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        tutor: {
          select: {
            fullName: true,
            email: true,
            id: true,
            tutorProfile: {
              select: { hourlyRate: true, verificationStatus: true, isAvailable: true },
            },
          },
        },
        learner: { select: { fullName: true, email: true, id: true } },
        payment: true,
      },
    } as any);
  }

  async findOverlappingBookings(tutorId: string, startTime: Date, endTime: Date) {
    // Overlap condition: existing.startTime < newEnd && existing.endTime > newStart
    return prisma.booking.findMany({
      where: {
        tutorId,
        status: { in: ['PENDING', 'CONFIRMED', 'SCHEDULED'] as any },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    } as any);
  }

  async getLearnerBookings(learnerId: string) {
    return prisma.booking.findMany({
      where: { learnerId },
      include: {
        tutor: { select: { fullName: true, profileImage: true, id: true } },
        payment: true,
      },
      orderBy: { startTime: 'desc' },
    } as any);
  }

  async getTutorBookings(tutorId: string) {
    return prisma.booking.findMany({
      where: { tutorId },
      include: {
        learner: { select: { fullName: true, profileImage: true, id: true } },
        payment: true,
      },
      orderBy: { startTime: 'desc' },
    } as any);
  }

  async updateStatus(id: string, status: string, cancellationReason?: string) {
    return prisma.booking.update({
      where: { id },
      data: { status, cancellationReason },
    } as any);
  }
}
