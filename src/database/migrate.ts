import { readFile } from 'fs/promises';
import { join } from 'path';
import pool from '../config/database.js';
import { logger } from '../utils/index.js';

console.log(">>> SCRIPT STARTED: migrate.ts is running");
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
// Replace your existing CLI runner block with this:
const run = async () => {
  const command = process.argv[2];
  console.log(`>>> Received command: ${command}`);

  if (command === 'migrate') {
    const success = await runMigrations();
    process.exit(success ? 0 : 1);
  } else if (command === 'seed') {
    const success = await seedDatabase();
    process.exit(success ? 0 : 1);
  } else if (command === 'reset') {
    const mSuccess = await runMigrations();
    const sSuccess = await seedDatabase();
    process.exit(mSuccess && sSuccess ? 0 : 1);
  } else {
    console.log('Usage: npm run db:migrate | npm run db:seed | npm run db:reset');
    process.exit(1);
  }
};

// Start the execution
run();