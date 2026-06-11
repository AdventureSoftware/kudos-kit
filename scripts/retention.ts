// scripts/retention.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function purge(): Promise<void> {
  const result = await pool.query(
    "DELETE FROM feedback WHERE created_at < now() - interval '90 days' RETURNING id",
  );
  console.log(`Purged ${result.rowCount} rows older than 90 days.`);
}

purge()
  .then(() => pool.end())
  .catch(err => { console.error(err); process.exit(1); });
