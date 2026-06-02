import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
  endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM'),
}).refine(
  (data) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return (startH * 60 + startM) < (endH * 60 + endM);
  },
  {
    message: 'Start time must be before end time',
    path: ['endTime'],
  }
);

export const updateAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM').optional(),
  endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM').optional(),
}).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return (startH * 60 + startM) < (endH * 60 + endM);
  },
  {
    message: 'Start time must be before end time',
    path: ['endTime'],
  }
);

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
