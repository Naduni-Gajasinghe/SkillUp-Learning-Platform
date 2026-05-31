import prisma from '../config/prisma';
import { UpdateLearnerInput, UpdateTutorInput } from '../utils/profile.validation';

export class ProfileRepository {
  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        learnerProfile: true,
        tutorProfile: true,
      },
    });
  }

  async updateLearnerProfile(userId: string, data: UpdateLearnerInput) {
    const { fullName, bio, profileImage, ...profileData } = data;
    
    return prisma.$transaction(async (tx) => {
      // Update User fields if any are provided
      if (fullName !== undefined || bio !== undefined || profileImage !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { fullName, bio, profileImage },
        });
      }

      // Update LearnerProfile fields if any are provided
      if (Object.keys(profileData).length > 0) {
        return tx.learnerProfile.update({
          where: { userId },
          data: profileData,
          include: { user: true },
        });
      }

      // If no profile fields, just return the profile with user data
      return tx.learnerProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
    });
  }

  async updateTutorProfile(userId: string, data: UpdateTutorInput) {
    const { fullName, bio, profileImage, ...profileData } = data;

    return prisma.$transaction(async (tx) => {
      // Update User fields if any are provided
      if (fullName !== undefined || bio !== undefined || profileImage !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { fullName, bio, profileImage },
        });
      }

      // Update TutorProfile fields if any are provided
      if (Object.keys(profileData).length > 0) {
        return tx.tutorProfile.update({
          where: { userId },
          data: profileData,
          include: { user: true },
        });
      }

      // If no profile fields, just return the profile with user data
      return tx.tutorProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
    });
  }

  async getAllTutors() {
    return prisma.tutorProfile.findMany({
      where: { isAvailable: true },
      include: {
        user: {
          select: {
            fullName: true,
            profileImage: true,
            bio: true,
          },
        },
      },
    });
  }
}
