/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Idempotent migration for the profile page fields.
 *
 * Adds telefone / whatsapp / instagram to `usuarios` if they are missing.
 * Safe to run on every deploy. Used as Railway's preDeployCommand so the
 * schema stays in sync without relying on drizzle-kit push in CI, which
 * hangs when there is no TTY.
 *
 * Uso local: node scripts/migrate-profile-fields.js
 * Requer: DATABASE_URL
 */
const dotenv = require('dotenv');
const postgres = require('postgres');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());
dotenv.config({ path: '.env.local', override: false });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL nao configurada.');
  process.exit(1);
}

async function main() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    // Each column is added in its own statement so a previously-partial
    // migration (one column already there) still completes cleanly.
    await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone TEXT`;
    await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS whatsapp TEXT`;
    await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS instagram TEXT`;
    console.log('[migrate] usuarios: telefone/whatsapp/instagram ok');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('[migrate] falhou:', err);
  process.exit(1);
});
