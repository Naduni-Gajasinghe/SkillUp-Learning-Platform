import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  lessonId: z.string().uuid().optional(),
  dueDate: z.preprocess((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }, z.date().optional()),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const submitAssignmentSchema = z.object({
  content: z.string().optional(),
});

export const reviewSubmissionSchema = z.object({
  feedback: z.string().min(5),
  grade: z.string().optional(),
  score: z.coerce.number().min(0).max(100).optional(),
}).refine((data) => data.grade !== undefined || data.score !== undefined, {
  message: 'Either grade or score is required',
  path: ['grade'],
});
