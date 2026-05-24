#!/usr/bin/env python3
"""CLI entry point: python -m seeds.run (from backend-api directory)."""

import sys
from pathlib import Path

# Allow `python seeds/run.py` and `python -m seeds.run`
_backend_root = Path(__file__).resolve().parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

from app.config.database import SessionLocal, create_table
from app.model import *  # noqa: F401, F403 — register all models with SQLAlchemy
from seeds.seed_all import seed_all


def main():
    create_table()
    db = SessionLocal()
    try:
        seed_all(db)
        print("Database seeded successfully.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
