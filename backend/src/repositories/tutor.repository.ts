import prisma from '../config/prisma';

export class TutorRepository {
  async findAllTutors(filters: { search?: string; expertise?: string }) {
    const where: any = {
      userRoles: {
        some: { role: { name: 'TUTOR' } },
      },
      tutorProfile: {
        isNot: null,
        verificationStatus: 'APPROVED',
      },
    };

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { tutorProfile: { expertise: { contains: filters.search } } },
      ];
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
}
