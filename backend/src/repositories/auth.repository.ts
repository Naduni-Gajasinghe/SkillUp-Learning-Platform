import prisma from '../config/prisma';
import { RegisterInput } from '../utils/auth.validation';
import { RoleType } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async createUser(data: RegisterInput, hashedPassword: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName,
        },
      });

      // 2. Assign Role
      const role = await tx.role.findUnique({
        where: { name: data.role as RoleType },
      });

      if (!role) throw new Error(`Role ${data.role} not found`);

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      // 3. Create Profile if applicable
      if (data.role === 'LEARNER') {
        await tx.learnerProfile.create({
          data: { userId: user.id },
        });
      } else if (data.role === 'TUTOR') {
        await tx.tutorProfile.create({
          data: { 
            userId: user.id,
            expertise: data.expertise || 'General',
          },
        });
      }

      return this.findUserByEmail(user.email);
    });
  }

  async updatePassword(email: string, hashedPassword: string) {
    return prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}
