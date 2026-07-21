import { neon } from "@neondatabase/serverless";

let schemaPromise;

function database() {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!connectionString) return null;
  return neon(connectionString);
}

async function ensureSchema(sql) {
  if (!schemaPromise) {
    schemaPromise = sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        marketing_consent BOOLEAN NOT NULL DEFAULT TRUE,
        consent_recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

export async function saveContact({ email, fullName }) {
  const sql = database();
  if (!sql) return false;
  await ensureSchema(sql);
  await sql`
    INSERT INTO contacts (email, full_name, marketing_consent)
    VALUES (${email}, ${fullName}, TRUE)
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      marketing_consent = TRUE,
      consent_recorded_at = NOW(),
      updated_at = NOW()
  `;
  return true;
}
