import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";


dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "property_platform",
});

export default pool;