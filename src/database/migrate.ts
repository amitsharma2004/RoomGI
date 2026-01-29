import { readFile } from 'fs/promises';
import { join } from 'path';
import pool from '../config/database.js';
import { logger } from '../utils/index.js';

export async function runMigrations() {
  try {
    logger.info('Running database migrations...');
    
    // Read and execute the initial schema migration
    const migrationPath = join(process.cwd(), 'src/database/migrations/001_initial_schema.sql');
    const migrationSQL = await readFile(migrationPath, 'utf-8');
    
    await pool.query(migrationSQL);
    logger.info('Database migrations completed successfully');
    
    return true;
  } catch (error) {
    logger.error('Migration failed:', error);
    return false;
  }
}

export async function seedDatabase() {
  try {
    logger.info('Seeding database with demo data...');
    
    const seedPath = join(process.cwd(), 'src/database/seed.sql');
    const seedSQL = await readFile(seedPath, 'utf-8');
    
    await pool.query(seedSQL);
    logger.info('Database seeded successfully');
    
    return true;
  } catch (error) {
    logger.error('Seeding failed:', error);
    return false;
  }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'migrate') {
    await runMigrations();
    process.exit(0);
  } else if (command === 'seed') {
    await seedDatabase();
    process.exit(0);
  } else if (command === 'reset') {
    await runMigrations();
    await seedDatabase();
    process.exit(0);
  } else {
    console.log('Usage: npm run db:migrate | npm run db:seed | npm run db:reset');
    process.exit(1);
  }
}