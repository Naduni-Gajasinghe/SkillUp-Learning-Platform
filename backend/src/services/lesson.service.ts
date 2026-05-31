import { LessonRepository } from '../repositories/lesson.repository';

export class LessonService {
  private lessonRepository: LessonRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
  }

  async createLesson(data: any, tutorId: string) {
    // Check if category exists
    const category = await this.lessonRepository.findCategoryById(data.categoryId);
    if (!category) throw new Error('Invalid Category ID');

    // Parse tags if they come as comma-separated string
    const tags = typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags;

    return this.lessonRepository.create({
      ...data,
      tutorId,
      tags,
    });
  }

  async getAllLessons(filters: any) {
    const lessons = await this.lessonRepository.findAll(filters);
    // Hide contentUrl in list view for security/privacy
    return lessons.map(lesson => {
      const { contentUrl, ...lessonData } = lesson;
      return lessonData;
    });
  }

  async getLessonById(id: string, userId?: string) {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) throw new Error('Lesson not found');

    // If it's a free lesson, anyone can see it
    if (!lesson.isPremium) return lesson;

    // If it's premium, check access
    if (!userId) {
      const { contentUrl, ...lessonWithoutContent } = lesson;
      return { ...lessonWithoutContent, accessRestricted: true, message: 'Premium content. Please login and pay to access.' };
    }

    const hasAccess = await this.lessonRepository.checkLessonAccess(id, userId);
    if (!hasAccess) {
      const { contentUrl, ...lessonWithoutContent } = lesson;
      return { ...lessonWithoutContent, accessRestricted: true, message: 'Premium content. Please pay to access.' };
    }

    return lesson;
  }

  async updateLesson(id: string, data: any, userId: string) {
    const lesson = await this.getLessonById(id, userId);
    const user = await this.lessonRepository.findUserById(userId);
    const isAdmin = user?.userRoles.some(ur => ur.role.name === 'ADMIN');

    if (lesson.tutorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this lesson');
    }

    if (data.categoryId) {
      const category = await this.lessonRepository.findCategoryById(data.categoryId);
      if (!category) throw new Error('Invalid Category ID');
    }

    const tags = typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags;

    return this.lessonRepository.update(id, { ...data, tags });
  }

  async deleteLesson(id: string, userId: string) {
    const lesson = await this.getLessonById(id, userId);
    const user = await this.lessonRepository.findUserById(userId);
    const isAdmin = user?.userRoles.some(ur => ur.role.name === 'ADMIN');

    if (lesson.tutorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this lesson');
    }

    return this.lessonRepository.delete(id);
  }

  async getAllCategories() {
    return this.lessonRepository.findAllCategories();
  }
}
