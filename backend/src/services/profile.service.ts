import { ProfileRepository } from '../repositories/profile.repository';
import { UpdateLearnerInput, UpdateTutorInput } from '../utils/profile.validation';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async getProfile(userId: string) {
    const user = await this.profileRepository.getProfile(userId);
    if (!user) throw new Error('User not found');
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateLearnerProfile(userId: string, data: UpdateLearnerInput) {
    return this.profileRepository.updateLearnerProfile(userId, data);
  }

  async updateTutorProfile(userId: string, data: UpdateTutorInput) {
    return this.profileRepository.updateTutorProfile(userId, data);
  }

  async getTutors() {
    return this.profileRepository.getAllTutors();
  }
}
