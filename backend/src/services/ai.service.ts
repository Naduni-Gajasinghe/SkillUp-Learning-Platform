import { AIRepository } from '../repositories/ai.repository';

export class AIService {
  private aiRepository: AIRepository;

  constructor() {
    this.aiRepository = new AIRepository();
  }

  async getRecommendations(userId: string) {
    // Get existing recommendations
    let recommendations = await this.aiRepository.getRecommendations(userId);

    // If no recommendations exist, generate mock AI recommendations
    if (recommendations.length === 0) {
      const profile = await this.aiRepository.getUserInterests(userId);
      const progress = await this.aiRepository.getUserProgress(userId);

      // Generate mock recommendations based on user profile and progress
      const completedLessonIds = progress
        .filter(p => p.isCompleted)
        .map(p => p.lessonId);

      // Create a recommendation entry
      await this.aiRepository.createRecommendation({
        userId,
        title: 'Personalized Learning Recommendation',
        description: `Based on your interests (${profile?.interests || 'general'}) and ${completedLessonIds.length} completed lessons`,
        reason: 'AI-powered recommendation based on your learning patterns',
      });

      recommendations = await this.aiRepository.getRecommendations(userId);
    }

    return recommendations;
  }

  async performSkillAssessment(userId: string, answers: any) {
    // Mock AI skill assessment logic
    const skills = answers.skills || {};
    const skillEntries = Object.entries(skills);
    const totalScore = skillEntries.length > 0
      ? skillEntries.reduce((sum: number, [_, level]: any) => sum + (Number(level) || 0), 0) / skillEntries.length
      : 50;

    const normalizedScore = Math.min(100, Math.max(0, totalScore));

    let feedback = '';
    if (normalizedScore >= 80) {
      feedback = 'Excellent! You have strong skills. Consider advanced courses to further deepen your expertise.';
    } else if (normalizedScore >= 50) {
      feedback = 'Good progress! Focus on intermediate-level courses to strengthen your foundation.';
    } else {
      feedback = 'Getting started! We recommend beginning with beginner-level courses to build fundamentals.';
    }

    const assessment = await this.aiRepository.createSkillAssessment({
      userId,
      skills,
      score: normalizedScore,
      feedback,
    });

    return assessment;
  }

  async getLearningPath(userId: string) {
    let paths = await this.aiRepository.getLearningPath(userId);

    // If no learning path exists, generate a default one
    if (paths.length === 0) {
      const progress = await this.aiRepository.getUserProgress(userId);
      const profile = await this.aiRepository.getUserInterests(userId);

      const completedCount = progress.filter(p => p.isCompleted).length;
      const inProgressLessons = progress.filter(p => !p.isCompleted).map(p => p.lessonId);

      await this.aiRepository.createLearningPath({
        userId,
        title: `Your Personalized Learning Path`,
        description: `Customized path based on ${completedCount} completed lessons and your interests: ${profile?.interests || 'general learning'}`,
        lessons: JSON.stringify(inProgressLessons),
      });

      paths = await this.aiRepository.getLearningPath(userId);
    }

    return paths;
  }
}
