import { User, LoginDto, RegisterDto, AuthResponse } from './auth.types.js';
import { DatabaseService } from '../../database/database.service.js';

const db = new DatabaseService();

export class AuthService {
  async register(userData: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create user (in production, hash the password!)
      const user = await db.createUser(userData);
      const token = `token_${user.id}_${Date.now()}`;
      
      return { user, token };
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await db.getUserByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // In production, verify password hash here
      const token = `token_${user.id}_${Date.now()}`;
      
      return { user, token };
    } catch (error) {
      throw new Error('Login failed');
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