import { z } from 'zod';

export const updateLearnerProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  interests: z.string().optional(),
  learningGoals: z.string().optional(),
});

export const updateTutorProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  expertise: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.preprocess((val) => (typeof val === 'string' ? parseInt(val, 10) : val), z.number().min(0).optional()),
  hourlyRate: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) : val), z.number().min(0).optional()),
  isAvailable: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return val;
  }, z.boolean().optional()),
});

export type UpdateLearnerInput = z.infer<typeof updateLearnerProfileSchema>;
export type UpdateTutorInput = z.infer<typeof updateTutorProfileSchema>;
