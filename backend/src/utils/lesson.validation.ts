import { z } from 'zod';

export const createLessonSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  categoryId: z.string().uuid(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  contentType: z.enum(['VIDEO', 'PDF', 'TEXT']).default('TEXT'),
  isPremium: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return val;
  }, z.boolean().optional()),
  tags: z.string().optional(),
});

export const updateLessonSchema = createLessonSchema.partial();

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
