import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine, Base
from app.models.models import Ward

Base.metadata.create_all(bind=engine)

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "bengaluru_wards.json")


def seed():
    db = SessionLocal()
    try:
        count = db.query(Ward).count()
        if count > 0:
            print(f"Wards already seeded ({count} records). Skipping.")
            return

        with open(DATA_FILE) as f:
            wards = json.load(f)

        for w in wards:
            ward = Ward(
                id=w["id"],
                name=w["name"],
                zone=w.get("zone"),
                constituency=w.get("constituency"),
                mla_name=w.get("mla_name"),
                mla_party=w.get("mla_party"),
                mla_contact=w.get("mla_contact", ""),
            )
            db.merge(ward)

        db.commit()
        print(f"Seeded {len(wards)} Bengaluru wards.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
