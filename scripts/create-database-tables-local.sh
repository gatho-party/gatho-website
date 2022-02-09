#!/usr/bin/env bash
set -e

dropdb matrix_events  --if-exists
createdb matrix_events

# Create tables
psql -d matrix_events -a -f ./data/schema.sql

# Import data
psql -d matrix_events -a -f ./data/import-csvs.sql

echo "Done."