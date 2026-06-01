import { z } from 'zod';

export const updateTutorVerificationSchema = z.object({
  verificationStatus: z.enum(['APPROVED', 'REJECTED']),
});

export type UpdateTutorVerificationInput = z.infer<typeof updateTutorVerificationSchema>;