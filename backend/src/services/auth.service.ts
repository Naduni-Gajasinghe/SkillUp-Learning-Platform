import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterInput, LoginInput } from '../utils/auth.validation';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: RegisterInput) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.authRepository.createUser(data, hashedPassword);

    return user;
  }

  async login(data: LoginInput) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    
    const payload = { userId: user.id, roles };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.authRepository.updatePassword(email, hashedPassword);
  }
}
