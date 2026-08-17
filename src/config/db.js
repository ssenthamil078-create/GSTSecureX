const { Pool } = require("pg");
const { databaseUrl } = require("./env");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("connect", () => {
  console.log("✅ Supabase PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

module.exports = pool;