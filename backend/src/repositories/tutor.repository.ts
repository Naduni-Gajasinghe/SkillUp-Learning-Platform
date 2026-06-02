import prisma from '../config/prisma';

export class TutorRepository {
  async findAllTutors(filters: { search?: string; expertise?: string }) {
    const where: any = {
      AND: [
        {
          userRoles: {
            some: { role: { name: 'TUTOR' } },
          },
        },
        {
          tutorProfile: {
            isNot: null,
          },
        },
        {
          tutorProfile: {
            verificationStatus: 'APPROVED',
          },
        },
      ],
    };

    if (filters.search) {
      where.AND.push({
        OR: [
          { fullName: { contains: filters.search, mode: 'insensitive' } },
          { tutorProfile: { expertise: { contains: filters.search, mode: 'insensitive' } } },
        ],
      });
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        bio: true,
        tutorProfile: {
          select: {
            expertise: true,
            qualification: true,
            experience: true,
            hourlyRate: true,
            isAvailable: true,
            verificationStatus: true,
          },
        },
        availabilities: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async findTutorById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        bio: true,
        tutorProfile: true,
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            contentType: true,
            isPremium: true,
            category: { select: { name: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        availabilities: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async getAvailability(tutorId: string) {
    return prisma.availability.findMany({
      where: { tutorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async getAvailabilityById(availabilityId: string) {
    return prisma.availability.findUnique({
      where: { id: availabilityId },
    });
  }

  async createAvailability(tutorId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    return prisma.availability.create({
      data: {
        ...data,
        tutorId,
      },
    });
  }

  async updateAvailability(availabilityId: string, data: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  }) {
    return prisma.availability.update({
      where: { id: availabilityId },
      data,
    });
  }

  async deleteAvailability(availabilityId: string) {
    return prisma.availability.delete({
      where: { id: availabilityId },
    });
  }
}
