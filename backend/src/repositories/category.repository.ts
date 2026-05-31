import prisma from '../config/prisma';

export class CategoryRepository {
  async findAll() {
    return prisma.lessonCategory.findMany({
      include: {
        _count: { select: { lessons: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.lessonCategory.findUnique({
      where: { id },
      include: {
        lessons: {
          select: { id: true, title: true, difficulty: true, isPremium: true },
        },
      },
    });
  }

  async create(data: { name: string; description?: string }) {
    return prisma.lessonCategory.create({
      data,
    });
  }
}
