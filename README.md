# BBC Breakfast Forum 2.0 — nomination form

A church nomination form for BBC Breakfast Forum 2.0, backed by a Turso
(libSQL) database, with an admin view that lists submissions and exports
them as CSV.

## Structure

```
bbc-forum/
  api/
    submit.js        POST  /api/submit        save a nomination
    submissions.js   GET   /api/submissions    admin: list all nominations
    export.js        GET   /api/export         admin: download CSV
  lib/
    db.js             Turso client + schema setup
    auth.js           passcode check shared by the two admin endpoints
  index.html           public nomination form only, at your site's root
  admin/
    index.html          admin panel, at yoursite.com/admin — not linked
                         from index.html anywhere, so people filling out the
                         form never see it
  package.json
  .gitignore
  .env.example
```

No `vercel.json` — Vercel auto-detects `api/*.js` as serverless functions
and serves everything else as static, with zero config.

The admin panel lives at a separate URL (`/admin`) with no link to it
from the public form, so people submitting nominations have no way to
stumble onto it. Only share that URL directly with whoever needs admin
access. It also carries a `noindex` tag so search engines won't list it.

## Fresh setup, start to finish

### 1. Create the Turso database
Go to **https://turso.tech/app**, sign in, create a database. From its
page, copy:
- The database URL (`libsql://...`)
- An auth token (create one if you don't have one yet)

### 2. Push this project to a fresh GitHub repo
1. Create a **new, empty** repo on GitHub — do **not** check any box to
   add a README, .gitignore, or license this time, since this project
   already has its own.
2. In this folder:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 3. Import into Vercel
1. Go to **vercel.com/new** → **Import Git Repository** → select this repo.
2. On the import screen, before clicking Deploy, add three environment
   variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSCODE` (whatever passcode you want admins to use)
3. Leave Root Directory as `./` — this project's files sit at the top
   level, so no override is needed.
4. Click **Deploy**.

### 4. Test
1. Open your live URL, submit a test nomination.
2. Go to `yoursite.vercel.app/admin`, enter your passcode, confirm
   the test submission shows up.
3. Click **Export CSV**, confirm it opens correctly in Excel.

## Notes

- Tables are created automatically on first use — no manual migration.
- The passcode is the only access control (no per-admin accounts or audit
  trail) — fine for internal use, but not a full authentication system.
- If a Turso token is ever pasted somewhere it shouldn't be (chat, a
  public file, etc.), revoke and regenerate it from the Turso dashboard
  immediately — treat any exposed token as compromised.
