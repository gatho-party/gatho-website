#!/usr/bin/env bash
set -e

dropdb gatho  --if-exists
createdb gatho

# Create tables
psql -d gatho -a -f ./data/schema.sql

echo "Done."
