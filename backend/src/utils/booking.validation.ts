import { z } from 'zod';

export const createBookingSchema = z.object({
  tutorId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  cancellationReason: z.string().optional(),
  zoomLink: z.string().url().optional(),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
