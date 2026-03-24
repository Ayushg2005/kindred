/**
 * CLEANUP SCRIPT — Deletes ALL user-generated data from the database.
 * Keeps the interests seed data intact.
 * Run: node backend/db/cleanup.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log('🔴 Starting database cleanup...');

    await client.query('BEGIN');

    // Delete in correct order (child → parent to avoid FK constraint errors)
    const r1 = await client.query('DELETE FROM messages');
    console.log(`✓ Deleted ${r1.rowCount} messages`);

    const r2 = await client.query('DELETE FROM conversations');
    console.log(`✓ Deleted ${r2.rowCount} conversations`);

    const r3 = await client.query('DELETE FROM matches');
    console.log(`✓ Deleted ${r3.rowCount} matches`);

    const r4 = await client.query('DELETE FROM swipes');
    console.log(`✓ Deleted ${r4.rowCount} swipes`);

    const r5 = await client.query('DELETE FROM user_interests');
    console.log(`✓ Deleted ${r5.rowCount} user-interest links`);

    const r6 = await client.query('DELETE FROM users');
    console.log(`✓ Deleted ${r6.rowCount} users`);

    await client.query('COMMIT');
    console.log('\n🟢 Database fully cleaned! Interests table preserved.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
