import { GamificationRepository } from '../repositories/gamification.repository';

export class GamificationService {
  private gamificationRepository: GamificationRepository;

  constructor() {
    this.gamificationRepository = new GamificationRepository();
  }

  async getUserBadges(userId: string) {
    return this.gamificationRepository.getUserBadges(userId);
  }

  async getUserAchievements(userId: string) {
    return this.gamificationRepository.getUserAchievements(userId);
  }

  async getUserPoints(userId: string) {
    const points = await this.gamificationRepository.getUserPoints(userId);
    return points || { points: 0, streak: 0, lastActive: new Date() };
  }

  async getLeaderboard(limit: number = 10) {
    return this.gamificationRepository.getLeaderboard(limit);
  }

  /**
   * Award points for lesson view (+10 points)
   */
  async awardViewPoints(userId: string) {
    await this.gamificationRepository.upsertUserPoints(userId, 10);
    await this.checkAndAwardViewMilestones(userId);
  }

  /**
   * Award points for lesson completion (+20 points)
   */
  async awardCompletionPoints(userId: string) {
    await this.gamificationRepository.upsertUserPoints(userId, 20);
    await this.checkAndAwardCompletionMilestones(userId);
  }

  /**
   * Award points for booking a session (+5 points)
   */
  async awardBookingPoints(userId: string) {
    await this.gamificationRepository.upsertUserPoints(userId, 5);
  }

  private async checkAndAwardViewMilestones(userId: string) {
    const viewCount = await this.gamificationRepository.getUserViewsCount(userId);

    // "First Lesson View" badge
    if (viewCount === 1) {
      const badge = await this.gamificationRepository.getBadgeByName('First Lesson View');
      if (badge) await this.gamificationRepository.awardBadge(userId, badge.id);
    }

    // "Curious Learner" achievement at 10 views
    if (viewCount >= 10) {
      const achievement = await this.gamificationRepository.getAchievementByName('Curious Learner');
      if (achievement) await this.gamificationRepository.unlockAchievement(userId, achievement.id);
    }
  }

  private async checkAndAwardCompletionMilestones(userId: string) {
    const completedCount = await this.gamificationRepository.getUserCompletedLessonsCount(userId);

    // "First Lesson Complete" badge
    if (completedCount === 1) {
      const badge = await this.gamificationRepository.getBadgeByName('First Lesson Complete');
      if (badge) await this.gamificationRepository.awardBadge(userId, badge.id);
    }

    // "Dedicated Learner" badge at 5 completions
    if (completedCount >= 5) {
      const badge = await this.gamificationRepository.getBadgeByName('Dedicated Learner');
      if (badge) await this.gamificationRepository.awardBadge(userId, badge.id);
    }

    // "Knowledge Seeker" achievement at 10 completions
    if (completedCount >= 10) {
      const achievement = await this.gamificationRepository.getAchievementByName('Knowledge Seeker');
      if (achievement) await this.gamificationRepository.unlockAchievement(userId, achievement.id);
    }
  }
}
