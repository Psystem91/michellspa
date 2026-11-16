require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL");
}

if (!process.env.SUPABASE_CA_CERT) {
  throw new Error("Falta SUPABASE_CA_CERT");
}

const databaseUrl = new URL(process.env.DATABASE_URL);

databaseUrl.searchParams.delete("sslmode");
databaseUrl.searchParams.delete("sslrootcert");
databaseUrl.searchParams.delete("sslcert");
databaseUrl.searchParams.delete("sslkey");

const pool = new Pool({
  connectionString: databaseUrl.toString(),
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: {
    ca: process.env.SUPABASE_CA_CERT.replace(/\\n/g, "\n"),
    rejectUnauthorized: true
  }
});

pool.on("error", (error) => {
  console.error("Error PostgreSQL:", error.message);
});

module.exports = pool;