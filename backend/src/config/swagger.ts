import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Skillup API',
      version: '1.0.0',
      description: 'API documentation for Skillup Learning Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Role: {
          type: 'object',
          properties: {
            name: { type: 'string', enum: ['ADMIN', 'TUTOR', 'LEARNER'] },
          },
        },
        LearnerProfile: {
          type: 'object',
          properties: {
            interests: { type: 'string' },
            learningGoals: { type: 'string' },
          },
        },
        TutorProfile: {
          type: 'object',
          properties: {
            expertise: { type: 'string' },
            qualification: { type: 'string' },
            experience: { type: 'integer' },
            hourlyRate: { type: 'number' },
            isAvailable: { type: 'boolean' },
            verificationStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          },
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            contentUrl: { type: 'string' },
            contentType: { type: 'string', enum: ['VIDEO', 'PDF', 'TEXT'] },
            difficulty: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
            isPremium: { type: 'boolean' },
            categoryId: { type: 'string', format: 'uuid' },
            tutorId: { type: 'string', format: 'uuid' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
            notes: { type: 'string' },
            learnerId: { type: 'string', format: 'uuid' },
            tutorId: { type: 'string', format: 'uuid' },
          },
        },
        Availability: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            dayOfWeek: { type: 'integer', minimum: 0, maximum: 6, description: '0=Sunday, 6=Saturday' },
            startTime: { type: 'string', description: 'e.g. 09:00' },
            endTime: { type: 'string', description: 'e.g. 17:00' },
            tutorId: { type: 'string', format: 'uuid' },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fileUrl: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'REVIEWED'] },
            submittedAt: { type: 'string', format: 'date-time' },
            assignmentId: { type: 'string', format: 'uuid' },
            learnerId: { type: 'string', format: 'uuid' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            feedback: { type: 'string' },
            grade: { type: 'string' },
            reviewedAt: { type: 'string', format: 'date-time' },
            submissionId: { type: 'string', format: 'uuid' },
            tutorId: { type: 'string', format: 'uuid' },
          },
        },
        Recommendation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            reason: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            lessonId: { type: 'string', format: 'uuid' },
          },
        },
        SkillAssessment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            skills: { type: 'object', description: 'Key-value pairs of skill names and levels' },
            score: { type: 'number' },
            feedback: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        LearningPath: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            lessons: { type: 'object', description: 'JSON array of lesson IDs' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            iconUrl: { type: 'string' },
          },
        },
        Achievement: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            criteria: { type: 'string' },
          },
        },
        UserPoints: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            points: { type: 'integer' },
            streak: { type: 'integer' },
            lastActive: { type: 'string', format: 'date-time' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
            paymentMethod: { type: 'string' },
            purpose: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            lessonId: { type: 'string', format: 'uuid' },
            bookingId: { type: 'string', format: 'uuid' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            plan: { type: 'string', enum: ['BASIC', 'PREMIUM', 'PRO'] },
            status: { type: 'string', enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/utils/auth.validation.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
