"""One-time import from the legacy SQLite file into the configured PostgreSQL DB.

Run `flask --app app db upgrade` first, set DATABASE_URL to PostgreSQL, then run
`python scripts/import_sqlite.py path/to/beauty_parlour.db` from server/.
"""

import sqlite3
import sys
from pathlib import Path

from sqlalchemy import text

from app import app, db


TABLES = ("customer", "service", "stylist", "stylist_service", "booking", "review")
SEQUENCE_TABLES = ("customer", "service", "stylist", "booking", "review")


def import_sqlite(source_path: Path) -> None:
    if not source_path.is_file():
        raise FileNotFoundError(f"SQLite database not found: {source_path}")

    if db.engine.url.get_backend_name() == "sqlite":
        raise RuntimeError("DATABASE_URL must point to PostgreSQL before importing SQLite data.")

    source = sqlite3.connect(source_path)
    source.row_factory = sqlite3.Row
    try:
        with db.engine.begin() as target:
            for table in TABLES:
                rows = source.execute(f'SELECT * FROM "{table}"').fetchall()
                for row in rows:
                    values = dict(row)
                    # The migration is safe to resume: already-imported primary keys are skipped.
                    if table != "stylist_service" and target.execute(
                        text(f'SELECT 1 FROM "{table}" WHERE id = :id'), {"id": values["id"]}
                    ).scalar():
                        continue
                    if table == "stylist_service" and target.execute(
                        text('SELECT 1 FROM stylist_service WHERE stylist_id = :stylist_id AND service_id = :service_id'), values
                    ).scalar():
                        continue
                    columns = ", ".join(f'"{column}"' for column in values)
                    parameters = ", ".join(f':{column}' for column in values)
                    target.execute(text(f'INSERT INTO "{table}" ({columns}) VALUES ({parameters})'), values)

            # IDs from SQLite were preserved, so advance PostgreSQL sequences before new inserts.
            for table in SEQUENCE_TABLES:
                target.execute(text(
                    "SELECT setval(pg_get_serial_sequence(:table_name, 'id'), "
                    "COALESCE((SELECT MAX(id) FROM \"" + table + "\"), 1), true)"
                ), {"table_name": table})
    finally:
        source.close()


if __name__ == "__main__":
    default_path = Path(__file__).resolve().parents[1] / "instance" / "beauty_parlour.db"
    source_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else default_path
    with app.app_context():
        import_sqlite(source_path)
    print(f"Imported legacy SQLite data from {source_path}")
