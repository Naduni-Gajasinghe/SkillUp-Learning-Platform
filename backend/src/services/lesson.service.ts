import { LessonRepository } from '../repositories/lesson.repository';

export function buildLessonAccessMetadata(lesson: { isPremium?: boolean }, userId?: string, hasAccess = false) {
  const accessState = resolveLessonAccessState(lesson, userId, hasAccess);

  return {
    ...accessState,
    message: accessState.canAccess
      ? undefined
      : userId
        ? 'Premium content. Please pay to access.'
        : 'Premium content. Please login and pay to access.',
  };
}

export function resolveLessonAccessState(lesson: { isPremium?: boolean }, userId?: string, hasAccess = false) {
  if (!lesson.isPremium) {
    return { accessRestricted: false, canAccess: true };
  }

  if (!userId) {
    return { accessRestricted: true, canAccess: false };
  }

  return { accessRestricted: !hasAccess, canAccess: hasAccess };
}

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
    
    return Promise.all(lessons.map(async (lesson) => {
      const { contentUrl, learnerProgress, views, ...lessonData } = lesson as any;
      
      let status = 'OPEN';
      const isCompleted = learnerProgress && learnerProgress.some((p: any) => p.isCompleted);
      const hasViews = views && views.length > 0;

      if (isCompleted) {
        status = 'COMPLETED';
      } else if (hasViews) {
        status = 'INPROGRESS';
      }

      const accessMetadata = lesson.isPremium && userId
        ? buildLessonAccessMetadata(lesson, userId, await this.lessonRepository.checkLessonAccess(lesson.id, userId))
        : buildLessonAccessMetadata(lesson, userId, false);

      return {
        ...lessonData,
        status,
        ...accessMetadata,
      };
    }));
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

    if (!lesson.isPremium) return enhancedLesson;

    const hasAccess = userId ? await this.lessonRepository.checkLessonAccess(id, userId) : false;
    const accessState = resolveLessonAccessState(lesson, userId, hasAccess);

    if (!accessState.canAccess) {
      const { contentUrl: _, ...lessonWithoutContent } = enhancedLesson;
      return {
        ...lessonWithoutContent,
        accessRestricted: true,
        canAccess: false,
        message: userId ? 'Premium content. Please pay to access.' : 'Premium content. Please login and pay to access.',
      };
    }

    return {
      ...enhancedLesson,
      accessRestricted: false,
      canAccess: true,
    };
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
