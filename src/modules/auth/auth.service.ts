import { User, LoginDto, RegisterDto, AuthResponse } from './auth.types.js';
import { DatabaseService } from '../../database/database.service.js';
import { logger } from '../../utils/logger.js';
import bcrypt from 'bcrypt';

const db = new DatabaseService();
const SALT_ROUNDS = 12;

export class AuthService {
  async register(userData: RegisterDto): Promise<AuthResponse> {
    logger.info('registering the user...');
    try {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(userData.email);
      console.log(existingUser);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash password
      logger.info('hashing password...');
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      
      // Create user with hashed password
      logger.info('creating user in database...');
      const user = await db.createUser({
        ...userData,
        password: hashedPassword
      });
      const token = `token_${user.id}_${Date.now()}`;
      
      return { user, token };
    } catch (error : any) {
      logger.error('Registration error:', error.message);
      throw error; // Re-throw the original error instead of creating a generic one
    }
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email with password hash
      const user = await db.getUserByEmailWithPassword(credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Remove password from user object before returning
      const { passwordHash, ...userWithoutPassword } = user;
      const token = `token_${user.id}_${Date.now()}`;
      
      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error('Login error:', error);
      throw new Error('Invalid credentials'); // Always return generic message for security
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      // Extract user ID from token (simple implementation)
      const match = token.match(/^token_([^_]+)_/);
      if (!match) return null;

      const userId = match[1];
      return await db.getUserById(userId);
    } catch (error) {
      return null;
    }
  }
}