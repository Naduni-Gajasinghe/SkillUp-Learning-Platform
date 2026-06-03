import prisma from '../config/prisma';
import { ContentType, Difficulty } from '@prisma/client';

export class LessonRepository {
  async create(data: any) {
    const { tags, ...lessonData } = data;
    
    return prisma.lesson.create({
      data: {
        ...lessonData,
        tags: {
          connectOrCreate: tags?.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName },
          })) || [],
        },
      },
      include: { category: true, tags: true, tutor: { select: { fullName: true } } },
    });
  }

  async findById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: { category: true, tags: true, tutor: { select: { fullName: true } } },
    });
  }

  async findByContentUrl(contentUrl: string) {
    return prisma.lesson.findFirst({
      where: { contentUrl },
      select: { id: true, isPremium: true, tutorId: true },
    });
  }

  async findAll(filters: any) {
    const { categoryId, difficulty, isPremium, search } = filters;
    
    return prisma.lesson.findMany({
      where: {
        categoryId,
        difficulty: difficulty as Difficulty,
        isPremium: isPremium !== undefined ? isPremium === 'true' : undefined,
        OR: search ? [
          { title: { contains: search } },
          { description: { contains: search } }
        ] : undefined,
      },
      include: { category: true, tags: true, tutor: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    const { tags, ...lessonData } = data;

    return prisma.lesson.update({
      where: { id },
      data: {
        ...lessonData,
        tags: tags ? {
          set: [], // Clear existing tags
          connectOrCreate: tags.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        } : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async delete(id: string) {
    return prisma.lesson.delete({
      where: { id },
    });
  }

  async findCategoryById(id: string) {
    return prisma.lessonCategory.findUnique({ where: { id } });
  }

  async findAllCategories() {
    return prisma.lessonCategory.findMany();
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } }, subscription: true }
    });
  }

  async checkLessonAccess(lessonId: string, userId: string) {
    // 1. Check if user is the tutor of this lesson or an admin
    const user = await this.findUserById(userId);
    const isAdmin = user?.userRoles.some(ur => ur.role.name === 'ADMIN');
    
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (lesson?.tutorId === userId || isAdmin) return true;

    // 2. Check for completed payment for this specific lesson
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        lessonId,
        status: 'COMPLETED'
      }
    });
    if (payment) return true;

    // 3. Check for active subscription
    if (user?.subscription && user.subscription.status === 'ACTIVE') {
      // Basic plan might only allow certain categories? 
      // For now, let's assume active subscription allows all premium lessons.
      return true;
    }

    return false;
  }
}
