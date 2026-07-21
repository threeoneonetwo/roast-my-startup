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
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        id TEXT PRIMARY KEY,
        startup_name TEXT NOT NULL,
        score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
        pitch TEXT NOT NULL,
        roast_line TEXT NOT NULL,
        submitted_at BIGINT NOT NULL
      )
    `.catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

export async function saveLeaderboardEntry(entry) {
  const sql = database();
  if (!sql) return false;
  await ensureSchema(sql);
  await sql`
    INSERT INTO leaderboard_entries (
      id, startup_name, score, pitch, roast_line, submitted_at
    ) VALUES (
      ${entry.id}, ${entry.startupName}, ${entry.score}, ${entry.pitch},
      ${entry.roastLine}, ${entry.submittedAt}
    )
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    DELETE FROM leaderboard_entries
    WHERE id IN (
      SELECT id FROM leaderboard_entries
      ORDER BY submitted_at DESC
      OFFSET 500
    )
  `;
  return true;
}

export async function getLeaderboardEntries() {
  const sql = database();
  if (!sql) return [];
  await ensureSchema(sql);
  const rows = await sql`
    SELECT
      id,
      startup_name AS "startupName",
      score,
      pitch,
      roast_line AS "roastLine",
      submitted_at AS "submittedAt"
    FROM leaderboard_entries
    ORDER BY score ASC, submitted_at DESC
    LIMIT 10
  `;
  return rows.map((entry) => ({
    ...entry,
    score: Number(entry.score),
    submittedAt: Number(entry.submittedAt),
  }));
}
