import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Determine if we're using a local database (no SSL needed)
const isLocalDatabase = process.env.DATABASE_URL?.includes('localhost') || 
                       process.env.DB_HOST === 'localhost';

// Use ONLY the connectionString if it exists; otherwise fall back.
const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
    };

const pool = new Pool({
  ...poolConfig
});

// Add this to catch errors that happen outside of your try/catch blocks
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;