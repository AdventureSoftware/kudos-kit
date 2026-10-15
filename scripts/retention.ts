
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DAYS = Number(process.env.FEEDBACK_RETENTION_DAYS ?? 90);

async function purge(): Promise<void> {
  if (!(DAYS > 0)) {
    console.log('FEEDBACK_RETENTION_DAYS is 0: feedback is kept, nothing to do.');
    return;
  }
  const deleted = await pool.query(
    `DELETE FROM feedback WHERE created_at < now() - make_interval(days => $1) AND NOT testimonial_ok`,
    [DAYS],
  );
  const trimmed = await pool.query(
    `UPDATE feedback SET ip = NULL, context = NULL, console_logs = NULL, errors = NULL
     WHERE testimonial_ok AND created_at < now() - make_interval(days => $1)
       AND (ip IS NOT NULL OR context IS NOT NULL OR console_logs IS NOT NULL OR errors IS NOT NULL)`,
    [DAYS],
  );
  console.log(`Deleted ${deleted.rowCount} rows older than ${DAYS} days; trimmed ${trimmed.rowCount} kept testimonials.`);
}

purge()
  .then(() => pool.end())
  .catch(err => { console.error(err); process.exit(1); });
