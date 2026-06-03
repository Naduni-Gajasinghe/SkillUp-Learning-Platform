import prisma from '../config/prisma';

const VALID_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export class BookingRepository {
  async create(data: {
    learnerId: string;
    tutorId: string;
    startTime: Date;
    endTime: Date;
    status?: string;
    notes?: string;
  }) {
    // Build create data with only valid enum values
    const createData: any = {
      learnerId: data.learnerId,
      tutorId: data.tutorId,
      startTime: data.startTime,
      endTime: data.endTime,
    };
    
    // Only include status if it's a valid enum value
    if (data.status && VALID_BOOKING_STATUSES.includes(data.status)) {
      createData.status = data.status;
    }
    
    // Only include notes if provided
    if (data.notes) {
      createData.notes = data.notes;
    }
    
    return prisma.booking.create({
      data: createData,
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
        learner: { select: { fullName: true, profileImage: true, id: true, email: true } },
        payment: true,
      },
      orderBy: { startTime: 'desc' },
    } as any);
  }

  async updateStatus(id: string, status: string, cancellationReason?: string) {
    // Validate status before updating
    if (!status || !VALID_BOOKING_STATUSES.includes(status)) {
      throw new Error(`Invalid booking status: ${status}. Must be one of: ${VALID_BOOKING_STATUSES.join(', ')}`);
    }

    const updateData: any = { status };
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    return prisma.booking.update({
      where: { id },
      data: updateData,
    } as any);
  }
}
