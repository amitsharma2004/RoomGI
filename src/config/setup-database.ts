import { readFile } from 'fs/promises';
import { join } from 'path';
import pool from './database.js';
import { logger } from '../utils/index.js';

export async function setupDatabase() {
  try {
    logger.info('Setting up database tables...');
    
    const migrationSQL = await readFile(join(process.cwd(), 'src/config/migrations.sql'), 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        // Ignore "already exists" errors
        if (!(error as any).message?.includes('already exists')) {
          logger.error(`Error executing statement: ${statement.substring(0, 100)}...`);
          logger.error((error as Error).message);
        }
      }
    }
    
    logger.info('✅ Database setup completed successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database setup failed:', (error as Error).message);
    return false;
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}