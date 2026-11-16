require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: true
  }
});

pool.on("error", (error) => {
  console.error("Error PostgreSQL:", error.message);
});

module.exports = pool;