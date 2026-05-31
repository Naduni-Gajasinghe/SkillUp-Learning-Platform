import { AnalyticsRepository } from '../repositories/analytics.repository';

export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  async getTutorAnalytics(tutorId: string) {
    return this.analyticsRepository.getTutorStats(tutorId);
  }

  async getLearnerAnalytics(learnerId: string) {
    return this.analyticsRepository.getLearnerProgress(learnerId);
  }

  async getLearnerLearningStats(learnerId: string) {
    return this.analyticsRepository.getLearnerLearningStats(learnerId);
  }

  async getAdminAnalytics() {
    return this.analyticsRepository.getPlatformStats();
  }
}
