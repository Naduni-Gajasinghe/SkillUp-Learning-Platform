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

  async getAllLessons(filters: any, userId?: string) {
    const lessons = await this.lessonRepository.findAll(filters, userId);
    
    return lessons.map(lesson => {
      const { contentUrl, learnerProgress, views, ...lessonData } = lesson as any;
      
      let status = 'OPEN';
      const isCompleted = learnerProgress && learnerProgress.some((p: any) => p.isCompleted);
      const hasViews = views && views.length > 0;

      if (isCompleted) {
        status = 'COMPLETED';
      } else if (hasViews) {
        status = 'INPROGRESS';
      }

      return {
        ...lessonData,
        status
      };
    });
  }

  async getLessonById(id: string, userId?: string) {
    const lesson = await this.lessonRepository.findById(id, userId);
    if (!lesson) throw new Error('Lesson not found');

    const { contentUrl, learnerProgress, views, ...lessonData } = lesson as any;
    const isCompleted = learnerProgress && learnerProgress.some((p: any) => p.isCompleted);
    const hasViews = views && views.length > 0;
    
    let status = 'OPEN';
    if (isCompleted) {
      status = 'COMPLETED';
    } else if (hasViews) {
      status = 'INPROGRESS';
    }

    const enhancedLesson = {
      ...lessonData,
      contentUrl,
      isCompleted,
      status
    };

    // If it's a free lesson, anyone can see it
    if (!lesson.isPremium) return enhancedLesson;

    // If it's premium, check access
    if (!userId) {
      const { contentUrl: _, ...lessonWithoutContent } = enhancedLesson;
      return { ...lessonWithoutContent, accessRestricted: true, message: 'Premium content. Please login and pay to access.' };
    }

    const hasAccess = await this.lessonRepository.checkLessonAccess(id, userId);
    if (!hasAccess) {
      const { contentUrl: _, ...lessonWithoutContent } = enhancedLesson;
      return { ...lessonWithoutContent, accessRestricted: true, message: 'Premium content. Please pay to access.' };
    }

    return enhancedLesson;
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
