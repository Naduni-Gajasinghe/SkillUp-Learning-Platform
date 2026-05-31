import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(['LEARNER', 'TUTOR', 'ADMIN']).optional().default('LEARNER'),
  // Profile specific fields can be added here if needed during registration
  expertise: z.string().optional(), // For tutor registration
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
