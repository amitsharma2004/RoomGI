import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { logger } from '../../utils/logger.js';

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;
      
      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
      }

      if (role !== 'tenant' && role !== 'owner') {
        return res.status(400).json({ error: 'Role must be either tenant or owner' });
      }

      const result = await this.authService.register({ email, password, role });
      logger.info('User registered successfully');
      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Registration failed:', error);
      
      // Handle specific database errors
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      res.status(400).json({ 
        error: error.message || 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await this.authService.login({ email, password });
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      // User should be attached by auth middleware
      const user = (req as any).user;
      res.json({ user });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}