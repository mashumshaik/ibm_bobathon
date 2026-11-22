#!/bin/bash
set -e

echo "Waiting for DB..."
until pg_isready -h db -U postgres; do
  sleep 1
done

echo "Running Alembic migrations..."
alembic upgrade head || python -c "
from app.db.database import engine, Base
from app.models.models import *
Base.metadata.create_all(bind=engine)
print('Tables created via SQLAlchemy.')
"

echo "Running seed..."
python db/seed.py

echo "Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
