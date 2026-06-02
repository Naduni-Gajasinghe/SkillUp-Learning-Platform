import { TutorRepository } from '../repositories/tutor.repository';

export class TutorService {
  private tutorRepository: TutorRepository;

  constructor() {
    this.tutorRepository = new TutorRepository();
  }

  async getAllTutors(filters: { search?: string; expertise?: string }) {
    return this.tutorRepository.findAllTutors(filters);
  }

  async getTutorById(id: string) {
    const tutor = await this.tutorRepository.findTutorById(id);
    if (!tutor) throw new Error('Tutor not found');
    return tutor;
  }

  async getTutorAvailability(tutorId: string) {
    return this.tutorRepository.getAvailability(tutorId);
  }

  async createAvailability(tutorId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new Error('Invalid day of week. Must be between 0-6 (Sunday-Saturday)');
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }

    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (startTotalMinutes >= endTotalMinutes) {
      throw new Error('Start time must be before end time');
    }

    return this.tutorRepository.createAvailability(tutorId, data);
  }

  async updateAvailability(tutorId: string, availabilityId: string, data: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  }) {
    // Verify ownership
    const availability = await this.tutorRepository.getAvailabilityById(availabilityId);
    if (!availability || availability.tutorId !== tutorId) {
      throw new Error('Availability not found or unauthorized');
    }

    if (data.dayOfWeek !== undefined && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
      throw new Error('Invalid day of week. Must be between 0-6 (Sunday-Saturday)');
    }

    if (data.startTime || data.endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const startTime = data.startTime || availability.startTime;
      const endTime = data.endTime || availability.endTime;

      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new Error('Invalid time format. Use HH:MM format');
      }

      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      if (startTotalMinutes >= endTotalMinutes) {
        throw new Error('Start time must be before end time');
      }
    }

    return this.tutorRepository.updateAvailability(availabilityId, data);
  }

  async deleteAvailability(tutorId: string, availabilityId: string) {
    // Verify ownership
    const availability = await this.tutorRepository.getAvailabilityById(availabilityId);
    if (!availability || availability.tutorId !== tutorId) {
      throw new Error('Availability not found or unauthorized');
    }

    return this.tutorRepository.deleteAvailability(availabilityId);
  }
}
