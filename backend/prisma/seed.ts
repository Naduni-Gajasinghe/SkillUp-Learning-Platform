import { PrismaClient, RoleType, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  console.log('Upserting roles...');
  const roles = Object.values(RoleType);
  const roleRecords: Record<string, any> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleRecords[roleName] = role;
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 2. Seed Admin User
  console.log('Seeding Admin...');
  await prisma.user.upsert({
    where: { email: 'admin@skillup.com' },
    update: {},
    create: {
      email: 'admin@skillup.com',
      password: hashedPassword,
      fullName: 'System Admin',
      isVerified: true,
      userRoles: {
        create: {
          roleId: roleRecords[RoleType.ADMIN].id,
        },
      },
    },
  });

  // 3. Seed Learner User + Profile
  console.log('Seeding Learner...');
  await prisma.user.upsert({
    where: { email: 'learner@skillup.com' },
    update: {},
    create: {
      email: 'learner@skillup.com',
      password: hashedPassword,
      fullName: 'John Learner',
      userRoles: {
        create: {
          roleId: roleRecords[RoleType.LEARNER].id,
        },
      },
      learnerProfile: {
        create: {
          interests: 'Web Development, UI/UX Design',
          learningGoals: 'Become a Full Stack Developer',
        },
      },
    },
  });

  // 4. Seed Tutor User + Profile
  console.log('Seeding Tutor...');
  await prisma.user.upsert({
    where: { email: 'tutor@skillup.com' },
    update: {},
    create: {
      email: 'tutor@skillup.com',
      password: hashedPassword,
      fullName: 'Jane Tutor',
      userRoles: {
        create: {
          roleId: roleRecords[RoleType.TUTOR].id,
        },
      },
      tutorProfile: {
        create: {
          expertise: 'Node.js, React, Prisma',
          qualification: 'Senior Software Engineer',
          experience: 8,
          hourlyRate: 50.0,
          verificationStatus: VerificationStatus.APPROVED,
        },
      },
    },
  });

  // 5. Seed Lesson Categories
  console.log('Seeding Categories...');
  const categories = [
    { name: 'Web Development', description: 'HTML, CSS, JavaScript, React, Node.js and more' },
    { name: 'Mobile Development', description: 'iOS, Android, Flutter, React Native development' },
    { name: 'Data Science', description: 'Machine learning, AI, statistics, and data analysis' },
    { name: 'UI/UX Design', description: 'User interface and experience design principles' },
    { name: 'DevOps', description: 'CI/CD, Docker, Kubernetes, cloud services' },
    { name: 'Cybersecurity', description: 'Network security, ethical hacking, cryptography' },
  ];

  for (const cat of categories) {
    await prisma.lessonCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  // 6. Seed Badges
  console.log('Seeding Badges...');
  const badges = [
    { name: 'First Lesson View', description: 'Viewed your very first lesson!', iconUrl: '/badges/first-view.png' },
    { name: 'First Lesson Complete', description: 'Completed your first lesson!', iconUrl: '/badges/first-complete.png' },
    { name: 'Dedicated Learner', description: 'Completed 5 lessons!', iconUrl: '/badges/dedicated.png' },
    { name: 'Bookworm', description: 'Viewed 25 lessons!', iconUrl: '/badges/bookworm.png' },
    { name: 'Social Learner', description: 'Booked your first tutor session!', iconUrl: '/badges/social.png' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  // 7. Seed Achievements
  console.log('Seeding Achievements...');
  const achievements = [
    { name: 'Curious Learner', description: 'Viewed 10 different lessons', criteria: 'VIEW_COUNT >= 10' },
    { name: 'Knowledge Seeker', description: 'Completed 10 lessons', criteria: 'COMPLETION_COUNT >= 10' },
    { name: 'Submission Star', description: 'Submitted 5 assignments', criteria: 'SUBMISSION_COUNT >= 5' },
    { name: 'Perfect Score', description: 'Received an A grade on a submission', criteria: 'GRADE == A' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
