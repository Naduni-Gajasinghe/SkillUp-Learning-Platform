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
}
