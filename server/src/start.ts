import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

async function runMigrations() {
  console.log('Running database migrations...');

  // SSL: Use DATABASE_SSL env var (defaults to false for Coolify internal connections)
  const sslEnabled = process.env.DATABASE_SSL === 'true';

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get applied migrations
    const { rows: appliedMigrations } = await client.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const appliedSet = new Set(appliedMigrations.map((m) => m.name));

    // Get migration files
    const migrationsDir = path.join(__dirname, 'db/migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found, skipping migrations');
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    // Apply pending migrations
    let applied = 0;
    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✓ Applied: ${file}`);
          applied++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`✗ Failed: ${file}`, err);
          throw err;
        }
      }
    }

    if (applied === 0) {
      console.log('All migrations already applied');
    } else {
      console.log(`Applied ${applied} migration(s)`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function startServer() {
  // Run migrations first
  await runMigrations();

  // Then start the server by importing it
  console.log('Starting server...');
  await import('./index.js');
}

startServer().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
