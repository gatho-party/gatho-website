#!/usr/bin/env bash
set -e

# Pass in Postgres DB as argument
# TODO: Exit if this doesn't exist
conn_string=$1

echo "Creating tables..."
psql "$conn_string" < data/schema.sql

echo "Done"
