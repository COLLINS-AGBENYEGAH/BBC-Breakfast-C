const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

let initialized = false;

async function ensureSchema() {
  if (initialized) return;

  await client.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      church_name TEXT,
      head_of_church TEXT,
      contact_person TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      auth_name TEXT,
      auth_title TEXT,
      auth_date TEXT,
      submitted_at TEXT
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS nominees (
      id TEXT PRIMARY KEY,
      submission_id TEXT,
      no INTEGER,
      full_name TEXT,
      title TEXT,
      responsibility TEXT,
      phone TEXT,
      FOREIGN KEY (submission_id) REFERENCES submissions(id)
    )
  `);

  initialized = true;
}

module.exports = { client, ensureSchema };
