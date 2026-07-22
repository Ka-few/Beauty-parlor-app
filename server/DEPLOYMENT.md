# Supabase PostgreSQL and Render deployment

## Local development

From `server/`, copy `.env.example` to `.env` and set development secrets. Do not
set `DATABASE_URL` to use the default SQLite file at `instance/beauty_parlour.db`.

```bash
flask --app app db upgrade
python seed.py
flask --app app run
```

The seed is idempotent: it inserts only missing defaults and does not drop tables.

## Create Supabase database

1. Create a project at [Supabase](https://supabase.com/dashboard), choose its region,
   and save its database password securely.
2. In **Connect**, copy the PostgreSQL connection string. Prefer the pooler URL for
   Render if your project uses IPv4-only outbound networking; use the direct URL only
   when it is reachable from Render. Include `?sslmode=require` if Supabase supplies it.
3. The URL must look like `postgresql://USER:PASSWORD@HOST:PORT/postgres`.
   If the provider gives `postgres://`, this app converts it automatically.

## Configure Render

Create a Render Web Service with root directory `server`, build command
`pip install -r requirements.txt`, and start command `gunicorn wsgi:app`.
Set these environment variables in Render (mark secrets as secret):

| Variable | Value |
| --- | --- |
| `FLASK_ENV` | `production` |
| `DATABASE_URL` | Supabase PostgreSQL connection URL (including SSL option when supplied) |
| `SECRET_KEY` | long random application secret |
| `JWT_SECRET_KEY` | different long random JWT secret |
| `MPESA_*`, `BASE_URL` | retain the existing M-Pesa variables when payments are enabled |

Do not set a SQLite URL on Render. On boot the service checks all required production
variables and runs `SELECT 1`; a failed database check is logged and stops the service.

Open a Render Shell after the first deploy and run:

```bash
flask --app app db upgrade
python seed.py
```

Run these before directing traffic to the service. Later schema changes use:

```bash
flask --app app db migrate -m "describe the change"
flask --app app db upgrade
```

`flask db init` is only for a brand-new project without `migrations/`; this repository
already has its migration environment, so do not run it again.

## Import existing SQLite data

Back up `server/instance/beauty_parlour.db`. With Render/Supabase `DATABASE_URL` set,
first migrate the empty PostgreSQL database, then run locally from `server/`:

```bash
flask --app app db upgrade
python scripts/import_sqlite.py instance/beauty_parlour.db
python seed.py
```

The importer copies customer, service, stylist, association, booking, and review rows
with their IDs and advances PostgreSQL sequences. It can be re-run safely after an
interruption, but it is intended for an empty target; do not seed a target first.

## Verification checklist

- `flask --app app db current` reports the latest revision.
- `python seed.py` succeeds twice with no duplicate customers, services, stylists, or
  default bookings.
- Render startup logs `Database connection verified (postgresql)`.
- Sign in, list services/stylists, create a booking, and load the admin analytics page.
- Confirm new records remain after a Render redeploy and are visible in Supabase Table Editor.
